<template>
  <bar-chart></bar-chart>
</template>

<script>
import BarChart from '../../charts/bar-chart.js'

export default {
  data () {
    return {
      BarChart
    }
  },
  components: {
    BarChart: BarChart
  }
}
</script>
