<template>
  <line-chart></line-chart>
</template>

<script>
import {Line} from 'vue-chartjs'

export default Line.extend({
  components: {
    LineChart: Line
  },
  mounted() {
    this.renderChart({
      labels: [],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: '#FC2525',
          data: [40, 39, 10, 40, 39, 80, 40]
        },
        {
          label: 'Data Two',
          backgroundColor: '#05CBE1',
          data: [60, 55, 32, 10, 2, 12, 53]
        }
      ]
    }, {responsive: true, maintainAspectRatio: false})
  }
})
</script>
