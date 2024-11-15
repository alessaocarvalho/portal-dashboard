<template>
  <div id="app">
    <div class="container">
      <header>
        <h1>Dashboard de Perda e Rendimento Nutrilite</h1>
        <p>Visualize os indicadores de perda e rendimento na produção.</p>
      </header>
      <div class="controls">
        <div class="select-container">
          <label for="period">Escolha o Período:</label>
          <select id="period" v-model="selectedPeriod">
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        <div class="select-container">
          <label for="chartType">Escolha o Tipo de Gráfico:</label>
          <select id="chartType" v-model="selectedChartType">
            <option value="bar">Barra</option>
            <option value="line">Linha</option>
          </select>
        </div>
      </div>
      <ProductionChart :period="selectedPeriod" :chartType="selectedChartType" />
    </div>
  </div>
</template>

<script>
import ProductionChart from './components/ProductionChart.vue';

export default {
  name: 'App',
  components: {
    ProductionChart
  },
  data() {
    return {
      selectedPeriod: 'mensal', // Período inicial
      selectedChartType: 'bar' // Tipo de gráfico inicial
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f4f7fb;
  color: #333;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.container {
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 1200px;
  box-sizing: border-box;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3f51b5;
}

p {
  color: #757575;
  font-size: 1.2rem;
}

.controls {
  margin: 2rem 0;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.select-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 48%;
}

select {
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  background-color: #fafafa;
  cursor: pointer;
}

select:focus {
  outline: 2px solid #3f51b5;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }

  .select-container {
    width: 100%;
  }
}
</style>