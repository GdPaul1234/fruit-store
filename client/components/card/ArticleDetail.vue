<template>
  <div :class="[isMobile ? 'mobile-container' : 'container']">
    <!-- Image produit -->
    <div :class="[isMobile ? 'top-wrapper' : 'left-wrapper']">
      <img :src="article.image" />
    </div>

    <!-- Description produit -->
    <div :class="[isMobile ? 'bottom-wrapper' : 'right-wrapper']">
      <article>
        <div class="title">
          <button @click="goToPreviousPage()">◀</button>
          <h2>{{ article.name }}</h2>
        </div>

        <h3>Description</h3>
        <div class="description">{{ article.description }}</div>

        <h3>Prix</h3>
        <div class="price">{{ article.price }} €</div>

        <div class="button-container">
          <!-- Afficher le bouton "Retirer du panier" si l'article est déja dedans... -->
          <button
            @click="removeFromPanier(article.id)"
            v-if="panier.articles.some((a) => a.id === article.id)"
            class="red"
          >
            Retirer du panier
          </button>
          <!-- ... sinon, bouton HTML “ajouter au panier”, à droite de chaque article -->
          <button @click="addToPanier(article.id)" v-else class="green">
            Ajouter au panier
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object, default: [] },
  },
  data() {
    return {
      article: {},
      isMobile: false,
    };
  },
  /* https://stackoverflow.com/a/57864145 */
  computed: {
    changeData() {
      const { articles, panier, $route } = this;
      return {
        articles,
        panier,
        $route,
      };
    },
  },
  watch: {
    changeData: {
      immediate: true,
      deep: true,
      handler: "getArticleDetail",
    },
  },
  mounted() {
    // Déterminer si on est sur un petit écran (max-width: 530px)
    this.isMobile = screen.width < 530;

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize", () => {
      this.isMobile = screen.width < 530;
    });
  },
  methods: {
    // Obtenir détail article (update si articles ou panier change)
    getArticleDetail(data) {
      var articleId = parseInt(data.$route.params.id);
      var articleFound = data.articles.find((a) => a.id === articleId);

      this.article = {
        id: articleId,
        image:
          "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/256/Package-warning-icon.png",
        description: "Cet article n'est plus en vente",
        name: "Article indisponible",
        price: 0,
      };
      if (typeof articleFound !== "undefined") {
        this.article = JSON.parse(JSON.stringify(articleFound));
      }
    },

    // Aller à la page précédente
    goToPreviousPage() {
      window.history.back();
    },

    // déclenche l’événement add-to-panier en transmettant l’id de l’article
    addToPanier(articleId) {
      this.$emit("add-to-panier", articleId);
    },

    // déclenche l’événement remove-from-panier en transmettant l’id de l’article
    removeFromPanier(articleId) {
      this.$emit("remove-from-panier", articleId);
    },
  },
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 65vw 1fr;
  grid-gap: 16px;

  height: calc(100vh - 106.2px);
  margin: 0 1rem;
}

.mobile-container {
  display: block;
}

.top-wrapper {
  position: sticky;
  top: 90px;
  z-index: 0;
  margin-bottom: 0.5rem;
}

.bottom-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;
}

.left-wrapper {
  grid-column: 1 / 2;
  width: 100%;
}

.left-wrapper img {
  height: 100%;
  max-height: 75vh;
  max-width: 65vw;
  width: auto;

  display: block;
  margin: 0 auto;
}

.top-wrapper img {
  width: 100%;
  height: auto;
  z-index: 0;
}

.right-wrapper {
  grid-column: 2 / 3;
}

/* DESCRIPTION ======================================= */

div[class$="-wrapper"] article {
  border: 1px solid #ccc;
  border-radius: 1em;
  background-color: rgba(249, 249, 249, 0.9);

  padding: 1.245rem 1rem;
}

div[class$="-wrapper"] .title > h2 {
  display: inline;
  margin-top: 0;
  margin-bottom: 0;
  vertical-align: middle;
}

div[class$="-wrapper"] .title > button {
  height: 26.4px;
  border-radius: 100%;
  vertical-align: middle;
}

div[class$="-wrapper"] article > h3 {
  border-bottom: black dotted;
  margin-bottom: 0.5em;
}

/* BUTTON ========================================== */
.button-container {
  margin-top: 1.17rem;
}

.button-container button {
  padding: 10.5px 21px;
  border-radius: 15px;
  box-shadow: rgba(0, 0, 0, 1) 0 1px 0;
  text-shadow: rgba(0, 0, 0, 0.4) 0 1px 0;
  color: white;
  font-size: 18px;
}
.button-container .green {
  border-top: 1px solid #97f7cc;
  background: #65d690;
  background: linear-gradient(top, #3e9c40, #65d690);
}
.button-container .red {
  border-top: 1px solid #f79797;
  background: #d66565;
  background: linear-gradient(top, #9c3e3e, #d66565);
}

.button-container button.green:hover {
  border-top-color: #28783d;
  background: #28783d;
  color: #ccc;
}
.button-container button.red:hover {
  border-top-color: #782828;
  background: #782828;
  color: #ccc;
}

.button-container button.green:active {
  border-top-color: #275c1b;
  background: #275c1b;
}
.button-container button.red:active {
  border-top-color: #5c1b1b;
  background: #5c1b1b;
}
</style>
