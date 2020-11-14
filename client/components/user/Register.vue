<template>
  <div>
    <h2>Inscription</h2>
    <!-- Gestion des erreurs -->
    <div class="error" v-if="rerror">{{ rerror_reason }}</div>
    <div class="success" v-if="rsuccess">
      Utilisateur enregistré avec succès ! <a href="/#/login">Se connecter</a>
    </div>

    <!-- Formulaire d'inscription -->
    <form class="login" @submit.prevent="registerUser">
      <label for="email">e-mail</label>
      <input
        type="email"
        v-model="newUser.email"
        placeholder="jonh.doe@example.com"
        required
      />
      <label for="password">mot de passe</label>
      <input
        type="password"
        v-model="newUser.password"
        placeholder="********"
        required
      />
      <div class="button">
        <button type="submit">S'inscrire</button>
      </div>
    </form>
  </div>
</template>

<script>
module.exports = {
  props: {
    rsuccess: { type: Boolean, default: false },
    rerror: { type: Boolean, default: false },
    rerror_reason: { type: String },
  },
  data() {
    return {
      newUser: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    registerUser() {
      this.$emit("register-user", this.newUser);
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
