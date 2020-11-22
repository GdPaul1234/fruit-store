<template>
  <div>
    <div class="table-container">
      <table :class="classTable">
        <colgroup>
          <col style="width: 50px" />
          <col style="width: 95px" />
          <col style="width: 100%" />
          <col style="width: 100px" />
        </colgroup>
        <thead>
          <tr>
            <th>id</th>
            <th>Date</th>
            <th>Articles</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="commande in commandes" :key="commande.id">
            <td>{{ commande.id }}</td>
            <td>{{ commande.date }}</td>
            <td>
              <details>
                <summary>{{ commande.summary }}</summary>
                <ul>
                  <li
                    v-for="(article, index) in commande.articles"
                    :key="index"
                  >
                    <span>
                      {{ article.quantity }}x {{ article.detail.name }}
                    </span>

                    <span style="flex-shrink: 0;">
                      {{
                        Number.parseFloat(
                          article.quantity * article.detail.price
                        ).toFixed(2)
                      }}
                      €
                    </span>
                  </li>
                </ul>
              </details>
            </td>
            <td class="price">
              {{ Number.parseFloat(commande.total).toFixed(2) }} €
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button style="float: right; margin-top: 0.5rem;" @click="getOrders()">Actualiser</button>
  </div>
</template>

<script>
module.exports = {
  props: {
    articles: { type: Array, default: [] },
  },
  data() {
    return {
      classTable: "articles-tables",
      commandes: [],
    };
  },
  async mounted() {
    // Déterminer si on est sur un petit écran (max-width: 600px)
    this.classTable = screen.width < 600 ? "articles-mobile" : "articles-table";

    // articleComponent se met à jour à chaque redimensionnement de l'écran
    window.addEventListener("resize", () => {
      this.classTable =
        screen.width < 600 ? "articles-mobile" : "articles-table";
    });

    await this.getOrders();
  },
  methods: {
    async getOrders() {
      var result = await axios.get("/api/orders");
      this.commandes = result.data.commandes;

      for (var commande of this.commandes) {
        // Transformer la date postgre en quelque chose de lisible pour des humains
        var date = new Date(commande.date);
        commande.date = date.toLocaleDateString();

        // transformer panierSQL en panierJSON
        commande = this.articlesSQL_to_articlesJSON(commande);
      }
    },

    articlesSQL_to_articlesJSON(commande) {
      var articles = [];
      commande.summary = `${commande.articles.length} articles achetés`;

      for (articleId of commande.articles) {
        const aIndex = articles.findIndex((a) => a.id === articleId);
        if (aIndex === -1) {
          // recherche détail article
          const detail = this.articles.find((a) => a.id === articleId);

          articles.push({ id: articleId, detail: detail, quantity: 1 });
        } else {
          articles[aIndex]["id"] = articleId;
          articles[aIndex]["quantity"]++;
        }
      }
      commande.articles = articles;
      return commande;
    },
  },
};
</script>

<style scoped>
ul {
    margin-block-start: 0.5em;
    margin-block-end: 1em;
    padding-inline-start: 20px;
}

li {
 display: flex;
 height: 18px;
 overflow: hidden;
 justify-content: space-between;
}

.table-container {
  overflow: auto;
}

.articles-table {
  width: 100%;
  border-collapse: collapse;

  table-layout: fixed;
}
/* Zebra striping */
.articles-table tr:nth-of-type(odd),
.articles-mobile tr:nth-of-type(odd) {
  background: rgba(238, 238, 238, 0.4);
}
.articles-table tr:nth-of-type(even),
.articles-mobile tr:nth-of-type(even) {
  background: rgba(238, 238, 238, 0.6);
}

.articles-table th {
  background: rgba(51, 51, 51, 0.8);
  color: white;
  font-weight: bold;
}

.articles-table td[scope="row"] {
  font-weight: bold;
}

.articles-table td,
th {
  padding: 6px;
  border: 1px solid #ccc;
  text-align: left;
}
.articles-table td > img,
.articles-mobile td > img {
  height: 50px;
  width: auto;
}
.articles-table .price {
  text-align: right;
}

/* MOBILE (https://css-tricks.com/responsive-data-tables/) */
/* Force table to not be like tables anymore */
.articles-mobile,
.articles-mobile thead,
.articles-mobile tbody,
.articles-mobile th,
.articles-mobile td,
.articles-mobile tr {
  display: block;
}

/* Hide table headers */
.articles-mobile thead tr {
  display: none;
}

.articles-mobile tr {
  border: 1px solid #ccc;
  margin: 0.5rem 0;
}

.articles-mobile td {
  /* Behave  like a "row" */
  border: none;
  border-bottom: 1px solid #eee;
  position: relative;
  padding-left: 60px;
}

.articles-mobile td:before {
  /* Now like a table header */
  position: absolute;
  /* Top/left values mimic padding */
  left: 0;
  width: 50px;
  padding-right: 6px;
  white-space: nowrap;
  /* Behave like a header */
  background: rgba(51, 51, 51, 0.7);
  color: white;
  font-weight: bold;
  height: 100%;
  text-align: right;
}

/*
	Label the data
	*/
.articles-mobile td:nth-of-type(1):before {
  content: "id";
}
.articles-mobile td:nth-of-type(2):before {
  content: "Date";
}
.articles-mobile td:nth-of-type(3):before {
  content: "Art.";
}
.articles-mobile td:nth-of-type(4):before {
  content: "Total";
}
</style>
