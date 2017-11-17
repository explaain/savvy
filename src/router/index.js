import Vue from 'vue'
import Router from 'vue-router'

// Components for dashboard
import Login from '@/components/login'
import Join from '@/components/join'
import Home from '@/components/home'
import Analytics from '@/components/analytics'
import Notifications from '@/components/notifications'
import Explorer from '@/components/explorer/explorer'
import Teams from '@/components/teams'
import Files from '@/components/files'
import Settings from '@/components/settings'
import Billing from '@/components/billing'
import Help from '@/components/help'

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
  url: '//localhost:3000/api/memories',
  // url: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/memories',
  importUrl: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/import'
}
// var userID = '101118387301286232222'
var logo = '../../assets/logo.png'

const router = new Router({
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/join',
      name: 'Join',
      component: Join
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      component: Analytics,
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      component: Notifications,
      meta: { requiresAuth: true }
    },
    {
      path: '/card-manager',
      component: Explorer,
      props: (route) => ({ firebaseConfig: firebaseConfig, algoliaParams: algoliaParams, authorParams: authorParams, logo: logo }),
      meta: { requiresAuth: true }
    },
    {
      path: '/teams',
      component: Teams,
      meta: { requiresAuth: true }
    },
    {
      path: '/files',
      component: Files,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/billing',
      component: Billing
    },
    {
      path: '/help',
      component: Help
    }
  ]
})

console.log(router.currentRoute.path)
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    var user
    try {
      user = Vue.globalGetUser()
    } catch (e) {
      user = null
    }
    console.log(user)
    if (!user || !user.auth) { // Needs to actually check auth.loggedIn() or something
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else if (!user.data) {
      next({
        path: '/join',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

export default router
