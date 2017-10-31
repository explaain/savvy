<template>
  <line-chart></line-chart>
</template>

<script>
import LineChart from '../../charts/line-chart.js'

export default {
  data () {
    return {
      LineChart
    }
  },
  components: {
    LineChart: LineChart
  }
}
</script>
