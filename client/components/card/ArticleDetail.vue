<template>
  <div class="container">
    <div class="left-wrapper">
      <img :src="article.image" />
    </div>
    <div class="right-wrapper">
      <article>
        <div class="title">
          <button @click="goToPreviousPage()">◀</button>
          <h2>{{ article.name }}</h2>
        </div>

        <h3>Description</h3>
        <div class="description">{{ article.description }}</div>

        <h3>Prix</h3>
        <div class="price">{{ article.price }} €</div>
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

.left-wrapper {
  grid-column: 1 / 2;
  width: 100%;
}

.left-wrapper img {
  height: 100%;
  max-height: 75vh;
  width: auto;

  display: block;
  margin: 0 auto;
}

.right-wrapper {
  grid-column: 2 / 3;
}

.right-wrapper article {
  border: 1px solid #ccc;
  border-radius: 1em;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgba(234, 249, 249, 0.67) 0.1%,
    rgba(239, 249, 251, 0.63) 90.1%
  );

  padding: 1.245rem 1rem;
}

.right-wrapper .title > h2 {
  display: inline;
  margin-top: 0;
  margin-bottom: 0;
  vertical-align: middle;
}

.right-wrapper .title > button {
  height: 26.4px;
  border-radius: 100%;
  vertical-align: middle;
}

.right-wrapper article > h3 {
  border-bottom: black dotted;
  margin-bottom: 0.5em;
}
</style>
