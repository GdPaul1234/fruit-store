const express = require('express')
const router = express.Router()
const articles = require('../data/articles.js')

const bcrypt = require('bcrypt')
const { Client } = require('pg')

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  password: 'ultrasecurepwd',
  database: 'fruit-store'
})

client.connect()

class Panier {
  constructor() {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.articles = []
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
  if (typeof req.session.panier === 'undefined') {
    req.session.panier = new Panier()
  }
  next()
})

/*
 * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
 */
router.get('/panier', (req, res) => {
  res.json(req.session.panier)
})

/*
 * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
 * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
 */
router.post('/panier', (req, res) => {
  // CGSoft E2.2
  const articleId = parseInt(req.body.id)
  const articleQuantity = parseInt(req.body.quantity)
  var sessionPannier = req.session.panier

  // * Vérifier qu’un article ayant l’id demandé existe bien grâce au tableau articles
  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  if (!articles.some(a => a.id === articleId)) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // Vérifiez que la quantité envoyée est un nombre entier strictement positif
  if (articleQuantity <= 0) {
    res.status(400).json({ message: 'quantity must be greater than 0' })
    return
  }
  // Emettre une erreur si l'article avait déjà été ajouté au panier
  if (sessionPannier.articles.some(a => a.id === articleId)) {
    res.status(400).json({ message: `article ${articleId} had already been added to the shopping cart` })
    return
  }

  // ajouter l'article ainsi que sa quantité au panier
  var articlePanier = { id: articleId, quantity: articleQuantity }
  sessionPannier.articles.push(articlePanier)
  // on envoie l'article mis à jour
  res.json(articlePanier)
})

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */
router.post('/panier/pay', async function(req, res) {
  // CGSoft E5
  const id = req.session.userId

  // Si l’utilisateur n’est pas connecté, lui retourner une erreur 401
  if (typeof id === 'undefined') {
    res.status(401).json({ message: 'user not logged in!' })
    return
  }

  const sql = "SELECT email FROM users WHERE id=$1"
  const result = await client.query({
    text: sql,
    values: [id]
  })

  const email = result.rows[0]['email']

    req.session.destroy()
    res.send({ message: `Merci ${email} pour votre achat` })

})

/*
 * Cette route doit permettre de changer la quantité d'un article dans le panier
 * Le body doit contenir la quantité voulue
 */
router.put('/panier/:articleId', (req, res) => {
  // CGSoft E2.3
  const articleId = parseInt(req.params.articleId)
  const articleQuantity = parseInt(req.body.quantity)
  var sessionPannier = req.session.panier

  // Refuser un article qui n’a pas déjà été ajouté au panier
  if (!sessionPannier.articles.some(a => a.id === articleId)) {
    res.status(404).json({ message: `article ${articleId} has not been found in the shopping cart` })
    return
  }
  // Refuser les valeurs négatives ou nulles
  if (articleQuantity <= 0) {
    res.status(400).json({ message: 'quantity must be greater than 0' })
    return
  }

  // changer la quantité d'un article dans le panier
  var indexArticle = sessionPannier.articles.findIndex(a => a.id === articleId)
  if (indexArticle != -1) {
    sessionPannier.articles[indexArticle]['quantity'] = articleQuantity
    // on envoie l'article mis à jour
    res.json(sessionPannier.articles[indexArticle])
  }
})

/*
 * Cette route doit supprimer un article dans le panier
 */
router.delete('/panier/:articleId', (req, res) => {
  // CGSoft E2.4
  const articleId = parseInt(req.params.articleId)
  var sessionPannier = req.session.panier

  // Refuser un article qui n’a pas déjà été ajouté au panier
  if (!sessionPannier.articles.some(a => a.id === articleId)) {
    res.status(404).json({ message: `article ${articleId} has not been found in the shopping cart` })
    return
  }

  // Supprimer l'article à supprimer
  var indexArticle = sessionPannier.articles.findIndex(a => a.id === articleId)
  sessionPannier.articles.splice(indexArticle, 1) // remove the article from the array
  // on envoie le panier mis à jour
  res.json(sessionPannier)
})


/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get('/articles', (req, res) => {
  res.json(articles)
})

/**
 * Cette route crée un article.
 * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
 * NOTE: lorsqu'on redémarre le serveur, l'article ajouté disparait
 *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
 */
router.post('/article', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const image = req.body.image
  const price = parseInt(req.body.price)

  // vérification de la validité des données d'entrée
  if (typeof name !== 'string' || name === '' ||
    typeof description !== 'string' || description === '' ||
    typeof image !== 'string' || image === '' ||
    isNaN(price) || price <= 0) {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const article = {
    id: articles.length + 1,
    name: name,
    description: description,
    image: image,
    price: price
  }
  articles.push(article)
  // on envoie l'article ajouté à l'utilisateur
  res.json(article)
})

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
function parseArticle(req, res, next) {
  const articleId = parseInt(req.params.articleId)

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId

  const article = articles.find(a => a.id === req.articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = article
  next()
}

router.route('/article/:articleId')
  /**
   * Cette route envoie un article particulier
   */
  .get(parseArticle, (req, res) => {
    // req.article existe grâce au middleware parseArticle
    res.json(req.article)
  })

  /**
   * Cette route modifie un article.
   * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
   * NOTE: lorsqu'on redémarre le serveur, la modification de l'article disparait
   *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
   */
  .put(parseArticle, (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    req.article.name = name
    req.article.description = description
    req.article.image = image
    req.article.price = price
    res.send()
  })

  .delete(parseArticle, (req, res) => {
    const index = articles.findIndex(a => a.id === req.articleId)

    articles.splice(index, 1) // remove the article from the array
    res.send()
  })


/** 
 * route POST /login dont l’objectif d’inscrire un utilisateur
 */
router.post('/register', async function (req, res) {
  const email = req.body.email
  const password = req.body.password

  // Vérifier si un utilisateur avec cet email n’existe pas déjà dans la table users
  const sql = "SELECT * FROM users WHERE email=$1"
  const result = await client.query({
    text: sql,
    values: [email]
  })

  if (result.rows.length != 0) {
    res.status(401).json({ message: `user ${email} already exist!` })
    return
  }

  // Si tout est bon, hasher le mot de passe grâce à la fonction bcrypt.hash
  const hash = await bcrypt.hash(password, 10)

  // Stocker enfin l’utilisateur avec son mot de passe hashé
  const sql2 = 'INSERT INTO users (email, password)\nVALUES ($1,$2)'
  await client.query({
    text: sql2,
    values: [email, hash]
  })

  res.json({ message: `${email} added!` })
});

/**
 * route POST /login permettant à l'utilisateur de se connecter à son espace client
 */
router.post('/login', async function (req, res) {
  const email = req.body.email
  const password = req.body.password

  // Vérifier que l’utilisateur existe...
  const sql = "SELECT * FROM users WHERE email=$1"
  const result = await client.query({
    text: sql,
    values: [email]
  })

  if (result.rows.length === 0) {
    res.status(401).json({ message: `cannot found user ${email}!` })
    return
  }
  // ... et que la forme hashée du mot de passe correspond à ce qui est base avec bcrypt.compare
  if (await bcrypt.compare(password, result.rows[0].password)) {
    // congrats

    // vérifier si l'utilisateur ne sait pas connecté
    const id = result.rows[0]['id']
    if (req.session.userId === id) { // à modifier si necessaire
      res.status(401).json({ message: `${result.rows[0]['email']} already connected!` })
      return
    } else {
      req.session.userId = result.rows[0]['id']
    }

  } else {
    // go out !
    res.status(401).json({ message: 'bad password!' })
    return
  }

  res.json({ message: `${email} logged` })
})

/**
 * route GET /me, qui retourne simplement l’utilisateur actuellement connecté
 */
router.get('/me', async function (req, res) {
  const id = req.session.userId

  // Si l’utilisateur n’est pas connecté, lui retourner une erreur 401
  if (typeof id === 'undefined') {
    res.status(401).json({ message: 'user not logged in!' })
    return
  }

  const sql = "SELECT email FROM users WHERE id=$1"
  const result = await client.query({
    text: sql,
    values: [id]
  })

  const email = result.rows[0]['email']
  res.json({ message: email })

})

module.exports = router
