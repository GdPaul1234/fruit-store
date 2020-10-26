<template>
  <div>
    <h2>Panier</h2>
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
};
</script>

<style scoped>
</style>