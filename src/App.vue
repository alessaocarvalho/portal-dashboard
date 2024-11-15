<template>
  <div id="app">
    <div class="container">
      <header>
        <h1>Dashboard de Perda e Rendimento Nutrilite</h1>
        <p>Visualize os indicadores de perda, rendimento e matéria-prima dos lotes de produção com facilidade.</p>
      </header>

      <!-- Filtros de Dados -->
      <div class="controls">
        <div class="select-container">
          <label for="period">Escolha o Período:</label>
          <select id="period" v-model="selectedPeriod" @change="onPeriodChange">
            <option value="semana">Semana</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        <div class="select-container">
          <label for="lots">Escolha os Lotes:</label>
          <select id="lots" v-model="selectedLotes" multiple @change="onLotesChange">
            <option v-for="lot in lotes" :key="lot.id" :value="lot.id">
              Lote {{ lot.id }}
            </option>
          </select>
          <div v-if="selectedLotes.length">
            <p>{{ selectedLotes.length }} Lote(s) Selecionado(s)</p>
          </div>
        </div>

        <div class="select-container">
          <label for="chartType">Escolha o Tipo de Gráfico:</label>
          <select id="chartType" v-model="selectedChartType" @change="onChartTypeChange">
            <option value="bar">Barra</option>
            <option value="line">Linha</option>
          </select>
        </div>
      </div>

      <!-- Visão Geral com Alertas e Indicadores -->
      <div class="insights">
        <h2>Visão Geral e Indicadores</h2>
        <div class="summary">
          <div v-if="summary">
            <div><strong>Média de Perda (%):</strong> 
              <span :class="{'alert-red': summary.avgPerda > 10}">{{ summary.avgPerda }}%</span>
            </div>
            <div><strong>Média de Rendimento (%):</strong> {{ summary.avgRendimento }}%</div>
            <div><strong>Média de Matéria Prima (kg):</strong> {{ summary.avgMateriaPrima }} kg</div>
          </div>

          <div v-if="highestLoss">
            <div><strong>Lote com Maior Perda (%):</strong> Lote {{ highestLoss.lote }} ({{ highestLoss.perda }}%)</div>
          </div>
          <div v-if="highestYield">
            <div><strong>Lote com Maior Rendimento (%):</strong> Lote {{ highestYield.lote }} ({{ highestYield.rendimento }}%)</div>
          </div>
        </div>

        <!-- Alerta de Desempenho -->
        <div v-if="alert" class="alert-box">
          <p>{{ alert.message }}</p>
        </div>
      </div>

      <!-- Gráficos Dinâmicos -->
      <ProductionChart 
        :period="selectedPeriod" 
        :lotes="selectedLotes" 
        :chartType="selectedChartType" 
      />

      <!-- Tabela de Dados com Destaques -->
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
              <td :class="{'alert-red': item.perda > 10}">{{ item.perda }}</td>
              <td :class="{'alert-orange': item.rendimento < 85}">{{ item.rendimento }}</td>
              <td>{{ item.materiaPrima }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <p>Nenhum dado disponível para o período e lotes selecionados.</p>
        </div>
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
      rawData: [],
      alert: null
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

      // Verificar alertas
      if (avgPerda > 10) {
        this.alert = { message: 'Alerta: A média de perda está acima de 10%' };
      } else if (avgRendimento < 85) {
        this.alert = { message: 'Alerta: O rendimento médio está abaixo de 85%' };
      } else {
        this.alert = null;
      }
    },
    onPeriodChange() {
      console.log(`Período alterado para: ${this.selectedPeriod}`);
    },
    onLotesChange() {
      console.log(`Lotes alterados: ${this.selectedLotes}`);
    },
    onChartTypeChange() {
      console.log(`Tipo de gráfico alterado para: ${this.selectedChartType}`);
    }
  }
};
</script>

<style scoped>
/* Estilos gerais de alerta */
.alert-box {
  background-color: #ffdddd;
  color: red;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  border: 1px solid red;
}

.alert-red {
  color: red;
  font-weight: bold;
}

.alert-orange {
  color: orange;
  font-weight: bold;
}

/* Estilos e layout */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

header {
  background: linear-gradient(135deg, #4db8ff, #2f4e7d);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

header h1 {
  font-size: 3rem;
  font-weight: 600;
}

header p {
  font-size: 1.2rem;
  color: #dfe7f0;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.select-container {
  flex: 1;
  margin: 0 10px;
  min-width: 200px;
}

select {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  background-color: #f9f9f9;
}

select:focus {
  border-color: #2f4e7d;
}

.insights {
  background-color: #f1f8ff;
  padding: 20px;
  border-radius: 10px;
  margin-top: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.summary {
  display: flex;
  justify-content: space-between;
}

.data-table {
  margin-top: 40px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

table th, table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
}

table th {
  background-color: #4db8ff;
  color: white;
}

table tr:nth-child(even) {
  background-color: #f4f8fb;
}

table tr:hover {
  background-color: #e8f5fd;
  cursor: pointer;
}
</style>