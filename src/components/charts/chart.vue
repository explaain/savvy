<template>
  <div class="">
    <button type="button" name="button" @click="fetchData">Refresh</button>
    <component v-bind:is="type" :chartData="data" :options="options"></component>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import LineChart from './line-chart'
import BarChart from './bar-chart'

Vue.use(VueAxios, axios)

export default {
  name: 'Chart',
  props: [
    'type',
    'query',
    'options'
  ],
  data() {
    return {
      data: {}
    }
  },
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart
  },
  created: function() {
    this.fetchData()
  },
  methods: {
    fetchData: function() {
      const self = this
      const url = 'http://localhost:3000/analytics/fetch'
      Vue.axios.post(url, self.query)
      .then((response) => {
        const data = response.data[self.query.event]
        console.log(data)
        self.data = {
          labels: Object.keys(data),
          datasets: [{
            label: self.query.event,
            backgroundColor: '#f43759',
            data: Object.keys(data).map(key => data[key])
          }]
        }
        console.log(self.data)
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
