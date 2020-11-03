<template>
  <div>
    <div class="search">
      <span>Rechercher</span>
      <input
        type="search"
        id="query"
        v-model="searchQuery"
        placeholder=" banane, pomme, poire..."
      />
    </div>

    <component :is="articleComponent"
     :articles="searchArticles" :panier="panier"
     @add-to-home-panier="addToHomePanier"
     @remove-from-home-panier="removeFromHomePanier" >
    </component>
  </div>
</template>

<script>
const ArticleCard = window.httpVueLoader("./components/card/ArticleCard.vue");
const ArticleCardMobile = window.httpVueLoader("./components/card/ArticleCardMobile.vue");

module.exports = {
  components: {
    ArticleCard,
    ArticleCardMobile
  },
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object },
  },
  data() {
    return {
      articleComponent: 'ArticleCard',
      searchQuery: ''
    };
  },
  computed: {
    searchArticles() {
      var result = [];
      if (this.searchQuery !== "") {
        for (let index = 0; index < this.articles.length; index++) {
          const element = this.articles[index];
          const articleName = element.name.toLowerCase();
          const articleDesc = element.description.toLowerCase();
          const search = this.searchQuery.toLowerCase();
          if (articleName.includes(search) || articleDesc.includes(search)) {
            result.push(element);
          }
        }
      } else {
        result = this.articles;
      }

      return result;
    },
  },
  mounted () {
    // Déterminer si on est sur un petit écran (max-width: 530px)
    this.articleComponent = (screen.width < 530) ? 'ArticleCardMobile' : 'ArticleCard'

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize",
     () => {
       this.articleComponent = (screen.width < 530) ? 'ArticleCardMobile' : 'ArticleCard'
       });
  },
  methods: {
    // déclenche l’événement add-to-panier en transmettant l’id de l’article
    addToHomePanier(articleId) {
      this.$emit("add-to-panier", articleId);
    },

    // déclenche l’événement remove-from-panier en transmettant l’id de l’article
    removeFromHomePanier(articleId) {
      this.$emit("remove-from-panier", articleId);
    },
  },
};
</script>

<style scoped>
</style>