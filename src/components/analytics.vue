<template>
  <div id="Analytics">
    <h1>{{msg}}</h1>
    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows stuff</h4>
          <chart class="wrapper" :type="'bar-chart'" :options="{}" :query="{start: '2017-11-05', end: '2017-11-11', event: 'Card Saved'}"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows other stuff</h4>
          <chart class="wrapper" :type="'line-chart'" :options="{}" :query="{start: '2017-11-03', end: '2017-11-07', event: 'Card Saved'}"></chart>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Chart from './charts/chart'

Vue.use(VueAxios, axios)

export default {
  name: 'Analytics',
  data() {
    return {
      msg: 'Welcome analytics'
    }
  },
  components: {
    chart: Chart
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
