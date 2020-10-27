<template>
  <div>
    <h2>Panier</h2>
    <article-card-panier
      :panier="panier"
      :articles="articles"
      @send-modify-quantity="sendModifyQuantity"
    ></article-card-panier>

    <!-- Gestion du paiement -->
    <div class="error" v-if="lerror">
      Impossible de procéder au paiement<br /><a
        href="http://localhost:3000/#/login"
        >Connectez-vous</a
      >
    </div>
    <div class="success" v-if="payment">Paiement réussie !</div>
    <div class="pay">
      <button class="button-pay" @click="payPanier()">Payer</button>
    </div>
  </div>
</template>

<script>
const ArticleCardPanier = window.httpVueLoader(
  "./components/card/ArticleCardPanier.vue"
);

module.exports = {
  components: { ArticleCardPanier },
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object },
    lerror: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
  },
  data() {
    return {};
  },
  methods: {
    // Envoie la modification au serveur
    sendModifyQuantity(editingArticle) {
      this.$emit("modify-article-panier", editingArticle);
    },

    // Payer panier
    payPanier() {
      this.$emit("pay-panier");
    },
  },
};
</script>

<style scoped>
h2 {
  text-align: center;
}
</style>