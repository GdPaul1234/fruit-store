<template>
  <div>
    <h2>Gestion des articles</h2>
    <article-new-dialog
      v-if="showAddArticle"
      @send-new-article="sendNewArticle"
      @abort-new-article="abortNewArticle"
    ></article-new-dialog>

    <div class="search">
      <span>Rechercher</span>
      <input
        type="search"
        id="query"
        v-model="searchQuery"
        placeholder=" banane, pomme, poire..."
      />
    </div>

    <article-edit-table
      style="margin-bottom: 80px"
      :articles="articles"
      :search-query="searchQuery"
      @delete-edit-article="deleteEditArticle"
      @update-edit-article="updateEditArticle"
    ></article-edit-table>

    <button class="add-article" @click="addNewArticle()">➕ Ajouter</button>
  </div>
</template>

<script>
const ArticleEditTable = window.httpVueLoader(
  "./components/admin/ArticleEditTable.vue"
);
const ArticleNewDialog = window.httpVueLoader(
  "./components/admin/ArticleNewDialog.vue"
);

module.exports = {
  components: { ArticleEditTable, ArticleNewDialog },
  props: {
    articles: { type: Array, default: [] },
  },
  data() {
    return {
      showAddArticle: false,
      searchQuery: "",
    };
  },
  methods: {
    // Ajouter article
    sendNewArticle(newArticle) {
      this.$emit("add-article", newArticle);
      this.showAddArticle = false;
    },
    addNewArticle() {
      this.showAddArticle = true;
    },
    abortNewArticle() {
      this.showAddArticle = false;
    },

    // Supprimer article
    deleteEditArticle(articleId) {
      this.$emit("delete-article", articleId);
    },

    // Modifier article
    updateEditArticle(editingArticle) {
      this.$emit("update-article", editingArticle);
    },
  },
};
</script>

<style scoped>
h2 {
  text-align: center;
}

/* BUTTON FLOTANT ajout article ========================= */
.add-article {
  position: fixed;
  bottom: 1em;
  right: 1em;
  padding: 10px;
  border-radius: 1em;
}

.add-article {
  border-top: 1px solid #97f7cc;
  background: #65d690;
  background: linear-gradient(top, #3e9c40, #65d690);
  padding: 10.5px 21px;
  border-radius: 15px;
  box-shadow: rgba(0, 0, 0, 1) 0 1px 0;
  text-shadow: rgba(70, 66, 66, 0.4) 0 1px 0;
  font-size: 18px;
}
.add-article:hover {
  border-top-color: #28783d;
  background: #28783d;
  color: #ccc;
}
.add-article:active {
  border-top-color: #275c1b;
  background: #275c1b;
}

/* CHAMP DE RECHERCHE ====================================== */
.search {
  padding: 0.5em;
  margin: 0 1em;
  margin-bottom: 1em;

  border-radius: 2em;
  background-color: white;
  filter: drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5));

  display: flex;
  position: sticky;
  top: 90px;
  z-index: 99;
}

.search * {
  padding: 0.5em;
}

.search #query {
  width: 100%;
  min-width: 75px;
  border-radius: 2em;
}
</style>