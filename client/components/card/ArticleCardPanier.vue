<template>
  <div class="article-container">
    <article v-for="item in getArticleDetail()" :key="item.id">
      <img :src="item.image" />
      <div class="content">
        <div class="title">
          <strong>{{ item.name }}</strong>
          {{ item.description }}
        </div>

        <!-- Edit off -->
        <div v-if="editingArticle.id !== item.id">
          <div class="price">
            x{{ item.quantity }} : {{ item.quantity * item.price }} €
            <span class="button-container">
              <button @click="modifyPanierQuantity(item.id, item.quantity)">
                Modifier quantité
              </button>
            </span>
          </div>
        </div>
        <!--Edit on : modifier la quantité du produit -->
        <div v-else>
          <div class="button-container">
            <input v-model="editingArticle.quantity" type="number" min="1" />
            <span class="price"
              >: {{ editingArticle.quantity * item.price }} €</span
            >
            <button type="button" @click="sendModifyPanierQuantity()">
              OK
            </button>
          </div>
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
    return {
      editingArticle: {
        id: -1,
        quantity: 0,
      },
    };
  },
  methods: {
    // Obtenir détail article
    getArticleDetail() {
      var articlesPanier = this.panier.articles;
      var result = [];

      for (const item of articlesPanier) {
        let articleDetail = this.articles.find((a) => a.id === item.id);
        let article = {
          id : item.id,
          image: articleDetail.image,
          name: articleDetail.name,
          description: articleDetail.description,
          price: articleDetail.price,
          quantity: item.quantity,
        };
        result.push(article);
      }
      return result;
    },

    // Met l'article en mode édition
    modifyPanierQuantity(articleId, articleQuantity) {
      this.editingArticle['id'] =  articleId;
      this.editingArticle['quantity'] = articleQuantity;
    },
    // Envoie la modification au serveur
    sendModifyPanierQuantity() {
      this.$emit("send-modify-quantity", this.editingArticle);
      this.abortEditPanierQuantity();
    },
    // Met l'article en mode lecture seule
    abortEditPanierQuantity() {
      this.editingArticle = {
        id: -1,
        quantity: 0,
      };
    },
  },
};
</script>

<style scoped>
.article-container {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

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