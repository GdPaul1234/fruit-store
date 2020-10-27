<template>
  <div>
    <h2>Panier</h2>
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
      v-else
      :panier="panier"
      :articles="articles"
      @remove-from-panier-panier="removeFromPanierPanier"
      @send-modify-quantity="sendModifyQuantity"
      @get-panier-price="getPanierPrice"
    ></article-card-panier>

    <h3>Choix de la livraison</h3>
    <form id="livraison" onsubmit="return false;">
      <div class="choix">
        <button
          :disabled="choixLivraison === 'livraison'"
          @click="setChoixLivraison('livraison')"
        >
          <img
            src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-2/256/truck-icon.png"
            alt="camion"
          />
          <strong>Livraison</strong> <br />
          5 €
        </button>

        <button
          :disabled="choixLivraison === 'magasin'"
          @click="setChoixLivraison('magasin')"
        >
          <img
            style="padding: 20px"
            src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/256/Shopping-bag-orange-icon.png"
            alt="sac"
          />
          <strong>En magasin</strong> <br />
          Gratuit
        </button>
      </div>
    </form>

    <!-- Gestion du paiement -->
    <div class="error" v-if="lerror">
      Impossible de procéder au paiement<br />
      <a href="/#/login">Connectez-vous</a>
    </div>
    <div class="success" v-if="payment">Paiement réussie !</div>
    <div class="pay">
      <button class="pay-button" @click="payPanier()">
        Payer {{ panierTotal }} €
      </button>
      <p class="choix-livraison" v-if="choixLivraison === 'livraison'">
        dont 5 € de frais de livraison
      </p>
      <p>Paiement sécurisé par Usecure</p>
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
    return {
      panierTotal: 0,
      choixLivraison: "livraison",
      cacheArticleDetail: [],
    };
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
    payPanier() {
      this.$emit("pay-panier");
    },
  },
};
</script>

<style scoped>

h2,
h3 {
  text-align: center;
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


/* LIVRAISON ========================================== */
#livraison {
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
}

#livraison img {
  height: 128px;
  width: auto;
  display: block;
}

#livraison .choix {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.choix-livraison {
  font-size: 14px;
  opacity: 85%;
  margin: 10px 0 0 0;
}

#livraison button {
  text-align: center;
  border-radius: 1em;
}

/* élément sélectionné pour le choix de la livraisin */
#livraison button:disabled {
  background-color: #0093e9;
  background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
  border: 2px solid #0580c7;
  color: black;
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
  text-decoration: none;
  vertical-align: middle;
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
  margin-bottom: 20px;
}

.success {
  background-color: #e7f3fe;
  border-left: 6px solid #2196f3;
  padding: 5px;
  margin-bottom: 20px;
}
</style>