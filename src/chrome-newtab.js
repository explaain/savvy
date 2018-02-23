import Main from './main.js'

const props = {
  plugin: true,
  sidebar: false
}

console.log('Running New Tab')

const main = new Main(props)

console.log('main:', main)
