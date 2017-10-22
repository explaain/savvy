import Vue from 'vue'
import Router from 'vue-router'

// Components for dashboard
import Home from '@/components/home'
import Analytics from '@/components/analytics'
import Notifications from '@/components/notifications'

Vue.use(Router)

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
    }
  ]
})
