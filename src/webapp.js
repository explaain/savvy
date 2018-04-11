import Raven from 'raven-js'
import Main from './main.js'

const props = {
  env: process.env.CHROME ? 'testing' : 'development', // Temporary
  plugin: process.env.CHROME || false,
  // env: 'production',
  // plugin: false,
  sidebar: false,
  mode: 'live',
  // demo: true // @TODO: Set this back to false when we're not doing demo!
}

console.log('Running Web App')

Raven.config('https://5abb211365ca4cd9a72885762827512f@sentry.io/1187390').install()
Raven.context(() => {
  const main = new Main(props)
  console.log('main:', main)

  Raven.captureException({
    'hello': 'yo'
  })
  console.log('DONE')
})
