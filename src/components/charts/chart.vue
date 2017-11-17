<template>
  <div class="">
    <button type="button" name="button" @click="fetchData">Refresh</button>
    <component v-bind:is="type" :chartData="data" :options="computedOptions"></component>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import LineChart from './line-chart'
import BarChart from './bar-chart'
import PieChart from './pie-chart'

Vue.use(VueAxios, axios)

const today = new Date()
const dd = today.getDate()
const mm = today.getMonth() + 1 // January is 0!
const yyyy = today.getFullYear()

export default {
  name: 'Chart',
  props: [
    'base',
    'type',
    'query',
    'options'
  ],
  data() {
    return {
      data: {},
      todayFormatted: yyyy + '-' + mm + '-' + dd
    }
  },
  computed: {
    computedQuery: function() {
      const result = this.query
      result.organisationID = this.base.organisation.id || 'explaain'
      if (!result.end) result.end = this.todayFormatted
      return result
    },
    computedOptions: function() {
      const result = this.options
      result.legend = { display: !!result.legend }
      return result
    }
  },
  components: {
    'line-chart': LineChart,
    'bar-chart': BarChart,
    'pie-chart': PieChart
  },
  created: function() {
    this.fetchData()
  },
  methods: {
    fetchData: function() {
      const self = this
      const url = 'http://localhost:3000/analytics/fetch'
      Vue.axios.post(url, self.computedQuery)
      .then((response) => {
        console.log('the response', response)
        var data = {}
        const formattedData = {}
        switch (self.options.sumMethod) {
          case 'blocks':
            data = response.data.values
            formattedData.labels = Object.keys(data)
            formattedData.data = Object.keys(data).map(key => Object.keys(data[key]).reduce((sum, dataKey) => parseInt(sum) + parseInt(data[key][dataKey]), 0))
            break
          default:
            data = response.data.values[self.computedQuery.event]
            formattedData.labels = Object.keys(data).sort()
            formattedData.data = Object.keys(data).sort().map(key => data[key])
        }
        console.log(formattedData)
        if (self.options.order) {
          const combined = formattedData.labels.map((label, i) => { return { label: label, data: formattedData.data[i] } })
          const ordered = combined.sort((a, b) => (self.options.order === 'desc' ? b.data - a.data : a.data - b.data))
          formattedData.labels = ordered.map(dataPoint => dataPoint.label)
          formattedData.data = ordered.map(dataPoint => dataPoint.data)
        }
        self.data = {
          labels: formattedData.labels,
          datasets: [{
            label: self.computedQuery.event,
            backgroundColor: '#f43759',
            data: formattedData.data
          }]
        }
        // console.log(self.data)
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
