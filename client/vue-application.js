const Home = window.httpVueLoader('./components/Home.vue')
const Register = window.httpVueLoader('./components/Register.vue')
const Login = window.httpVueLoader('./components/Login.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register },
  { path: '/login', component: Login }
]

const router = new VueRouter({
  routes
})

var app = new Vue({
  router,
  el: '#app',
  data: {
    articles: [],
    panier: {
      createdAt: null,
      updatedAt: null,
      articles: []
    },

    registerSuccess: false,
    registerError: false,
    registerErrorReason: '',

    loginSuccess: false,
    loginError: false,
    loginErrorReason: '',

    connectedUser: "",
    payment: false
  },
  async mounted() {
    const res = await axios.get('/api/articles')
    this.articles = res.data
    // récupérer l’état actuel du panier côté serveur au démarrage de l’application
    const res2 = await axios.get('/api/panier')
    this.panier = res2.data
    // savoir si l'utilisateur est déjà connecté
    try {
      const res3 = await axios.get('/api/me')
      this.connectedUser = res3.data.message
    } catch (error) {
      this.connectedUser = ''
    }
  },
  methods: {
    // Gestion register
    async registerUser(newUser) {
      try {
        await axios.post('api/register', newUser)
      } catch (error) {
        this.registerError = true
        this.registerSuccess = false
        this.registerErrorReason = `error ${error.response.status}: ${error.response.data['message']}`
        return
      }

      this.registerSuccess = true
      this.registerError = false
    },

    // Gestion login
    async loginUser(user) {
      try {
        await axios.post('api/login', user)
      } catch (error) {
        this.loginError = true
        this.loginSuccess = false
        this.loginErrorReason = `error ${error.response.status}: ${error.response.data['message']}`
        return
      }

      this.loginSuccess = true
      this.loginError = false
      this.connectedUser = user.email
    },

    // Effectuer la requête à l’API POST /api/panier afin d’ajouter l’article au panier
    async addToPanier(articleId) {
      const res = await axios.post('/api/panier', {id: articleId, quantity:1})
      this.panier.articles.push(res.data)
    },

    // Effectuer la requête à l’API DELETE /api/panier pour supprimer l’article du panier
    async removeFromPanier(articleId) {
      await axios.delete('/api/panier/' + articleId)
      const index = this.panier.articles.findIndex(a => a.id === articleId)
      this.panier.articles.splice(index, 1)
    },

  }
})