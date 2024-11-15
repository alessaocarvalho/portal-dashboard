<template>
  <div class="chart-container">
    <div v-if="chartData.labels.length === 0">Carregando dados...</div>
    <component :is="chartComponent" :data="chartData" :options="chartOptions" height="400px" />
  </div>
</template>

<script>
import { Bar, Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Registra os elementos necessários
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default {
  name: 'ProductionChart',
  components: {
    Bar,
    Line
  },
  props: {
    period: {
      type: String,
      default: 'mensal'
    },
    lot: {
      type: Number,
      default: 1
    },
    chartType: {
      type: String,
      default: 'bar'
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Perda (%)',
            backgroundColor: '#FF5252', // Cor para a perda
            data: []
          },
          {
            label: 'Rendimento (%)',
            backgroundColor: '#42A5F5', // Cor para o rendimento
            data: []
          },
          {
            label: 'Matéria Prima Necessária (kg)',
            backgroundColor: '#FFEB3B', // Cor para a matéria prima
            data: []
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Indicadores de Perda, Rendimento e Matéria Prima'
          }
        }
      }
    };
  },
  computed: {
    chartComponent() {
      return this.chartType === 'bar' ? Bar : Line; // Troca entre tipos de gráficos
    }
  },
  watch: {
    period(newPeriod) {
      this.fetchData(newPeriod, this.lot); // Refaz a requisição sempre que o período mudar
    },
    lot(newLot) {
      this.fetchData(this.period, newLot); // Refaz a requisição sempre que o lote mudar
    }
  },
  mounted() {
    this.fetchData(this.period, this.lot); // Chama a função com o período e lote inicial
  },
  methods: {
    fetchData(period) {
      let response;

      // Dados fictícios para simular a troca de períodos e lotes
      if (period === 'mensal') {
        response = [
          { month: 'Janeiro', perda: 12, rendimento: 88, materiaPrima: 100 },
          { month: 'Fevereiro', perda: 10, rendimento: 90, materiaPrima: 98 },
          { month: 'Março', perda: 15, rendimento: 85, materiaPrima: 105 }
        ];
      } else if (period === 'semana') {
        response = [
          { week: 'Semana 1', perda: 5, rendimento: 95, materiaPrima: 30 },
          { week: 'Semana 2', perda: 8, rendimento: 92, materiaPrima: 35 },
          { week: 'Semana 3', perda: 10, rendimento: 90, materiaPrima: 40 }
        ];
      } else { // Anual
        response = [
          { year: '2023', perda: 12, rendimento: 88, materiaPrima: 1200 },
          { year: '2024', perda: 10, rendimento: 90, materiaPrima: 1180 }
        ];
      }

      // Atualiza os dados no gráfico
      const periods = response.map(item => item.month || item.week || item.year);
      const perdas = response.map(item => item.perda);
      const rendimentos = response.map(item => item.rendimento);
      const materiaPrima = response.map(item => item.materiaPrima);

      this.chartData.labels = periods;
      this.chartData.datasets[0].data = perdas;
      this.chartData.datasets[1].data = rendimentos;
      this.chartData.datasets[2].data = materiaPrima;
    }
  }
};
</script>

<style scoped>
.chart-container {
  margin-top: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
