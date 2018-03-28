import Main from './main.js'

const props = {
  env: process.env.CHROME ? 'testing' : 'development', // Temporary
  plugin: process.env.CHROME || false,
  // env: 'production',
  // plugin: false,
  sidebar: false,
  // demo: true // @TODO: Set this back to false when we're not doing demo!
}

console.log('Running Web App')

const main = new Main(props)

console.log('main:', main)
