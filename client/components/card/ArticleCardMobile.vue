<template>
  <div class="article-container">
    <article v-for="article in articles" :key="article.id">
      <img :src="article.image" />
      <div class="content">
        <div class="title">
          <strong>{{ article.name }}</strong>
          {{ article.description }}
        </div>

        <div class="price">
          {{ article.price }} €
          <span class="button-container">
            <!-- Afficher le bouton "Retirer du panier" si l'article est déja dedans... -->
            <button
              @click="removeFromPanier(article.id)"
              v-if="panier.articles.some((a) => a.id === article.id)"
            >
              Retirer du panier
            </button>
            <!-- ... sinon, bouton HTML “ajouter au panier”, à droite de chaque article -->
            <button @click="addToPanier(article.id)" v-else>
              Ajouter au panier
            </button>
          </span>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
module.exports = {
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object },
  },
  data() {
    return {};
  },
  methods: {
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
article {
  display: flex;
}

article .content {
  width: 100%;
}

article .title {
  height: 52.8px;
  overflow: hidden;

  font-size: 14px;
  margin-bottom: 10px;
  line-height: 18px;
}

article .price {
  font-size: 16px;
  font-weight: 700;
}

img {
  width: 80px;
  height: auto;
  margin-right: 10px;
}

.button-container {
  float: right;
}
</style>