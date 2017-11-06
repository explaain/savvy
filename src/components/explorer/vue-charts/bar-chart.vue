<template>
  <bar-chart></bar-chart>
</template>

<script>
import {Bar} from 'vue-chartjs'

export default {
  extends: Bar,
  components: {
    BarChart: Bar
  },
  props: ['data', 'options'],
  mounted() {
    const self = this
    this.renderChart(self.data, self.options)
  }
}
</script>
