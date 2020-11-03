<template>
  <div class="article-container">
    <article v-for="article in articles" :key="article.id">
      <img class="image" :src="article.image" />
      <div class="content">
        <a class="title" :href="`/#/p/${article.id}`">
          <strong>{{ article.name }}</strong>
          {{ article.description }}
        </a>

        <div class="price">
          {{ article.price }} €
          <span class="button-container">
            <!-- Afficher le bouton "Retirer du panier" si l'article est déja dedans... -->
            <button
              @click="removeFromPanier(article.id)"
              v-if="panier.articles.some((a) => a.id === article.id)"
            >
              <img
                src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/16/Shopping-cart-remove-icon.png"
                alt="Shopping cart add Icon"
              />
              Retirer
            </button>
            <!-- ... sinon, bouton HTML “ajouter au panier”, à droite de chaque article -->
            <button @click="addToPanier(article.id)" v-else>
              <img
                src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/16/Shopping-cart-insert-icon.png"
                alt="Shopping cart remove Icon"
              />
              Ajouter
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
      this.$emit("add-to-home-panier", articleId);
    },

    // déclenche l’événement remove-from-panier en transmettant l’id de l’article
    removeFromPanier(articleId) {
      this.$emit("remove-from-home-panier", articleId);
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

  display: block;
  text-decoration: none;
  color: black;
}

article .title:hover {
  text-decoration: underline;
}

article .price {
  font-size: 16px;
  font-weight: 700;
}

.image {
  width: 80px;
  height: auto;
  margin-right: 10px;
}

.button-container {
  float: right;
}
</style>
