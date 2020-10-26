<template>
  <div>
    <p>bla bla bla</p>
    <component :is="articleComponent"
     :articles="articles" :panier="panier">
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
      articleComponent: 'ArticleCard'
    };
  },
  mounted () {
    // Déterminer si on est sur un petit écran (max-width: 530px)
    this.articleComponent = (screen.width <= 530) ? 'ArticleCardMobile' : 'ArticleCard'

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize",
     () => {
       this.articleComponent = (screen.width <= 530) ? 'ArticleCardMobile' : 'ArticleCard'
       });
  },
  methods: {},
};
</script>

<style scoped>
</style>