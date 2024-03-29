const Home = window.httpVueLoader("./components/Home.vue");
const Register = window.httpVueLoader("./components/user/Register.vue");
const Login = window.httpVueLoader("./components/user/Login.vue");
const Panier = window.httpVueLoader("./components/Panier.vue");
const ArticleEdit = window.httpVueLoader("./components/admin/ArticleEdit.vue");
const ArticleDetail = window.httpVueLoader("./components/card/ArticleDetail.vue");
const Account = window.httpVueLoader("./components/user/Account.vue");
const ArticleCommandeTable = window.httpVueLoader("./components/admin/AllCommandeTable.vue");

const routes = [
  { path: "/", component: Home },
  { path: "/register", component: Register },
  { path: "/login", component: Login },
  { path: "/panier", component: Panier },
  { path: "/edit", component: ArticleEdit },
  { path: "/p/:id", component: ArticleDetail },
  { path: "/account", component: Account },
  { path: "/orders", component: ArticleCommandeTable }
];

const router = new VueRouter({
  routes,
});

var app = new Vue({
  router,
  el: "#app",
  data: {
    articles: [],
    panier: {
      createdAt: null,
      updatedAt: null,
      articles: [],
    },

    registerSuccess: false,
    registerError: false,
    registerErrorReason: "",

    loginSuccess: false,
    loginError: false,
    loginErrorReason: "",

    paiementError: false,

    connectedUser: "",
    isAdmin: false,
    payment: false,
  },
  async mounted() {
    const res = await axios.get("/api/articles");
    this.articles = res.data;
    // récupérer l’état actuel du panier côté serveur au démarrage de l’application
    const res2 = await axios.get("/api/panier");
    this.panier = res2.data;
    // savoir si l'utilisateur est déjà connecté
    try {
      const res3 = await axios.get("/api/me");
      this.connectedUser = res3.data.message;
      this.isAdmin = res3.data.admin;
    } catch (error) {
      this.connectedUser = "";
    }
  },
  methods: {
    /*
    ===============================================================
    GESTION CLIENTS
    ===============================================================
    */

    // Gestion register
    async registerUser(newUser) {
      try {
        await axios.post("api/register", newUser);
      } catch (error) {
        this.registerError = true;
        this.registerSuccess = false;
        this.registerErrorReason = `error ${error.response.status}: ${error.response.data["message"]}`;
        return;
      }

      this.registerSuccess = true;
      this.registerError = false;
    },

    // Gestion login
    async loginUser(user) {
      try {
        const result = await axios.post("api/login", user);
        this.isAdmin = result.data.admin;
      } catch (error) {
        this.loginError = true;
        this.loginSuccess = false;
        this.loginErrorReason = `error ${error.response.status}: ${error.response.data["message"]}`;
        return;
      }

      //nc récupération du panier_sql
      const panier_uptodate = await axios.get("api/panier/synch");
      //nc ajout du panier sql au panier actuel
      this.panier.articles = panier_uptodate.data.panier;
      console.log(panier_uptodate)

      this.loginSuccess = true;
      this.loginError = false;
      this.connectedUser = user.email;
    },

    // Gestion disconnect
    async logoutUser() {
      console.log("try logout");
      try {
        await axios.post("api/logout");
      } catch (error) {
        this.loginErrorReason = `error ${error.response.status}: ${error.response.data["message"]}`;
        return;
      }

      this.connectedUser = "";

      location.href = "/#/";
      location.reload;
    },

    /*
    ===============================================================
    GESTION PANIER
    ===============================================================
    */

    // Effectuer la requête à l’API POST /api/panier afin d’ajouter l’article au panier
    async addToPanier(articleId) {
      const res = await axios.post("/api/panier", {
        id: articleId,
        quantity: 1,
      });
      this.panier.articles.push(res.data);
    },

    // Effectuer la requête à l’API DELETE /api/panier pour supprimer l’article du panier
    async removeFromPanier(articleId) {
      await axios.delete("/api/panier/" + articleId);
      const index = this.panier.articles.findIndex((a) => a.id === articleId);
      this.panier.articles.splice(index, 1);
    },

    // Modifer la quantité d'un article du panier à l'aide de la requête PUT /api/panier
    async modifyArticlePanier(editArticle) {
      await axios.put("/api/panier/" + editArticle.id, {
        quantity: editArticle.quantity,
      });
      const index = this.panier.articles.findIndex(
        (a) => a.id === editArticle.id
      );
      this.panier.articles[index]["quantity"] = editArticle.quantity;
    },

    // Effectuer la requête à l’API POST /api/panier/payer pour payer le panier
    async payPanier(totalPanier) {
      try {
        await axios.post("api/panier/pay", { total: totalPanier });
        this.paiementError = false;
        this.payment = true;

        setInterval(() => {
          location.href = "/#/";
          location.reload();
        }, 3000);
      } catch (error) {
        this.paiementError = true;
      }
    },

    /*
    ===============================================================
    GESTION ARTICLES
    ===============================================================
    */
    async addArticle(article) {
      const res = await axios.post("/api/article", article);
      this.articles.push(res.data);
    },

    async updateArticle(newArticle) {
      await axios.put("/api/article/" + newArticle.id, newArticle);
      const article = this.articles.find((a) => a.id === newArticle.id);
      article.name = newArticle.name;
      article.description = newArticle.description;
      article.image = newArticle.image;
      article.price = newArticle.price;
    },

    async deleteArticle(articleId) {
      await axios.delete("/api/article/" + articleId);
      const index = this.articles.findIndex((a) => a.id === articleId);
      this.articles.splice(index, 1);
    },
  },
});
