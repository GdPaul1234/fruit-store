<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header"><h3>Edition article</h3></div>
        <div class="modal-body">
          <form id="article-edit" class="login" @submit.prevent="sendEditArticleData">
            <label for="image">URL image</label>
            <input
              type="text"
              v-model="editArticleData.image"
              placeholder="http://example.com/image.jpg"
              required
            />

            <label for="name">nom</label>
            <input
              type="text"
              v-model="editArticleData.name"
              placeholder="Banane"
              required
            />

            <label for="price">prix (€)</label>
            <input type="number" step="0.01" v-model="editArticleData.price" required />

            <label for="description">description</label>
            <textarea
              v-model="editArticleData.description"
              cols="30"
              rows="5"
              placeholder="La description du produit"
              required
            ></textarea>

            <div class="button">
              <button type="submit">✔️</button>
              <button @click="cancelEditArticle">❌</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: {
    editArticleData: { type: Object },
  },
  data() {
    return {};
  },
  methods: {
    sendEditArticleData() {
      this.$emit("send-edit-article");
    },
    cancelEditArticle() {
      this.$emit("abort-edit-article");
    },
  },
};
</script>

<style >
/* d'après https://vuejs.org/v2/examples/modal.html */
.modal-mask {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
}

body {
  height: 100vh;
}

/* Centrage de la boîte de dialogue */
.modal-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.modal-container {
  max-width: 400px;
  margin: 0px 1rem;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);

  max-height: 75vh;
  overflow: hidden auto;
}

.modal-header h3 {
  margin-top: 0;
}

.modal-body {
  margin: 0.5rem 0;
}

/* Forms login overhide */
form#article-edit {
  margin: 0;
  padding: 0;
  border: unset;
  border-radius: none;
  background: unset;
  width: 100%;
}

form#article-edit textarea {
  resize: vertical;
  width: 100%;
}
</style>
