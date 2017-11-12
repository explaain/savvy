import Vue from 'vue'
import VueJsonp from 'vue-jsonp'
Vue.use(VueJsonp)

Vue.jsonp('https://mixpanel.com/api/2.0/events/', {
  from_date: '2017-11-05', to_date: '2017-11-11', event: 'Card Saved'
}).then(json => {
  console.log(json)
}).catch(err => {
  console.log(err)
})
