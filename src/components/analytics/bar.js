// CommitChart.js
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: ['data', 'options'],
  mounted () {
    const self = this
    self.renderChart(self.data)
  }
}
