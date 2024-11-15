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
    lotes: {
      type: Array,
      default: () => [1]
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
        datasets: []
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 10, // Tamanho do ícone da legenda
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Indicadores de Perda, Rendimento e Matéria Prima'
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.dataset.label || '';
                const value = tooltipItem.raw;
                return `${label}: ${value} ${tooltipItem.dataset.yAxisID === 'y' ? '%' : 'kg'}`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            ticks: {
              callback: (value) => `${value}%`, // Formato para perda e rendimento
              stepSize: 5
            }
          },
          y2: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false // Evita a sobreposição da grade
            },
            ticks: {
              callback: (value) => `${value} kg`, // Formato para matéria-prima
              stepSize: 100
            }
          },
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10, // Limita a quantidade de labels no eixo X
            }
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
      this.fetchData(newPeriod, this.lotes); // Refaz a requisição sempre que o período ou lotes mudarem
    },
    lotes(newLotes) {
      this.fetchData(this.period, newLotes); // Refaz a requisição sempre que o lote mudar
    }
  },
  mounted() {
    this.fetchData(this.period, this.lotes); // Chama a função com o período e lotes iniciais
  },
  methods: {
    fetchData(period, lotes) {
      let response = [];

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

      // Definindo as labels com base no tipo de período
      const periods = response.map(item => item.month || item.week || item.year);
      
      // Criação de múltiplos datasets para cada lote selecionado
      const datasets = lotes.flatMap((lot) => {
        return [
          {
            label: `Perda (%) - Lote ${lot}`,
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 75%)`, // Cor aleatória para cada lote
            data: response.map(item => item.perda), // Dados de perda
            yAxisID: 'y' // Usando eixo y para perda
          },
          {
            label: `Rendimento (%) - Lote ${lot}`,
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 85%)`, // Cor aleatória para cada lote
            data: response.map(item => item.rendimento), // Dados de rendimento
            yAxisID: 'y' // Usando eixo y para rendimento
          },
          {
            label: `Matéria Prima (kg) - Lote ${lot}`,
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 65%)`, // Cor aleatória para cada lote
            data: response.map(item => item.materiaPrima), // Dados de matéria-prima
            yAxisID: 'y2' // Usando eixo y2 para matéria-prima
          }
        ];
      });

      this.chartData.labels = periods;
      this.chartData.datasets = datasets;
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