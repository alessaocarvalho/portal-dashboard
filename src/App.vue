<template>
  <div id="app">
    <div class="container">
      <header>
        <h1>Dashboard de Perda e Rendimento Nutrilite</h1>
        <p>Visualize os indicadores de perda, rendimento e matéria-prima das ordens de produção com facilidade.</p>
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
          <label for="chartType">Escolha o Tipo de Gráfico:</label>
          <select id="chartType" v-model="selectedChartType" @change="onChartTypeChange">
            <option value="bar">Barra</option>
            <option value="line">Linha</option>
          </select>
        </div>

        <!-- Novas opções para níveis de alerta -->
        <div class="input-container">
          <label for="alertPerda">Nível de Alerta de Perda (%):</label>
          <input type="number" id="alertPerda" v-model="alertPerda" min="0" max="100" />
        </div>

        <div class="input-container">
          <label for="alertRendimento">Meta de Rendimento (%):</label>
          <input type="number" id="alertRendimento" v-model="alertRendimento" min="0" max="100" />
        </div>

        <!-- Select para ordens de produção -->
        <div class="select-container">
          <label for="orders">Escolha a Ordem de Produção:</label>
          <select id="orders" v-model="selectedOrders" @change="onOrdersChange">
            <option v-for="order in orders" :key="order.ordemProducao" :value="order.ordemProducao">
              Ordem {{ order.ordemProducao }}
            </option>
          </select>
        </div>
      </div>

      <!-- Visão Geral com Alertas e Indicadores -->
      <div class="insights">
        <h2>Visão Geral e Indicadores</h2>
        <div class="summary">
          <div v-if="summary">
            <div><strong>Média de Perda (%):</strong> 
              <span :class="{'alert-red': summary.avgPerda > alertPerda}">{{ summary.avgPerda }}%</span>
            </div>
            <div><strong>Média de Rendimento (%):</strong> 
              <span :class="{'alert-orange': summary.avgRendimento < alertRendimento}">{{ summary.avgRendimento }}%</span>
            </div>
            <div><strong>Média de Matéria Prima (kg):</strong> {{ summary.avgMateriaPrima }} kg</div>
          </div>

          <div v-if="highestLoss">
            <div><strong>Ordem de Produção com Maior Perda (%):</strong> Ordem {{ highestLoss.ordemProducao }} ({{ highestLoss.perda }}%)</div>
          </div>
          <div v-if="highestYield">
            <div><strong>Ordem de Produção com Maior Rendimento (%):</strong> Ordem {{ highestYield.ordemProducao }} ({{ highestYield.rendimento }}%)</div>
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
        :orders="selectedOrders" 
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
              <th>Concentrado (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rawData" :key="index">
              <td>{{ item.period }}</td>
              <td :class="{'alert-red': item.perda > alertPerda}">{{ item.perda }}</td>
              <td :class="{'alert-orange': item.rendimento < alertRendimento}">{{ item.rendimento }}</td>
              <td>{{ item.materiaPrima }}</td>
              <td>{{ item.concentrado }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <p>Nenhum dado disponível para o período e ordens de produção selecionadas.</p>
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
      selectedOrders: ['1314701001'],  // Exemplo de ordem de produção
      selectedChartType: 'bar',
      summary: null,
      highestLoss: null,
      highestYield: null,
      rawData: [],
      alert: null,
      alertPerda: 10,  // Valor de perda por padrão
      alertRendimento: 85, // Meta de rendimento por padrão
      orders: []  // Lista de ordens de produção a ser preenchida pela API
    };
  },
  watch: {
    selectedPeriod(newPeriod) {
      this.fetchData(newPeriod, this.selectedOrders);
    },
    selectedOrders(newOrders) {
      this.fetchData(this.selectedPeriod, newOrders);
    },
    alertPerda() {
      this.checkAlerts();
    },
    alertRendimento() {
      this.checkAlerts();
    }
  },
  mounted() {
    this.fetchData(this.selectedPeriod, this.selectedOrders);
  },
  methods: {
    // Função para buscar dados de matéria-prima e concentrado
    async fetchData(period, orders) {
      try {
        // Buscar os dados de matéria-prima
        const materiaPrimaResponse = await fetch('http://localhost:3000/api/get_soma_materia_prima');
        const concentradoResponse = await fetch('http://localhost:3000/api/get_soma_concentrado');

        if (!materiaPrimaResponse.ok || !concentradoResponse.ok) {
          throw new Error('Falha ao obter dados da API.');
        }

        const materiaPrimaData = await materiaPrimaResponse.json();
        const concentradoData = await concentradoResponse.json();

        // Filtrando as ordens de produção para garantir que são as mesmas
        const filteredMateriaPrimaData = materiaPrimaData.filter(item =>
          orders.includes(item.ordemProducao)
        );

        const filteredConcentradoData = concentradoData.filter(item =>
          orders.includes(item.ordemProducao)
        );

        // Agrupar os dados por ordem de produção e calcular perdas e rendimentos
        const groupedData = this.aggregateData(filteredMateriaPrimaData, filteredConcentradoData, period);

        this.rawData = groupedData;

        // Cálculo dos resumos
        const avgPerda = groupedData.reduce((acc, item) => acc + item.perda, 0) / groupedData.length;
        const avgRendimento = groupedData.reduce((acc, item) => acc + item.rendimento, 0) / groupedData.length;
        const avgMateriaPrima = groupedData.reduce((acc, item) => acc + item.materiaPrima, 0) / groupedData.length;

        this.summary = {
          avgPerda,
          avgRendimento,
          avgMateriaPrima
        };

        this.highestLoss = groupedData.reduce((max, item) => item.perda > max.perda ? item : max, groupedData[0]);
        this.highestYield = groupedData.reduce((max, item) => item.rendimento > max.rendimento ? item : max, groupedData[0]);

        this.checkAlerts(); // Verificar se há alertas

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    },

    // Função para agregar dados por período
    aggregateData(materiaPrimaData, concentradoData, period) {
      const aggregatedData = [];

      materiaPrimaData.forEach(materiaPrimaItem => {
        const correspondingConcentradoItem = concentradoData.find(item => item.ordemProducao === materiaPrimaItem.ordemProducao);

        if (correspondingConcentradoItem) {
          const periodValue = period === 'mensal' ? materiaPrimaItem.mes : (period === 'anual' ? materiaPrimaItem.ano : materiaPrimaItem.dia);

          const materiaPrimaQuantity = parseFloat(materiaPrimaItem.somaMateriaPrima || 0);
          const concentradoQuantity = parseFloat(correspondingConcentradoItem.somaConcentrado || 0);

          const perda = materiaPrimaQuantity ? ((materiaPrimaQuantity - concentradoQuantity) / materiaPrimaQuantity) * 100 : 0;
          const rendimento = materiaPrimaQuantity ? (concentradoQuantity / materiaPrimaQuantity) * 100 : 0;

          aggregatedData.push({
            period: periodValue,
            perda,
            rendimento,
            materiaPrima: materiaPrimaQuantity,
            concentrado: concentradoQuantity
          });
        }
      });

      return aggregatedData;
    },

    // Função de verificação de alertas
    checkAlerts() {
      if (this.summary) {
        if (this.summary.avgPerda > this.alertPerda) {
          this.alert = {
            message: `Alerta! A perda média (${this.summary.avgPerda}%) está acima do limite (${this.alertPerda}%)!`,
            type: 'red'
          };
        } else if (this.summary.avgRendimento < this.alertRendimento) {
          this.alert = {
            message: `Alerta! O rendimento médio (${this.summary.avgRendimento}%) está abaixo da meta (${this.alertRendimento}%)!`,
            type: 'orange'
          };
        } else {
          this.alert = null;
        }
      }
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

.input-container {
  flex: 1;
  margin: 0 10px;
  min-width: 200px;
}

select, input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  background-color: #f9f9f9;
}

select:focus, input:focus {
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