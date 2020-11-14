<template>
  <div>
    <h2>Connexion</h2>

    <!-- Gestion des erreurs -->
    <div class="error" v-if="lerror">
      {{ lerror_reason }} <br />
      <a href="/#/register">Créer un nouveau compte</a>
    </div>
    <div class="success" v-if="lsuccess">
      Connexion réussie ! <a href="/#/">Commencer mes courses</a>
    </div>

    <!-- Formulaire de connexion -->
    <form class="login" @submit.prevent="loginUser">
      <label for="email">e-mail</label>
      <input
        type="email"
        v-model="user.email"
        placeholder="jonh.doe@example.com"
        required
      />

      <label for="password">mot de passe</label>
      <input
        type="password"
        v-model="user.password"
        placeholder="********"
        required
      />

      <div class="button">
        <button type="submit">Se connecter</button>
      </div>
    </form>
  </div>
</template>

<script>
module.exports = {
  props: {
    lsuccess: { type: Boolean, default: false },
    lerror: { type: Boolean, default: false },
    lerror_reason: { type: String },
  },
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    loginUser() {
      this.$emit("login-user", this.user);
    },
  },
};
</script>

<style scoped>
h2 {
  text-align: center;
}

.error {
  background-color: #ffdddd;
  border-left: 6px solid #f44336;
  padding: 5px;
  margin: 0 auto 20px auto;
  max-width: 400px;
}

.success {
  background-color: #e7f3fe;
  border-left: 6px solid #2196f3;
  padding: 5px;
  margin: 0 auto 20px auto;
  max-width: 400px;
}
</style>
