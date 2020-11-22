<template>
  <div class="container">
    <div v-if="connectedUser !== ''">
      <h2>Bonjour {{ connectedUser }}</h2>

      <fieldset>
        <legend>Gestion du compte</legend>
        <article :class="[isMobile ? 'mobile-disconnect' : 'grid-disconnect']">
          <button class="left" @click="logout()">Deconnexion</button>
          <p class="right">
            <strong>Cliquer sur ce bouton pour vous déconnecter.</strong> <br />
            <span v-if="!isAdmin">
              Votre session sera fermée sur ce navigateur et votre panier sera
              automatiquement sauvegardé dans votre espace client.
            </span>
          </p>
        </article>
      </fieldset>

      <fieldset v-if="!isAdmin">
        <legend>Historique des commandes</legend>
        <article-commande-table :articles="articles"></article-commande-table>
      </fieldset>
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
const ArticleCommandeTable = window.httpVueLoader(
  "./components/user/ArticleCommandeTable.vue"
);

module.exports = {
  components: { ArticleCommandeTable },
  props: {
    articles: { type: Array, default: [] },
    connectedUser: { type: String },
    isAdmin: { type: Boolean },
  },
  data() {
    return {
      isMobile: false,
    };
  },
  async mounted() {
    // Déterminer si on est sur un petit écran (max-width: 600px)
    this.isMobile = screen.width < 600;

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize", () => {
      this.isMobile = screen.width < 600;
    });
  },
  methods: {
    logout() {
      this.$emit("logout-user");
    },
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
