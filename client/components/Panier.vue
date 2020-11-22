<template>
  <div>
    <!-- Gestion du paiement -->
    <div class="error" v-if="perror">
      Impossible de procéder au paiement<br />
      <a href="/#/login">Connectez-vous</a>
    </div>
    <div class="success" v-if="payment">Paiement réussie !</div>

    <div class="grid-container" :class="{ 'mobile-container': isMobile }">
      <section class="grid-left" :class="{ 'mobile-top': isMobile }">
        <h3>Panier</h3>
        <!-- Panier vide -->
        <div class="panier-vide" v-if="cacheArticleDetail.length === 0">
          <img
            src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/256/Shopping-cart-alert-icon.png"
            alt="panier vide"
          />
          <div class="content">
            <p>
              Le panier est vide !<br />
              <a href="/#/"> Commencer mes courses</a>
            </p>
          </div>
        </div>
        <!-- Panier rempli -->
        <article-card-panier
          :panier="panier"
          :articles="articles"
          @remove-from-panier-panier="removeFromPanierPanier"
          @send-modify-quantity="sendModifyQuantity"
          @get-panier-price="getPanierPrice"
        ></article-card-panier>
      </section>

      <section class="grid-right" :class="{ 'mobile-bottom': isMobile }">
        <choix-livraison
          :choix-livraison="choixLivraison"
          @set-choix-panier-livraison="setChoixLivraison"
        ></choix-livraison>

        <div class="pay" v-if="cacheArticleDetail.length !== 0">
          <button class="pay-button" @click="payPanier()">
            Payer {{ Number.parseFloat(panierTotal).toFixed(2) }} €
          </button>
          <p class="choix-livraison" v-if="choixLivraison === 'livraison'">
            dont 5 € de frais de livraison
          </p>
          <p>Paiement sécurisé par Usecure</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
const ArticleCardPanier = window.httpVueLoader(
  "./components/card/ArticleCardPanier.vue"
);
const ChoixLivraison = window.httpVueLoader(
  "./components/commande/ChoixLivraison.vue"
);

module.exports = {
  components: { ArticleCardPanier, ChoixLivraison },
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object },
    perror: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
  },
  data() {
    return {
      panierTotal: 0,
      choixLivraison: "livraison",
      cacheArticleDetail: [],
      isMobile: false,
    };
  },
  mounted() {
    // Déterminer si on est sur un petit écran (max-width:728px)
    this.isMobile = screen.width < 728 ? true : false;

    // isMobile se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize", () => {
      this.isMobile = screen.width < 728 ? true : false;
    });
  },
  methods: {
    // Envoie la modification au serveur
    sendModifyQuantity(editingArticle) {
      this.$emit("modify-article-panier", editingArticle);
    },

    // Choix livraison
    setChoixLivraison(choix) {
      this.choixLivraison = choix;
      // mettre à jour les prix
      this.getPanierPrice(null);
    },

    // Calculer le total du panier
    getPanierPrice(articlesDetail) {
      this.panierTotal = 0;
      let listArticlesDetail;

      // récupérer le cache si aucun détail des articles du panier est passé en paramètre
      if (articlesDetail != null) {
        this.cacheArticleDetail = articlesDetail;
        listArticlesDetail = articlesDetail;
      } else {
        listArticlesDetail = this.cacheArticleDetail;
      }

      // calculer le total du panier
      for (const item of listArticlesDetail) {
        this.panierTotal += item.quantity * item.price;
      }

      // ajouter 5 € si livraison
      if (this.choixLivraison === "livraison") {
        this.panierTotal += 5;
      }
    },

    // déclenche l’événement remove-from-panier en transmettant l’id de l’article
    removeFromPanierPanier(articleId) {
      this.$emit("remove-from-panier", articleId);
      const index = this.cacheArticleDetail.findIndex(
        (a) => a.id === articleId
      );
      this.cacheArticleDetail.splice(index, 1); // remove the article from the array
    },

    // Payer panier
    async payPanier() {
      this.$emit("pay-panier", this.panierTotal);
    },
  },
};
</script>

<style scoped>
h2,
h3 {
  text-align: center;
}

/* LAYOUT PANIER ET CHOIX LIVRAISON ==================== */
.grid-container {
  display: grid;
  grid-template-columns: 70% 30%;
  grid-gap: 1rem;
  margin: 0 2rem;
}

.mobile-container {
  grid-template-columns: auto;
  margin: 0 5px;
}

.grid-left {
  grid-column: 1 / 2;
  height: calc(100vh - 106.2px);
  overflow: hidden auto;
}

.mobile-top {
  height: auto;
}

.grid-right {
  grid-column: 2 / 3;
  height: calc(100vh - 106.2px);
  overflow: hidden auto;
}

.mobile-bottom {
  grid-column: 1 / 2;
  height: auto;
  max-width: 400px;
  margin: auto;
}

.article-container {
  margin: 0;
}

/* PANIER VIDE ======================================== */
.panier-vide {
  margin: 0 auto 20px auto;
  padding: 1rem;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 1em;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgba(234, 249, 249, 0.67) 0.1%,
    rgba(239, 249, 251, 0.63) 90.1%
  );
  display: flex;
  align-items: center;
}

.panier-vide img {
  height: 100%;
  max-height: 72px;
  width: auto;
  padding-right: 0.5em;
}

.panier-vide .content {
  border-left: 1px solid darkgray;
  padding-left: 0.5em;
}

/* PAIEMENT =========================================== */
.pay {
  text-align: center;
}

.pay-button {
  border-top: 1px solid #97f7cc;
  background: #65d690;
  background: linear-gradient(top, #3e9c40, #65d690);
  padding: 10.5px 21px;
  border-radius: 15px;
  box-shadow: rgba(0, 0, 0, 1) 0 1px 0;
  text-shadow: rgba(0, 0, 0, 0.4) 0 1px 0;
  color: white;
  font-size: 18px;
}
.pay-button:hover {
  border-top-color: #28783d;
  background: #28783d;
  color: #ccc;
}
.pay-button:active {
  border-top-color: #275c1b;
  background: #275c1b;
}

/* GESTION ERREURS ==================================== */
.error {
  background-color: #ffdddd;
  border-left: 6px solid #f44336;
  padding: 5px;
  margin: 0 auto 20px auto;
  max-width: 400px;
}

.success {
  background-color: #e7f3fe;
  border-left: 6px solid #2196f3;
  padding: 5px;
  margin: 0 auto 20px auto;
  max-width: 400px;
}
</style>