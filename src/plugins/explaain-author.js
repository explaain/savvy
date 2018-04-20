/* global chrome */
import Vue from 'vue'
import Q from 'q'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

const Author = {
  install(Vue, options) {
    console.log('options')
    console.log(options)
    var url = options.url
    this.plugin = options.plugin
    console.log(url)

    const importFromDrive = function(user) {
      const d = Q.defer()
      Vue.axios.post(options.importUrl, user)
      .then((response) => {
        d.resolve(response)
      }).catch(function(e) {
        console.log(e)
        d.reject(e)
      })
      return d.promise
    }

    const saveCard = data => new Promise((resolve, reject) => {
      console.log('url', url)
      console.log('data', data)
      if (data.content) {
        Object.keys(data.content).forEach(key => {
          if (!data[key]) data[key] = data.content[key]
          delete data.content[key]
        })
      }
      delete data.content
      if (this.plugin && chrome && chrome.runtime) {
        try {
          chrome.runtime.sendMessage({action: 'saveCard', url: url, data: data}, response => {
            resolve(response)
          })
        } catch (e) {
          Vue.axios.post(url, data).then(resolve).catch(reject)
        }
      } else
        Vue.axios.post(url, data).then(resolve).catch(reject)
    })

    /* To Remove -- START */
    const createCard = function(data) {
      const d = Q.defer()
      console.log('data: ', data)
      Vue.axios.post(url, data)
      .then((response) => {
        console.log('Card successfully created')
        console.log(response)
        d.resolve(response)
      }).catch(function(e) {
        d.reject(e)
      })
      return d.promise
    }

    const updateCard = function(data) {
      const d = Q.defer()
      console.log('data: ', data)
      Vue.axios.post(url, data)
      .then((response) => {
        console.log('Card successfully edited')
        console.log(response)
        d.resolve(response)
      }).catch(function (e) {
        console.log(e)
        d.reject(e)
      })
      return d.promise
    }
    /* To Remove -- END */

    const deleteCard = function(data) {
      const d = Q.defer()
      console.log('data: ', data)
      Vue.axios.delete(url, {params: data})
      .then((response) => {
        console.log('Card successfully deleted')
        console.log(response)
        // data.callback('Card deleted!')
        // self.showAlert('success', 2000, 'Card deleted!')
        d.resolve()
      }).catch(function (e) {
        console.log(e)
        d.reject()
      })
      return d.promise
    }

    // const deleteByQuery = function(data) {
    //   const d = Q.defer()
    //   const self = this
    //   console.log('data: ', data)
    //   Vue.axios.delete(url, {params: data})
    //   .then((response) => {
    //     console.log('All user cards successfully deleted')
    //     console.log(response)
    //     d.resolve()
    //   }).catch(function (e) {
    //     console.log(e)
    //     d.reject()
    //   })
    //   return d.promise
    // }

    this.importFromDrive = importFromDrive
    this.saveCard = saveCard
    this.createCard = createCard
    this.updateCard = updateCard
    this.deleteCard = deleteCard
  },

}

export default Author
