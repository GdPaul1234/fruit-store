<template>
  <div class="container">
    <h2>Mon espace client</h2>

    <fieldset>
      <legend>Gestion du compte</legend>
      <article :class="[isMobile ? 'mobile-disconnect' : 'grid-disconnect']">
        <button class="left">Deconnexion</button>
        <p class="right">
          <strong>Cliquer sur ce bouton pour vous déconnecter.</strong> <br />
          Votre session sera fermée sur ce navigateur et votre panier sera
          automatiquement sauvegardé dans votre espace client.
        </p>
      </article>
    </fieldset>

    <fieldset>
        <legend>Historique des commandes</legend>
        <article-commande-table :articles="articles"></article-commande-table>

    </fieldset>
  </div>
</template>

<script>
const ArticleCommandeTable = window.httpVueLoader("./components/user/ArticleCommandeTable.vue");

module.exports = {
    components: { ArticleCommandeTable },
    props: {
        articles: { type: Array, default: [] },
    },
    data() {
        return {
            isMobile: false
        }
    },
    async mounted() {
    // Déterminer si on est sur un petit écran (max-width: 600px)
    this.isMobile = screen.width < 600;

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize", () => {
      this.isMobile = screen.width < 600;
    });
  },
};
</script>

<style scoped>
h2 {
  text-align: center;
}

legend {
    background-color: #000;
    color: #fff;
    padding: 3px 6px;
}

fieldset {
    margin-bottom: 1.5rem;
}

.container {
    margin: 0 1rem;
}

.grid-disconnect {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
}

.mobile-disconnect {
    display: block;
}

.grid-disconnect .left {
    grid-column: 1 / 2;
}

.grid-disconnect .right {
    grid-column: 2 / 3;
}
</style>
