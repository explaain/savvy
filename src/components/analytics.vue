<template>
  <div id="Analytics">
    <h1>{{msg}}</h1>

    <div class="graph-card">
      <h4>This graph shows stuff</h4>
      <example-bar class="wrapper"></example-bar>
    </div>
    <div class="graph-card">
      <h4>This graph shows other stuff</h4>
      <example-bar class="wrapper"></example-bar>
    </div>
  </div>
</template>

<script>
import LineChart from './explorer/vue-charts/line-chart.vue'
import BarChart from './explorer/vue-charts/bar-chart.vue'

export default {
  name: 'Analytics',
  data () {
    return {
      msg: 'Welcome analytics',
      dataPoints: null
    }
  },
  components: {
    MonthlyIncome: LineChart,
    ExampleBar: BarChart
  },
  methods: {
    fillData () {
      this.dataPoints = {
        labels: ['January' + this.getRandomInt(), 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          }
        ]
      }
    }
  }
}
</script>

<style lang="css">
.wrapper {
  width: 500px;
  height: 200px;
  margin: 0px auto;
}

</style>
