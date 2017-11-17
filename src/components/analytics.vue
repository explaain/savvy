<template>
  <div id="Analytics">
    <h1>{{msg}}</h1>
    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>Content Overview</h4>
          <chart class="wrapper" :base="base" :type="'bar-chart'" :options="{}" :query="{ start: '2017-11-03', event: 'Card Saved' }"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>Active Users</h4>
          <chart class="wrapper" :base="base" :type="'line-chart'" :options="{}" :query="{ start: '2017-11-05', event: 'User logged in' }"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>Savvy Employees</h4>
          <chart class="wrapper" :base="base" :type="'pie-chart'" :options="{ legend: true }" :query="{ start: '2017-11-03', end: '2017-11-07', event: 'Card Saved' }"></chart>
        </div>
      </div>
    </div>
    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>Active Users</h4>
          <chart class="wrapper" :base="base" :type="'bar-chart'" :options="{ sumMethod: 'blocks' }" :query="{ start: '2017-11-02', event: 'Card Clicked', properties: ['cardID']  }"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>Most popular searches</h4>
          <chart class="wrapper" :base="base" :type="'bar-chart'" :options="{ sumMethod: 'blocks', order: 'desc' }" :query="{ start: '2017-11-03',event: 'Searched',  properties: ['searchQuery'], limit: 4 }"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>Team Usage Over Time</h4>
          <chart class="wrapper" :base="base" :type="'line-chart'" :options="{}" :query="{ start: '2017-11-03', event: 'Card Clicked' }"></chart>
        </div>
      </div>
    </div>
    <div class="graph-grid">
      <div class="column">
        <div class="graph-card">
          <h4>Most Popular Cards</h4>
          <chart class="wrapper" :base="base" :type="'bar-chart'" :options="{ sumMethod: 'blocks', order: 'desc' }" :query="{ start: '2017-11-03',event: 'Card Clicked',  properties: ['description'], limit: 4 }"></chart>
        </div>
      </div>
      <div class="column">
        <div class="graph-card">
          <h4>Team Adoption</h4>
          <chart class="wrapper" :base="base" :type="'bar-chart'" :options="{ sumMethod: 'blocks' }" :query="{ start: '2017-11-03', event: 'Card Clicked',  properties: ['userID'] }"></chart>
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
  props: [
    'organisation',
    'auth'
  ],
  data() {
    return {
      msg: 'Welcome analytics'
    }
  },
  components: {
    chart: Chart
  },
  computed: {
    base: function() {
      return {
        organisation: this.organisation
        // user: this.auth.user
      }
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
