

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
        // Consultas para as APIs
        const materiaPrimaResponse = await fetch(`http://localhost:3000/api/get_soma_materia_prima`);
        const concentradoResponse = await fetch(`http://localhost:3000/api/get_soma_concentrado`);

        if (!materiaPrimaResponse.ok || !concentradoResponse.ok) {
          throw new Error('Falha ao obter dados da API.');
        }

        const materiaPrimaData = await materiaPrimaResponse.json();
        const concentradoData = await concentradoResponse.json();

        // Verificando se os dados estão completos
        if (!materiaPrimaData || !concentradoData) {
          throw new Error('Dados da API estão incompletos.');
        }

        // Agrupando os dados com base no período (mensal, por exemplo)
        const groupedData = this.aggregateData(materiaPrimaData, concentradoData, period);

        const periods = groupedData.map(item => item.period);

        // Criando os datasets para o gráfico
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

        // Atualizando os dados do gráfico
        this.chartData.labels = periods;
        this.chartData.datasets = datasets;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    // Função para agrupar dados por período
    aggregateData(materiaPrimaData, concentradoData, period) {
      const aggregatedData = [];

      if (period === 'mensal') {
        // Agrupando por mês
        const months = [...new Set(materiaPrimaData.map(item => item.Mês))];

        months.forEach(month => {
          const materiaPrimaQuantity = materiaPrimaData
            .filter(item => item.Mês === month)
            .reduce((acc, item) => acc + parseFloat(item['Soma de Matéria-prima (Kg)'] || 0), 0);

          const concentradoQuantity = concentradoData
            .filter(item => item.Mês === month)
            .reduce((acc, item) => acc + parseFloat(item['Soma de Concentrado (Kg)'] || 0), 0);

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