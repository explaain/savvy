<template>
  <div id="Analytics">
    <h1>{{msg}}</h1>

    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows stuff</h4>
          <barchart class="wrapper" :chartData="dataBar" :options="optionsBar"></barchart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows other stuff</h4>
          <barchart class="wrapper" :chartData="dataBar" :options="optionsBar"></barchart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows even more other stuff</h4>
          <!--<examplebar class="wrapper" :chartData="dataBar" :options="optionsBar"></examplebar> -->
          <component v-bind:is="chartType" :chartData="dataLine" :options="optionsLine"></component>
          <button v-on:click="fetchData('2017-11-05', '2017-11-11', 'Card Saved')">Get data!</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import LineChart from './charts/line-chart'
import BarChart from './charts/bar-chart'

Vue.use(VueAxios, axios)

export default {
  name: 'Analytics',
  data() {
    return {
      msg: 'Welcome analytics',
      dataLine: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
          label: 'GitHub Commits',
          backgroundColor: '#f87979',
          data: []
        }]
      },
      optionsLine: {},
      dataBar: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
          label: 'Testing Commits',
          backgroundColor: '#f43759',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        }]
      },
      optionsBar: {},
      chartType: 'linechart'
    }
  },
  components: {
    linechart: LineChart,
    barchart: BarChart
  },
  methods: {
    fetchData: function(start, end, event) {
      const url = 'http://localhost:3000/analytics/fetch'
      const data = {
        start: start,
        end: end,
        event: event
      }
      Vue.axios.post(url, data)
      .then((response) => {
        console.log(response)
        console.log(this.$data.dataLine.datasets.data)
        this.$data.dataLine.datasets.data = response.data.data.value
      }).catch(function(error) {
        console.log(error)
      })
    }
  }
}
</script>

<style lang="css">
.wrapper {
  width: 100%;
  height: 80%;
  margin: 0px auto;
}

</style>
