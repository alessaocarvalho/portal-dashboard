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
    lots: {
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
            position: 'top'
          },
          title: {
            display: true,
            text: 'Indicadores de Perda, Rendimento e Matéria-Prima'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            ticks: {
              callback: value => `${value}%` // Formata como porcentagem
            }
          },
          y2: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false // Evita sobreposição de grades
            },
            ticks: {
              callback: value => `${value} kg` // Formata como kg
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
      this.fetchData(newPeriod, this.lots); // Atualiza ao mudar o período
    },
    lots(newLots) {
      this.fetchData(this.period, newLots); // Atualiza ao mudar os lotes
    }
  },
  mounted() {
    this.fetchData(this.period, this.lots); // Carrega os dados iniciais
  },
  methods: {
    fetchData(period, lots) {
      // Dados fictícios por lote e período
      const dataByLot = {
        1: [
          { period: 'Janeiro', perda: 12, rendimento: 88, materiaPrima: 100 },
          { period: 'Fevereiro', perda: 15, rendimento: 85, materiaPrima: 110 }
        ],
        2: [
          { period: 'Janeiro', perda: 10, rendimento: 90, materiaPrima: 95 },
          { period: 'Fevereiro', perda: 8, rendimento: 92, materiaPrima: 105 }
        ],
        3: [
          { period: 'Janeiro', perda: 20, rendimento: 80, materiaPrima: 120 },
          { period: 'Fevereiro', perda: 18, rendimento: 82, materiaPrima: 115 }
        ]
      };

      // Combina os dados dos lotes selecionados
      const combinedData = lots.flatMap(lot => dataByLot[lot] || []);

      // Agrupa os períodos
      const labels = [...new Set(combinedData.map(item => item.period))];

      // Cria datasets separados para cada lote
      const datasets = lots.flatMap(lot => {
        const lotData = dataByLot[lot] || [];
        return [
          {
            label: `Perda (%) - Lote ${lot}`,
            data: labels.map(label => lotData.find(d => d.period === label)?.perda || 0),
            borderColor: '#FF5252',
            backgroundColor: '#FF5252',
            yAxisID: 'y'
          },
          {
            label: `Rendimento (%) - Lote ${lot}`,
            data: labels.map(label => lotData.find(d => d.period === label)?.rendimento || 0),
            borderColor: '#42A5F5',
            backgroundColor: '#42A5F5',
            yAxisID: 'y'
          },
          {
            label: `Matéria Prima (kg) - Lote ${lot}`,
            data: labels.map(label => lotData.find(d => d.period === label)?.materiaPrima || 0),
            borderColor: '#FFC107',
            backgroundColor: '#FFC107',
            yAxisID: 'y2'
          }
        ];
      });

      this.chartData.labels = labels;
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
