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
            text: 'Indicadores de Perda e Rendimento'
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
      this.fetchData(newPeriod); // Refaz a requisição sempre que o período mudar
    },
    chartType(newChartType) {
      this.chartOptions.type = newChartType; // Atualiza o tipo de gráfico
    }
  },
  mounted() {
    this.fetchData(this.period); // Chama a função com o período inicial
  },
  methods: {
    fetchData(period) {
      let response;

      // Dados fictícios para simular a troca de períodos
      if (period === 'mensal') {
        response = [
          { month: 'Janeiro', perda: 10, rendimento: 90 },
          { month: 'Fevereiro', perda: 15, rendimento: 85 },
          { month: 'Março', perda: 5, rendimento: 95 },
          { month: 'Abril', perda: 20, rendimento: 80 },
          { month: 'Maio', perda: 8, rendimento: 92 }
        ];
      } else if (period === 'trimestral') {
        response = [
          { month: '1º Trimestre', perda: 15, rendimento: 85 },
          { month: '2º Trimestre', perda: 10, rendimento: 90 },
          { month: '3º Trimestre', perda: 20, rendimento: 80 },
          { month: '4º Trimestre', perda: 8, rendimento: 92 }
        ];
      } else { // Anual
        response = [
          { month: '2023', perda: 12, rendimento: 88 },
          { month: '2024', perda: 10, rendimento: 90 }
        ];
      }

      // Simula a adição incremental de dados
      const months = response.map(item => item.month);
      const perdas = response.map(item => item.perda);
      const rendimentos = response.map(item => item.rendimento);

      this.chartData.labels = months;
      this.chartData.datasets[0].data = perdas;
      this.chartData.datasets[1].data = rendimentos;
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