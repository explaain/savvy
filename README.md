# savvy

> Knowledge that lives where you work

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## To Deploy Demo Version

1. Comment out everything in `src/chrome-newtab.js` and `src/chrome-sidebar.js`
2. Set `props.mode = demo` in `src/webapp.js`
<!-- 2. Set `props.demo = true` in `src/webapp.js` -->

## Things to check if it won't deploy to Chrome Web Store:

In manifest.json:
1. `"key"` must match the PUBLIC KEY given in the Developer Dashboard (https://chrome.google.com/webstore/developer/dashboard) WITHOUT the whole `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` bits at the start and end
2. `"client_id"` must match one of the "OAuth 2.0 client IDs" on the Google Credentials page (https://console.developers.google.com/apis/credentials?project=savvy-96d8b), which in turn (when you click on it) must have an Application ID that matches the Chrome Extension's Item ID (on the Developer Dashboard, above)

## Troubleshooting

### Node/npm version

This is the issue if you get an error like this:

```
To use this template, you must update following to modules:
  node: 8.10.0 should be ^7.0.0
  npm: 5.6.0 should be ^4.2.0
```

*(Note that the ^ symbol means an equivalent or higher version WITHIN THE SAME TOP-LEVEL VERSION. E.g. ^7.2.0 can be 7.2.0 or 7.3.0 but not 8.0.0)*

If you have `nvm` installed you can try `nvm use 7.0.0`, where you replace 7 with a version of node that you have installed. To install a version of node you could try `brew install node@7.0.0`.

If the version of npm is also wrong then this page may help: https://stackoverflow.com/questions/9755841/how-can-i-change-the-version-of-npm-using-nvm
