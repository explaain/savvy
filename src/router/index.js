import Vue from 'vue'
import Router from 'vue-router'

// Components for dashboard
import Home from '@/components/home'
import Analytics from '@/components/analytics'
import Notifications from '@/components/notifications'
import Explorer from '@/components/explorer/explorer'
import Team from '@/components/team'
import Help from '@/components/help'
import Billing from '@/components/billing'

Vue.use(Router)

var firebaseConfig = {
  apiKey: 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU',
  authDomain: 'forgetmenot-1491065404838.firebaseapp.com',
  databaseURL: 'https://forgetmenot-1491065404838.firebaseio.com',
  projectId: 'forgetmenot-1491065404838',
  storageBucket: '',
  messagingSenderId: '400087312665'
}
var algoliaParams = { // Need to fetch these from app.vue to avoid duplication!
  appID: 'I2VKMNNAXI',
  apiKey: '2b8406f84cd4cc507da173032c46ee7b',
  index: 'Savvy'
}
var authorParams = {
  // url: 'https://forget-me-not--app.herokuapp.com/api/memories',
  // url: '//forget-me-not--staging.herokuapp.com/api/memories',
  url: '//localhost:5000/api/memories',
  importUrl: '//forget-me-not--staging.herokuapp.com/api/import'
}
// var userID = '101118387301286232222'
var logo = '../../assets/logo.png'

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/analytics',
      component: Analytics
    },
    {
      path: '/notifications',
      component: Notifications
    },
    {
      path: '/card-manager',
      component: Explorer,
      props: (route) => ({ firebaseConfig: firebaseConfig, algoliaParams: algoliaParams, authorParams: authorParams, logo: logo })
    },
    {
      path: '/team',
      component: Team
    },
    {
      path: '/help',
      component: Help
    },
    {
      path: '/billing',
      component: Billing
    }
  ]
})
