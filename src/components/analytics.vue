<template>
  <div id="Analytics">
    <h1><span class="emoji">📈</span> Analytics</h1>
    <h2>View how your company knowledge is being used, where and by whom.</h2>
    <div class="graph-grid">
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Most Active Users" :type="'pie-chart'" :options="{ color: '#CF60AA', sumMethod: 'blocks' }" :query="{ start: '2017-11-02', event: 'Card Clicked', properties: ['cardID']  }"></chart>
        </div>
      </div>
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Most popular searches" :type="'bar-chart'" :options="{ color: '#DA5FE6', sumMethod: 'blocks', order: 'desc', ignoreLabels: ['', '1'] }" :query="{ start: '2017-11-03', event: 'Searched',  properties: ['searchQuery'], limit: 7 }"></chart>
        </div>
      </div>
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="User Activity over Time" :type="'line-chart'" :options="{ color: '#E65F76' }" :query="{ start: '2017-11-05', event: 'User logged in' }"></chart>
        </div>
      </div>
    <!-- </div>
    <div class="graph-grid"> -->
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Content Overview" :type="'bar-chart'" :options="{ color: '#DC685B' }" :query="{ start: '2017-11-03', event: 'Card Created' }"></chart>
        </div>
      </div>
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Team Usage Over Time" :type="'line-chart'" :options="{ color: 'rgb(100, 84, 244)' }" :query="{ start: '2017-11-03', event: 'Card Clicked' }"></chart>
        </div>
      </div>
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Savvy Employees" :type="'line-chart'" :options="{ color: '#AD5BDC', sumMethod: 'blocks', legend: true }" :query="{ start: '2017-11-03', event: 'Card Created', properties: ['userID'] }"></chart>
        </div>
      </div>
    <!-- </div>
    <div class="graph-grid"> -->
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Most Popular Cards" :type="'bar-chart'" :options="{ color: '#DA5FE6', sumMethod: 'blocks', order: 'desc' }" :query="{ start: '2017-11-03',event: 'Card Clicked',  properties: ['description'], limit: 4 }"></chart>
        </div>
      </div>
      <div class="block">
        <div class="graph-card">
          <chart class="wrapper" :base="base" title="Team Adoption" :type="'bar-chart'" :options="{ color: '#CF60AA', sumMethod: 'blocks' }" :query="{ start: '2017-11-03', event: 'Card Clicked',  properties: ['userID'] }"></chart>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
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
    chart: Chart,
    icon: Icon
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
.graph-grid > .block {
  display: inline-block;
  width: calc(50% - 110px);
  margin: 10px;
  padding: 20px 40px 40px;
}

</style>
