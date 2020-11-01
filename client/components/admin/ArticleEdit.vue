<template>
  <div>
    <h2>Gestion des articles</h2>
    <article-edit-table
      :articles="articles"
      @delete-edit-article="deleteEditArticle"
      @update-edit-article="updateEditArticle"
    ></article-edit-table>
  </div>
</template>

<script>
const ArticleEditTable = window.httpVueLoader(
  "./components/admin/ArticleEditTable.vue"
);

module.exports = {
  components: { ArticleEditTable },
  props: {
    articles: { type: Array, default: [] },
  },
  methods: {
    deleteEditArticle(articleId) {
      this.$emit("delete-article", articleId);
    },
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
</style>