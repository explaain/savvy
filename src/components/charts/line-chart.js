import {Line, mixins} from 'vue-chartjs'

export default{
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['data', 'options'],
  mounted() {
    const self = this
    this.renderChart(self.chartData, self.options)
  }
}
