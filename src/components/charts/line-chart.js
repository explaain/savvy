import {Line, mixins} from 'vue-chartjs'

export default{
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['options'],
  mounted() {
    const self = this
    console.log('hello')
    this.renderChart(self.chartData, self.options)
  }
}
