const express = require("express");
const router = express.Router();
var articles = [];

const bcrypt = require("bcrypt");
const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  password: "ultrasecurepwd",
  database: "fruit-store",
});

client.connect();

class Panier {
  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.articles = [];
    this.panier_sql = [];
  }
}

/**
 * Dans ce fichier, vous trouverez des exemples de requêtes GET, POST, PUT et DELETE
 * Ces requêtes concernent l'ajout ou la suppression d'articles sur le site
 *
 */

/**
 * Notre mécanisme de sauvegarde des paniers des utilisateurs sera de simplement leur attribuer un panier grâce à req.session, sans authentification particulière
 */
router.use((req, res, next) => {
  // l'utilisateur n'est pas reconnu, lui attribuer un panier dans req.session
  if (typeof req.session.panier === "undefined") {
    req.session.panier = new Panier();
  }
  next();
});

/**
 * Recupérer articles du serveur
 */
router.use(async (req, res, next) => {
  const sql = "SELECT * FROM articles";
  const result = await client.query({
    text: sql,
  });

  // mis à jour cache articles serveur
  articles = result.rows;
  next();
});

/* ===========================================================================
   ============================== GESTION PANIER =============================
   =========================================================================== */

/*
 * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
 */
router.get("/panier", async (req, res) => {
  const id = req.session.userId;

  // Si l’utilisateur n’est pas connecté, retourner le panier du cookie
  if (typeof id === "undefined") {
    res.json(req.session.panier);
  } else {
    // Sinon, renvoyer le panier sql
    sql = "SELECT panier FROM users WHERE id=$1";
    const result = await client.query({
      text: sql,
      values: [id],
    });
    console.log(result.rows[0].panier);

    var panierSQL = result.rows[0].panier;
    var panierJSON = JSON.parse(JSON.stringify(req.session.panier));
    var articlesPanier = [];

    // conversion panierSQL en panierSession
    for (let index = 0; index < panierSQL.length; index++) {
      const articleId = panierSQL[index];
      const aIndex = articlesPanier.findIndex((a) => a.id === articleId);
      if (aIndex === -1) {
        articlesPanier.push({ id: articleId, quantity: 1 });
      } else {
        articlesPanier[aIndex]["id"] = articleId;
        articlesPanier[aIndex]["quantity"]++;
      }
    }

    panierJSON.articles = articlesPanier;
    panierJSON.panier_sql = panierSQL;

    res.json(panierJSON);
  }
});

/*
 * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
 * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
 */
router.post("/panier", async function (req, res) {
  const articleId = parseInt(req.body.id);
  const articleQuantity = parseInt(req.body.quantity);
  var sessionPannier = req.session.panier;

  // * Vérifier qu’un article ayant l’id demandé existe bien grâce au tableau articles
  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: "articleId should be a number" });
    return;
  }
  if (!articles.some((a) => a.id === articleId)) {
    res
      .status(404)
      .json({ message: "article " + articleId + " does not exist" });
    return;
  }
  // Vérifiez que la quantité envoyée est un nombre entier strictement positif
  if (articleQuantity <= 0) {
    res.status(400).json({ message: "quantity must be greater than 0" });
    return;
  }
  // Emettre une erreur si l'article avait déjà été ajouté au panier
  if (sessionPannier.articles.some((a) => a.id === articleId)) {
    res.status(400).json({
      message: `article ${articleId} had already been added to the shopping cart`,
    });
    return;
  }

  // ajouter l'article ainsi que sa quantité au panier
  var articlePanier = { id: articleId, quantity: articleQuantity };
  sessionPannier.articles.push(articlePanier);

  //si utilisateur connecté mise à jour du panier sql
  if (!isNaN(req.session.userId)) {
    for (let i = 0; i < articleQuantity; i++) {
      const sql = "UPDATE users SET panier=array_append(panier,$1) WHERE id=$2";
      client.query({
        text: sql,
        values: [articleId, req.session.userId],
      });
      sessionPannier.panier_sql.push(articleId);
    }
  }

  console.log("POST panierSQL:", sessionPannier.panier_sql);

  // on envoie l'article mis à jour
  res.json(articlePanier);
});

//une route pour renvoyer le panier updater après le login //inutile
router.get("/panier/synch", function (req, res) {
  res.json({ panier: req.session.panier.articles });
  return;
});

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */
router.post("/panier/pay", async function (req, res) {
  const id = req.session.userId;
  const total = Number.parseFloat(req.body.total);

  // Si l’utilisateur n’est pas connecté, lui retourner une erreur 401
  if (typeof id === "undefined") {
    res.status(401).json({ message: "user not logged in!" });
    return;
  }

  if (req.session.panier.articles.length < 1) {
    res.status(403).json({ message: "le panier est vide" });
    return;
  }

  const sql = "SELECT email FROM users WHERE id=$1";
  const result = await client.query({
    text: sql,
    values: [id],
  });

  const email = result.rows[0]["email"];

  //enregistrement de la commande
  const sql2 =
    "INSERT INTO commandes (date,articles,total,user_id)\nVALUES ($1,$2,$3,$4)";
  await client.query({
    text: sql2,
    values: [
      new Date().toISOString(),
      req.session.panier.panier_sql,
      total,
      id,
    ],
  });

  //suppression du panier coté sql
  const sql3 = "UPDATE users SET panier=$1 WHERE id=$2";
  await client.query({
    text: sql3,
    values: [[], req.session.userId],
  });

  // nouveau panier
  req.session.panier = new Panier();
  res.send({ message: `Merci ${email} pour votre achat` });
});

/*
 * Cette route doit permettre de changer la quantité d'un article dans le panier
 * Le body doit contenir la quantité voulue
 */
router.put("/panier/:articleId", async function (req, res) {
  const articleId = parseInt(req.params.articleId);
  const articleQuantity = parseInt(req.body.quantity);
  var sessionPannier = req.session.panier;

  // Refuser un article qui n’a pas déjà été ajouté au panier
  if (!sessionPannier.articles.some((a) => a.id === articleId)) {
    res.status(404).json({
      message: `article ${articleId} has not been found in the shopping cart`,
    });
    return;
  }
  // Refuser les valeurs négatives ou nulles
  if (articleQuantity <= 0) {
    res.status(400).json({ message: "quantity must be greater than 0" });
    return;
  }

  // changer la quantité d'un article dans le panier
  var indexArticle = sessionPannier.articles.findIndex(
    (a) => a.id === articleId
  );

  if (indexArticle != -1) {
    const quantity_diff =
      sessionPannier.articles[indexArticle]["quantity"] - articleQuantity;
    console.log("quantity_diff:", quantity_diff);
    sessionPannier.articles[indexArticle]["quantity"] = articleQuantity;

    //mise à jour du panier sql
    if (!isNaN(req.session.userId)) {
      //changement de la quantité dans le panier_sql
      console.log(sessionPannier.panier_sql);
      if (quantity_diff < 0) {
        //cas ajout
        console.log("+");
        for (i = 0; i < Math.abs(quantity_diff); i++) {
          sessionPannier.panier_sql.push(articleId);
        }
      } else if (quantity_diff > 0) {
        //cas diminution
        for (i = 0; i < Math.abs(quantity_diff); i++) {
          console.log("-");
          var indexArticle_sql = sessionPannier.panier_sql.indexOf(articleId);
          sessionPannier.panier_sql.splice(indexArticle_sql, 1);
        }
      }
      console.log("Panier SQL:", sessionPannier.panier_sql);

      const sql = "UPDATE users SET panier=$1 WHERE id=$2";
      await client.query({
        text: sql,
        values: [sessionPannier.panier_sql, req.session.userId],
      });
    }

    // on envoie l'article mis à jour
    res.json(sessionPannier.articles[indexArticle]);
  }
});

/*
 * Cette route doit supprimer un article dans le panier
 */
router.delete("/panier/:articleId", async function (req, res) {
  const articleId = parseInt(req.params.articleId);
  var sessionPannier = req.session.panier;

  // Refuser un article qui n’a pas déjà été ajouté au panier
  if (!sessionPannier.articles.some((a) => a.id === articleId)) {
    res.status(404).json({
      message: `article ${articleId} has not been found in the shopping cart`,
    });
    return;
  }

  // Supprimer l'article à supprimer
  var indexArticle = sessionPannier.articles.findIndex(
    (a) => a.id === articleId
  );
  sessionPannier.articles.splice(indexArticle, 1); // remove the article from the array

  //update du panier sql
  if (!isNaN(req.session.userId)) {
    //supprimer tout tout les apparition de l'article dans le panier_sql
    do {
      var indexArticle_sql = sessionPannier.panier_sql.indexOf(articleId);
      sessionPannier.panier_sql.splice(indexArticle_sql, 1);
    } while (sessionPannier.panier_sql.indexOf(articleId) != -1);

    const sql = "UPDATE users SET panier=$1 WHERE id=$2";
    await client.query({
      text: sql,
      values: [sessionPannier.panier_sql, req.session.userId],
    });
  }
  // on envoie le panier mis à jour
  res.json(sessionPannier);
});

/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get("/articles", async (req, res) => {
  const sql = "SELECT * FROM articles";
  const result = await client.query({
    text: sql,
  });
  res.json(result.rows);
});

/* ===========================================================================
   ============================= GESTION COMMANDES ===========================
   =========================================================================== */

router.get("/orders", async (req, res) => {
  // Si utilisateur pas authentifié, pas de commande
  const id = req.session.userId;

  if (typeof id === "undefined") {
    res.status(401).json({ message: "user not logged in!" });
    return;
  }

  // Verifier si user est un admin, si oui, accès à toutes les commandes
  const sql = "SELECT admin FROM users WHERE id=$1";
  const result = await client.query({
    text: sql,
    values: [id],
  });

  const admin = result.rows[0].admin;

  const sql2 = "SELECT * FROM commandes\nORDER BY id ASC";
  const result2 = await client.query({
    text: sql2,
  });

  var commandes = result2.rows;

  // Si user n'est pas admin, retourner que ses commandes
  if (!admin) {
    commandes = commandes.filter((commande) => commande.user_id === id);
  }

  res.json({ commandes });
});

/* ===========================================================================
   ============================= GESTION ARTICLES ============================
   =========================================================================== */

/**
 * Cette route crée un article.
 */
router.post("/article", async (req, res) => {
  if (req.session.admin) {
    const name = req.body.name;
    const description = req.body.description;
    const image = req.body.image;
    const price = parseFloat(req.body.price);
    console.log(price);

    // vérification de la validité des données d'entrée
    if (
      typeof name !== "string" ||
      name === "" ||
      typeof description !== "string" ||
      description === "" ||
      typeof image !== "string" ||
      image === "" ||
      isNaN(price) ||
      price <= 0
    ) {
      res.status(400).json({ message: "bad request" });
      return;
    }
    //éventuellemnt ajouter un test pour si un article similaire existe déja
    const sql =
      "INSERT INTO articles (name,description,image,price)\nVALUES ($1,$2,$3,$4)";
    await client.query({
      text: sql,
      values: [name, description, image, price],
    });

    const article = {
      id: articles.length + 1, // pour que vue-application récupère l'id
      name: name,
      description: description,
      image: image,
      price: price,
    };
    articles.push(article);
    // on envoie l'article ajouté à l'utilisateur
    res.json(article);
  } else {
    res.status(403).json({ message: "forbidden" });
  }
});

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
function parseArticle(req, res, next) {
  const articleId = parseInt(req.params.articleId);

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: "articleId should be a number" });
    return;
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId;

  const article = articles.find((a) => a.id === req.articleId);
  if (!article) {
    res
      .status(404)
      .json({ message: "article " + articleId + " does not exist" });
    return;
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = article;
  next();
}

router
  .route("/article/:articleId")
  /**
   * Cette route envoie un article particulier
   */
  .get(parseArticle, async (req, res) => {
    // req.article existe grâce au middleware parseArticle
    const sql = "SELECT * FROM articles WHERE id=$1";
    const result = await client.query({
      text: sql,
      values: [req.articleId],
    });

    res.json(result.rows);
  })

  /**
   * Cette route modifie un article.
   */
  .put(parseArticle, async (req, res) => {
    if (req.session.admin) {
      const name = req.body.name;
      const description = req.body.description;
      const image = req.body.image;
      const price = parseFloat(req.body.price);

      const sql =
        "UPDATE articles SET name=$1, description=$2, image=$3, price=$4 WHERE id=$5";
      await client.query({
        text: sql,
        values: [name, description, image, price, req.articleId],
      });

      res.send({ message: "article mis à jour" });
    } else {
      res.status(403).json({ message: "forbidden" });
    }
  })

  .delete(parseArticle, async (req, res) => {
    if (req.session.admin) {
      const sql = "DELETE FROM articles WHERE id=$1";
      await client.query({
        text: sql,
        values: [req.articleId],
      });

      res.send({ message: "article supprimé" });
    } else {
      res.status(403).json({ message: "forbidden" });
    }
  });

/* ===========================================================================
   ============================== GESTION CLIENT =============================
   =========================================================================== */

/**
 *  router permettant d'obtenir tous les utilisateurs
 */
router.get("/all_users", async function (req, res) {
  if (req.session.admin) {
    const sql = "SELECT id,email FROM users";
    const result = await client.query({
      text: sql,
    });

    var users

    res.json({ users: result.rows })
  } else {
    res.status(403).json({ message: "forbidden" });
  }
});

/**
 * route POST /register dont l’objectif d’inscrire un utilisateur
 */
router.post("/register", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  // Vérifier si un utilisateur avec cet email n’existe pas déjà dans la table users
  const sql = "SELECT * FROM users WHERE email=$1";
  const result = await client.query({
    text: sql,
    values: [email],
  });

  if (result.rows.length != 0) {
    res.status(401).json({ message: `user ${email} already exist!` });
    return;
  }

  // Si tout est bon, hasher le mot de passe grâce à la fonction bcrypt.hash
  const hash = await bcrypt.hash(password, 10);

  // Stocker enfin l’utilisateur avec son mot de passe hashé
  const sql2 = "INSERT INTO users (email, password, panier)\nVALUES ($1,$2,$3)";
  await client.query({
    text: sql2,
    values: [email, hash, []],
  });

  res.json({ message: `${email} added!` });
});

/**
 * route POST /login permettant à l'utilisateur de se connecter à son espace client
 */
router.post("/login", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  // Vérifier que l’utilisateur existe...
  const sql = "SELECT * FROM users WHERE email=$1";
  const result = await client.query({
    text: sql,
    values: [email],
  });

  if (result.rows.length === 0) {
    res.status(401).json({ message: `cannot found user ${email}!` });
    return;
  }

  // stocker id trouvé
  const id = result.rows[0]["id"];
  const admin = result.rows[0]["admin"] ? true : false;
  req.session.admin = admin;

  // ... et que la forme hashée du mot de passe correspond à ce qui est base avec bcrypt.compare
  if (await bcrypt.compare(password, result.rows[0].password)) {
    // congrats

    // vérifier si l'utilisateur ne sait pas connecté
    if (req.session.userId === id) {
      // à modifier si necessaire
      res
        .status(401)
        .json({
          message: `${result.rows[0]["email"]} already connected!`,
          admin: admin,
        });
      return;
    } else {
      req.session.userId = result.rows[0]["id"];
    }
  } else {
    // go out !
    res.status(401).json({ message: "bad password!" });
    return;
  }

  // connexion confirmé ici
  // récupération du panier utilisateur pour synchroniser les deux paniers
  const newpaniersql = parse_panier(result.rows[0].panier, req.session.panier);
  req.session.panier.panier_sql = newpaniersql;
  //update du panier sql (ajout des articles du panier hors connection)

  const sql3 = "UPDATE users SET panier=$1 WHERE id=$2";
  await client.query({
    text: sql3,
    values: [newpaniersql, id],
  });

  res.json({ message: `${email} logged`, admin: admin });
});

router.post("/logout", async (req, res) => {
  req.session.destroy();

  res.json({ message: "user déconnecté" });
});

/**
 * route GET /me, qui retourne simplement l’utilisateur actuellement connecté
 */
router.get("/me", async function (req, res) {
  const id = req.session.userId;

  // Si l’utilisateur n’est pas connecté, lui retourner une erreur 401
  if (typeof id === "undefined") {
    res.status(401).json({ message: "user not logged in!" });
    return;
  }

  const sql = "SELECT * FROM users WHERE id=$1";
  const result = await client.query({
    text: sql,
    values: [id],
  });

  const email = result.rows[0]["email"];
  const admin = result.rows[0]["admin"] ? true : false;
  res.json({ message: email, admin: admin });
});

/* ======================== FONCTIONS CONNEXES ======================== */

//fonction ayant pour role de synchroniser les données du sql et de la session
function parse_panier(panier_sql, panier_serveur) {
  //ajout des informations du panier serveur sql au info du panier.articles de la session
  for (id of panier_sql) {
    var index = panier_serveur.articles.findIndex((a) => a.id === id);
    if (index !== -1) {
      panier_serveur.articles[index].quantity++;
    } else {
      panier_serveur.articles.push({ id: id, quantity: 1 });
    }
  }

  // mise à jour du panier sql
  var newpaniersql = [];
  for (i = 0; i < panier_serveur.articles.length; i++) {
    for (j = 0; j < panier_serveur.articles[i].quantity; j++) {
      newpaniersql.push(panier_serveur.articles[i].id);
    }
  }

  console.log("Résultat sychro:");
  console.log(newpaniersql);
  console.log(panier_serveur.articles);
  return newpaniersql;
}

module.exports = router;
