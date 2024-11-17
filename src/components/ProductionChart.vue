<template>
  <div class="chart-container">
    <div v-if="isLoading">Carregando dados...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <component :is="chartComponent" :data="chartData" :options="chartOptions" height="400px" />
    </div>
  </div>
</template>

<script>
import { Bar, Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

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
    orders: {
      type: Array,
      default: () => [1314701001]
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
              boxWidth: 10,
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Indicadores de Rendimento e Matéria Prima'
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const label = tooltipItem.dataset.label || '';
                const value = tooltipItem.raw;
                return `${label}: ${value} kg`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            ticks: {
              callback: (value) => `${value} kg`,
              stepSize: 100
            }
          },
          y2: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              callback: (value) => `${value} kg`,
              stepSize: 100
            }
          },
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            }
          }
        }
      },
      isLoading: false,
      error: null
    };
  },
  computed: {
    chartComponent() {
      return this.chartType === 'bar' ? Bar : Line;
    }
  },
  watch: {
    period(newPeriod) {
      this.fetchData(newPeriod, this.orders);
    },
    orders(newOrders) {
      this.fetchData(this.period, newOrders);
    }
  },
  mounted() {
    this.fetchData(this.period, this.orders);
  },
  methods: {
    async fetchData(period, orders) {
      this.isLoading = true;
      this.error = null;

      try {
        // Ajuste para realizar a consulta de acordo com a ordem de produção
        const materiaPrimaResponse = await fetch(`http://localhost:3000/api/get_soma_materia_prima?ordemProducao=${orders.join(',')}`);
        const concentradoResponse = await fetch(`http://localhost:3000/api/get_soma_concentrado?ordemProducao=${orders.join(',')}`);

        if (!materiaPrimaResponse.ok || !concentradoResponse.ok) {
          throw new Error('Falha ao obter dados da API.');
        }

        const materiaPrimaData = await materiaPrimaResponse.json();
        const concentradoData = await concentradoResponse.json();

        // Filtrando os dados de acordo com as ordens de produção
        const filteredMateriaPrima = materiaPrimaData.filter(item => orders.includes(parseInt(item['ordemProducao'])));
        const filteredConcentrado = concentradoData.filter(item => orders.includes(parseInt(item['ordemProducao'])));

        // Agrupando dados com base no período
        const groupedData = this.aggregateData(filteredMateriaPrima, filteredConcentrado, period);

        const periods = groupedData.map(item => item.period);

        // Construindo datasets para o gráfico
        const datasets = orders.flatMap((order) => {
          return [
            {
              label: `Matéria Prima (kg) - Ordem ${order}`,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 65%)`,
              data: groupedData.map(item => item.materiaPrima),
              yAxisID: 'y2'
            },
            {
              label: `Concentrado (kg) - Ordem ${order}`,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 75%)`,
              data: groupedData.map(item => item.concentrado),
              yAxisID: 'y'
            }
          ];
        });

        this.chartData.labels = periods;
        this.chartData.datasets = datasets;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    aggregateData(materiaPrimaData, concentradoData, period) {
      const aggregatedData = [];

      if (period === 'mensal') {
        const months = [...new Set(materiaPrimaData.map(item => item['mes']))];
        months.forEach(month => {
          const materiaPrimaQuantity = materiaPrimaData
            .filter(item => item['mes'] === month)
            .reduce((acc, item) => acc + parseFloat(item['somaMateriaPrima']), 0);

          const concentradoQuantity = concentradoData
            .filter(item => item['mes'] === month)
            .reduce((acc, item) => acc + parseFloat(item['somaConcentrado']), 0);

          aggregatedData.push({
            period: month,
            materiaPrima: materiaPrimaQuantity,
            concentrado: concentradoQuantity
          });
        });
      }

      return aggregatedData;
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