<template>
  <div class="Analytics">
    <h1>{{msg}}</h1>
    <barchart :data="data" :options="options"></barchart>
  </div>
</template>

<script>
import BarChart from './analytics/bar.js'

export default {
  name: 'Analytics',
  data () {
    return {
      msg: 'Welcome analytics',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [
          {
            label: 'GitHub Commits',
            backgroundColor: '#f87979',
            data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
          }
        ]
      },
      options: {}
    }
  },
  components: {
    barchart: BarChart
  }
}
</script>
