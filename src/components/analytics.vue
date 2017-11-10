<template>
  <div id="Analytics">
    <h1>{{msg}}</h1>

    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows stuff</h4>
          <exampleline class="wrapper" :chartData="data" :options="options"></exampleline>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows other stuff</h4>
          <exampleline class="wrapper" :chartData="data" :options="options"></exampleline>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows even more other stuff</h4>
          <examplebar class="wrapper" :chartData="dataBar" :options="optionsBar"></examplebar>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
// const fetchData = require('../scripts/fetch-data-mixpanel')
import LineChart from './charts/line-chart'
import BarChart from './charts/bar-chart'
// const fetchData = require('../scripts/fetch-data-mixpanel')

export default {
  name: 'Analytics',
  data() {
    return {
      msg: 'Welcome analytics',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
          label: 'GitHub Commits',
          backgroundColor: '#f87979',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        }]
      },
      options: {},
      dataBar: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
          label: 'Testing Commits',
          backgroundColor: '#f43759',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        }]
      },
      optionsBar: {}
    }
  },
  components: {
    exampleline: LineChart,
    examplebar: BarChart
  },
}
</script>

<style lang="css">
.wrapper {
  width: 100%;
  height: 80%;
  margin: 0px auto;
}

</style>
