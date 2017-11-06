import {Line, mixins} from 'vue-chartjs'

export default Line.extend({
  mixins: [mixins.reactiveProp],
  props: ['data', 'options'],
  mounted() {
    const self = this
    this.renderChart(self.data, self.options)
  }
})
