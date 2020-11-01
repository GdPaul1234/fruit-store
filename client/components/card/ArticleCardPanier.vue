<template>
  <div class="article-container">
    <article v-for="item in articlesDetail" :key="item.id">
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
                ✏️
              </button>
              <button @click="removeFromPanier(item.id)">🗑️</button>
            </span>
          </div>
        </div>
        <!--Edit on : modifier la quantité du produit -->
        <div v-else>
          <div class="button-container">
            <input
              v-model="editingArticle.quantity"
              type="number"
              min="1"
              max="99"
            />
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
      articlesDetail: [],
    };
  },
  /* https://stackoverflow.com/a/57864145 */
  computed: {
    changeData() {
      const { articles, panier } = this
      return {
        articles,
        panier
      }
    }
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
      var articles = data.articles;
      var panier = data.panier;

      var articlesPanier = panier.articles;
      this.articlesDetail = [];

      for (const item of articlesPanier) {
        let articleDetail = articles.find((a) => a.id === item.id);
        let article = {
          id: item.id,
          image:
            "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/256/Package-warning-icon.png",
          description: "Cet article n'est plus en vente",
          name: "Article indisponible",
          price: 0,
          quantity: item.quantity,
        };
        if (typeof articleDetail !== "undefined") {
          article = {
            id: item.id,
            image: articleDetail.image,
            name: articleDetail.name,
            description: articleDetail.description,
            price: articleDetail.price,
            quantity: item.quantity,
          };
        }

        this.articlesDetail.push(article);

        // mettre à jour détail panier au composant parent
        this.$emit("get-panier-price", this.articlesDetail);
      }
    },

    // déclenche l’événement remove-from-panier en transmettant l’id de l’article
    removeFromPanier(articleId) {
      this.$emit("remove-from-panier-panier", articleId);
    },

    // Met l'article en mode édition
    modifyPanierQuantity(articleId, articleQuantity) {
      this.editingArticle["id"] = articleId;
      this.editingArticle["quantity"] = articleQuantity;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

input {
  width: 50px; /* 3 chiffres max */
}

.button-container {
  float: right;
}
</style>