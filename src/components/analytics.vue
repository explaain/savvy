<template>
  <div id="Analytics">
    <h1>{{msg}}</h1>
    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>Active Users</h4>
          <chart class="wrapper" :type="'line-chart'" :options="{}" :query="{start: '2017-11-05', end: todayFormatted, event: 'User logged in'}"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>This graph shows other stuff</h4>
          <chart class="wrapper" :type="'bar-chart'" :options="{}" :query="{start: '2017-11-03', end: '2017-11-07', event: 'Card Saved'}"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>Savvy Employees</h4>
          <chart class="wrapper" :type="'pie-chart'" :options="{}" :query="{start: '2017-11-03', end: '2017-11-07', event: 'Card Saved'}"></chart>
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

const today = new Date()
const dd = today.getDate()
const mm = today.getMonth() + 1 // January is 0!
const yyyy = today.getFullYear()

export default {
  name: 'Analytics',
  data() {
    return {
      msg: 'Welcome analytics',
      todayFormatted: yyyy + '-' + mm + '-' + dd
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
