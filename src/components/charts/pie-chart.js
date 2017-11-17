import {Pie, mixins} from 'vue-chartjs'

export default{
  extends: Pie,
  mixins: [mixins.reactiveProp],
  props: ['options'],
  mounted() {
    const self = this
    this.renderChart(self.chartData, self.options)
  }
}
