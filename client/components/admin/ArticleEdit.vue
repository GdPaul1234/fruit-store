<template>
  <div>
    <!-- Afficher la gestion des articles si l'user est un admin -->
    <div v-if="isAdmin">
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

    <!-- Accès interdit -->
    <div class="forbidden" v-else>
      <img
        src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-5/256/Couple-icon.png"
        alt="couple"
      />
      <div class="content">
        <p>
          Vous êtes perdu !<br />
          <a href="/#/">Revenir à l'accueil</a>
        </p>
      </div>
    </div>
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
    isAdmin: { type: Boolean, default: false },
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

/* ACCES INTERDIT ======================================== */
.forbidden {
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

.forbidden img {
  height: 100%;
  max-height: 72px;
  width: auto;
  padding-right: 0.5em;
}

.forbidden .content {
  border-left: 1px solid darkgray;
  padding-left: 0.5em;
}
</style>
