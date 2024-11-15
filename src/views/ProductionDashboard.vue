<template>
  <div>
    <h1>Dashboard de Produção Nutrilite</h1>
    <ProductionChart />
    <iframe
      v-if="showBI"
      width="800"
      height="600"
      :src="dashboardURL"
      title="Emulação Power BI"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
import ProductionChart from '../components/ProductionChart.vue';

export default {
  name: 'ProductionDashboard',
  components: {
    ProductionChart,
  },
  data() {
    return {
      dashboardURL: 'https://example.com', // Substitua com a URL de emulação
      showBI: false,
    };
  },
  mounted() {
    this.showBI = true;
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-top: 20px;
}
</style>