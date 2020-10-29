<template>
  <div>
    <h3>Choix de la livraison</h3>
    <form id="livraison" onsubmit="return false;">
      <div class="choix">
        <button
          :disabled="choixLivraison === 'livraison'"
          @click="setChoixPanierLivraison('livraison')"
        >
          <img
            src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-2/256/truck-icon.png"
            alt="camion"
          />
          <strong>Livraison</strong> <br />
          5 €
        </button>

        <button
          :disabled="choixLivraison === 'magasin'"
          @click="setChoixPanierLivraison('magasin')"
        >
          <img
            style="padding: 10%"
            src="https://icons.iconarchive.com/icons/custom-icon-design/flatastic-4/256/Shopping-bag-orange-icon.png"
            alt="sac"
          />
          <strong>En magasin</strong> <br />
          Gratuit
        </button>
      </div>
    </form>
  </div>
</template>

<script>
module.exports = {
  props: {
    choixLivraison: { type: String, default: "livraison" },
  },
  methods: {
    setChoixPanierLivraison(choix) {
      this.$emit("set-choix-panier-livraison", choix);
    }
  }
};
</script>

<style scoped>
/* LIVRAISON ========================================== */
#livraison {
  margin: 0 auto 20px auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 1em;
  background-image: radial-gradient(
    circle farthest-corner at 10% 20%,
    rgba(234, 249, 249, 0.67) 0.1%,
    rgba(239, 249, 251, 0.63) 90.1%
  );
}

#livraison img {
  width: 100%;
  height: auto;
  display: block;
}

#livraison .choix {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.choix-livraison {
  font-size: 14px;
  opacity: 85%;
}

#livraison button {
  text-align: center;
  border-radius: 1em;
  flex: 0 0 45%;
}

/* élément sélectionné pour le choix de la livraisin */
#livraison button:disabled {
  background-color: #0093e9;
  background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
  border: 2px solid #0580c7;
  color: black;
}
</style>