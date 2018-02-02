import Main from './main.js'

const props = {
  env: process.env.CHROME ? 'testing' : 'development', // Temporary
  plugin: process.env.CHROME || false,
  sidebar: true
}

const main = new Main(props)

console.log('main:', main)
