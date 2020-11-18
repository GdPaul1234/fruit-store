<template>
  <div class="table-container">
    <article-edit-dialog
      v-if="editingArticle.id !== -1"
      :edit-article-data="editingArticle"
      @send-edit-article="sendEditArticle"
      @abort-edit-article="abortEditArticle"
    ></article-edit-dialog>
    <table :class="classTable">
      <colgroup>
        <col style="width: 100px" />
        <col style="width: 30%" />
        <col style="width: 80px" />
        <col style="width: 70%" />
        <col style="width: 50px" />
      </colgroup>
      <thead>
        <tr>
          <th></th>
          <th>Nom</th>
          <th>Prix</th>
          <th>Description</th>
          <th>...</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="article in searchArticles" :key="article.id">
          <td> {{ article.id }} <img :src="article.image" /></td>
          <td scope="row">{{ article.name }}</td>
          <td class="price">{{ article.price }} €</td>
          <td>{{ article.description }}</td>
          <td>
            <button @click="editArticle(article)">✏️</button>
            <button @click="deleteArticle(article.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const ArticleEditDialog = window.httpVueLoader(
  "./components/admin/ArticleEditDialog.vue"
);

module.exports = {
  components: { ArticleEditDialog },
  props: {
    articles: { type: Array, default: [] },
    searchQuery: { type: String, default: "" },
  },
  data() {
    return {
      classTable: "articles-tables",
      editingArticle: {
        id: -1,
        name: "",
        description: "",
        image: "",
        price: 0,
      },
    };
  },
  computed: {
    searchArticles() {
      var result = [];
      if (this.searchQuery !== "") {
        for (let index = 0; index < this.articles.length; index++) {
          const element = this.articles[index];
          const articleName = element.name.toLowerCase();
          const articleDesc = element.description.toLowerCase();
          const search = this.searchQuery.toLowerCase();
          if (articleName.includes(search) || articleDesc.includes(search)) {
            result.push(element);
          }
        }
      } else {
        result = this.articles;
      }

      return result;
    },
  },
  mounted() {
    // Déterminer si on est sur un petit écran (max-width: 600px)
    this.classTable = screen.width < 600 ? "articles-mobile" : "articles-table";

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize", () => {
      this.classTable =
        screen.width < 600 ? "articles-mobile" : "articles-table";
    });
  },
  methods: {
    // déclenche l’événement update-article en transmettant l’id de l'article
    deleteArticle(articleId) {
      this.$emit("delete-edit-article", articleId);
    },

    // remplir l'article à éditer avec ses valeurs antérieures
    editArticle(article) {
      this.editingArticle.id = article.id;
      this.editingArticle.name = article.name;
      this.editingArticle.description = article.description;
      this.editingArticle.image = article.image;
      this.editingArticle.price = article.price;
    },

    // déclenche l’événement update-article en transmettant l’article en cours d'édition
    sendEditArticle() {
      this.$emit("update-edit-article", this.editingArticle);
      this.abortEditArticle();
    },
    // Reinitialiser editingArticle
    abortEditArticle() {
      this.editingArticle = {
        id: -1,
        name: "",
        description: "",
        image: "",
        price: 0,
      };
    },
  },
};
</script>

<style scoped>
.table-container {
  overflow: auto;
  margin: 0 1rem;
}

.articles-table {
  width: 100%;
  border-collapse: collapse;

  table-layout: fixed;
}
/* Zebra striping */
.articles-table tr:nth-of-type(odd),
.articles-mobile tr:nth-of-type(odd) {
  background: rgba(238, 238, 238, 0.4);
}
.articles-table tr:nth-of-type(even),
.articles-mobile tr:nth-of-type(even) {
  background: rgba(238, 238, 238, 0.6);
}

.articles-table th {
  background: rgba(51, 51, 51, 0.8);
  color: white;
  font-weight: bold;
}

.articles-table td[scope="row"] {
  font-weight: bold;
}

.articles-table td,
th {
  padding: 6px;
  border: 1px solid #ccc;
  text-align: left;
}
.articles-table td > img,
.articles-mobile td > img {
  height: 50px;
  width: auto;
}
.articles-table .price {
  text-align: right;
}

/* MOBILE (https://css-tricks.com/responsive-data-tables/) */
/* Force table to not be like tables anymore */
.articles-mobile,
.articles-mobile thead,
.articles-mobile tbody,
.articles-mobile th,
.articles-mobile td,
.articles-mobile tr {
  display: block;
}

/* Hide table headers */
.articles-mobile thead tr {
  display: none;
}

.articles-mobile tr {
  border: 1px solid #ccc;
  margin: 0.5rem 0;
}

.articles-mobile td {
  /* Behave  like a "row" */
  border: none;
  border-bottom: 1px solid #eee;
  position: relative;
  padding-left: 75px;
}

.articles-mobile td:before {
  /* Now like a table header */
  position: absolute;
  /* Top/left values mimic padding */
  left: 0;
  width: 65px;
  padding-right: 6px;
  white-space: nowrap;
  /* Behave like a header */
  background: rgba(51, 51, 51, 0.7);
  color: white;
  font-weight: bold;
  height: 100%;
  text-align: right;
}

/*
	Label the data
	*/
.articles-mobile td:nth-of-type(1):before {
  content: "Image";
}
.articles-mobile td:nth-of-type(2):before {
  content: "Nom";
}
.articles-mobile td:nth-of-type(3):before {
  content: "Prix";
}
.articles-mobile td:nth-of-type(4):before {
  content: "Desc.";
}
.articles-mobile td:nth-of-type(5):before {
  content: "Actions";
}
</style>