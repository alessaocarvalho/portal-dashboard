<template>
  <div id="app">
    <div class="container">
      <header>
        <h1>Dashboard de Perda e Rendimento Nutrilite</h1>
        <p>Visualize os indicadores de perda, rendimento e matéria-prima dos lotes de produção.</p>
      </header>

      <div class="controls">
        <div class="select-container">
          <label for="period">Escolha o Período:</label>
          <select id="period" v-model="selectedPeriod">
            <option value="semana">Semana</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        <div class="select-container">
          <label for="lots">Escolha os Lotes:</label>
          <select id="lots" v-model="selectedLotes" multiple>
            <option v-for="lot in lotes" :key="lot.id" :value="lot.id">
              Lote {{ lot.id }}
            </option>
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

      <div class="insights">
        <h2>Insights</h2>
        <div class="summary">
          <div v-if="summary">
            <div><strong>Média de Perda (%):</strong> {{ summary.avgPerda }}</div>
            <div><strong>Média de Rendimento (%):</strong> {{ summary.avgRendimento }}</div>
            <div><strong>Média de Matéria Prima (kg):</strong> {{ summary.avgMateriaPrima }}</div>
          </div>
          <div v-if="highestLoss">
            <div><strong>Lote com Maior Perda (%):</strong> Lote {{ highestLoss.lote }} ({{ highestLoss.perda }}%)</div>
          </div>
          <div v-if="highestYield">
            <div><strong>Lote com Maior Rendimento (%):</strong> Lote {{ highestYield.lote }} ({{ highestYield.rendimento }}%)</div>
          </div>
        </div>
      </div>

      <ProductionChart 
        :period="selectedPeriod" 
        :lotes="selectedLotes" 
        :chartType="selectedChartType" 
      />

      <div class="data-table">
        <h3>Dados Brutos</h3>
        <table v-if="rawData.length > 0">
          <thead>
            <tr>
              <th>Período</th>
              <th>Perda (%)</th>
              <th>Rendimento (%)</th>
              <th>Matéria Prima (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rawData" :key="index">
              <td>{{ item.period }}</td>
              <td>{{ item.perda }}</td>
              <td>{{ item.rendimento }}</td>
              <td>{{ item.materiaPrima }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
      selectedPeriod: 'mensal',
      selectedLotes: [1],
      selectedChartType: 'bar',
      lotes: [
        { id: 1, name: 'Lote 1' },
        { id: 2, name: 'Lote 2' },
        { id: 3, name: 'Lote 3' }
      ],
      summary: null,
      highestLoss: null,
      highestYield: null,
      rawData: []
    };
  },
  watch: {
    selectedPeriod(newPeriod) {
      this.fetchData(newPeriod, this.selectedLotes);
    },
    selectedLotes(newLotes) {
      this.fetchData(this.selectedPeriod, newLotes);
    }
  },
  mounted() {
    this.fetchData(this.selectedPeriod, this.selectedLotes);
  },
  methods: {
    fetchData(period) {
      let response = [];
      if (period === 'mensal') {
        response = [
          { period: 'Janeiro', perda: 12, rendimento: 88, materiaPrima: 100 },
          { period: 'Fevereiro', perda: 10, rendimento: 90, materiaPrima: 98 },
          { period: 'Março', perda: 15, rendimento: 85, materiaPrima: 105 }
        ];
      } else if (period === 'semana') {
        response = [
          { period: 'Semana 1', perda: 5, rendimento: 95, materiaPrima: 30 },
          { period: 'Semana 2', perda: 8, rendimento: 92, materiaPrima: 35 },
          { period: 'Semana 3', perda: 10, rendimento: 90, materiaPrima: 40 }
        ];
      } else {
        response = [
          { period: '2023', perda: 12, rendimento: 88, materiaPrima: 1200 },
          { period: '2024', perda: 10, rendimento: 90, materiaPrima: 1180 }
        ];
      }

      // Armazenando dados brutos para a tabela
      this.rawData = response;

      // Cálculo dos resumos (média e maiores indicadores)
      const avgPerda = response.reduce((acc, item) => acc + item.perda, 0) / response.length;
      const avgRendimento = response.reduce((acc, item) => acc + item.rendimento, 0) / response.length;
      const avgMateriaPrima = response.reduce((acc, item) => acc + item.materiaPrima, 0) / response.length;

      this.summary = {
        avgPerda: avgPerda.toFixed(2),
        avgRendimento: avgRendimento.toFixed(2),
        avgMateriaPrima: avgMateriaPrima.toFixed(2)
      };

      this.highestLoss = response.reduce((max, item) => (item.perda > max.perda ? item : max), response[0]);
      this.highestYield = response.reduce((max, item) => (item.rendimento > max.rendimento ? item : max), response[0]);
    }
  }
};
</script>

<style scoped>
/* Definição de fontes modernas */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

/* Cor do fundo e container principal */
body {
  background-color: #f7f8fc;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  font-size: 2.5rem;
  color: #2f4e7d;
}

header p {
  font-size: 1.1rem;
  color: #555;
}

/* Controle de seleção */
.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.select-container {
  flex: 1;
  margin: 0 10px;
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

select:hover,
select:focus {
  border-color: #4db8ff;
}

/* Estilo para o painel de Insights */
.insights {
  margin-top: 30px;
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary {
  display: flex;
  justify-content: space-between;
}

.summary div {
  font-weight: 600;
  color: #4db8ff;
}

.summary div strong {
  color: #333;
}

/* Estilo para os gráficos */
.chart-container {
  margin-top: 40px;
}

/* Estilo para a Tabela de Dados */
.data-table {
  margin-top: 40px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 1rem;
}

table th {
  background-color: #4db8ff;
  color: white;
}

table tr:nth-child(even) {
  background-color: #f4f8fb;
}

/* Efeito de transição suave para interatividade */
table tr:hover {
  background-color: #e8f5fd;
  cursor: pointer;
}
</style>