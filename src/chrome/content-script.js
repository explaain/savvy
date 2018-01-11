/* global chrome */
import log from 'loglevel'
log.setLevel('debug')

const getPageText = () => document.body.innerText
const getUrl = () => window.location.href
const getBaseUrl = () => window.location.host.replace('www.', '')
const collectPageData = () => {
  return {
    pageText: getPageText(),
    url: getUrl(),
    baseUrl: getBaseUrl()
  }
}

var pingStatus = 'unborn'
var pingDiv
const drawer = document.createElement('div')
const iframe = document.createElement('iframe')

/* ----------------------- */
/* ----------------------- */
/* --- Event Listeners --- */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log.trace('Request received', request)
  if (request.action)
    switch (request.action) {
      // case 'getPageData':
      //   sendResponse(collectPageData())
      //   break
      case 'toggleDrawer':
        toggleDrawer()
        break
    }
  if (request.event)
    switch (request.event) {
      case 'popupOpened':
        if (pingDiv) pingDiv.remove()
        break
    }
  return true
})

window.addEventListener('message', event => {
  switch (event.data.action) {
    case 'getPageResults':
      getPageResults()
      break
    case 'closeDrawer':
      closeDrawer()
      break
  }
}, false)

/* ----------------------- */
/* ----------------------- */
/* ------ Functions ------ */

const sendToChrome = data => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage(data, res => resolve(res)) // Needs catch => reject
})
const sendToFrame = data => new Promise((resolve, reject) => {
  console.log('Sending to Frame:', data)
  window.frames['forgetmenot-frame'].contentWindow.postMessage(data, '*')
  resolve(data)
})
/*  Sends pageData to event-page.js, Collects page results, Sends results to frame, Shows ping if necessary  */
const getPageResults = () => new Promise((resolve, reject) => {
  sendToFrame({ action: 'setLoading' })
  sendToChrome({ action: 'getPageResults', data: collectPageData() })
  .then(response => {
    log.debug(response)
    return sendToFrame({ action: 'updatePageResults', data: { pageResults: response } })
  }).then(res => {
    log.debug(res)
    if (res.data && res.data.pageResults && res.data.pageResults.pings && res.data.pageResults.pings.length & (pingStatus === 'unborn' || pingStatus === 'showing'))
      showPingAlert(res.data.pageResults.pings.length)
    resolve()
  }).catch(reject)
})

/* ----------------------- */
/* ----------------------- */
/* ---- DOM Functions ---- */

const showPingAlert = (number) => {
  if (document.getElementsByClassName('forget-me-not-ping') && document.getElementsByClassName('forget-me-not-ping').length)
    document.getElementsByClassName('forget-me-not-ping').forEach(ping => ping.parentNode.removeChild(ping))

  if (pingDiv) pingDiv.remove()
  pingDiv = document.createElement('div')
  pingDiv.style.cssText = ''
    + 'position: fixed;'
    + 'top: 0;'
    + 'right: 0;'
    + 'width: 300px;'
    + 'margin: 20px;'
    + 'padding: 20px 35px;'
    + 'font-size: 16px;'
    + 'font-weight: normal;'
    + 'color: #333;'
    + 'box-shadow: rgba(50, 50, 50, 0.95) 0px 0px 30px;'
    + 'border: none;'
    + 'border-radius: 10px;'
    + 'z-index: 10000000000000000;'
    + 'background: white;'
    + 'cursor: pointer;'
    + 'line-height: 1.4;'
    + 'font-family: Arial, sans-serif;'
  var pageFloat = document.createElement('div')
  pageFloat.style.cssText = ''
  + 'float: right;'
  pageFloat.innerHTML = '👆👆'
  pingDiv.appendChild(pageFloat)
  const text1 = document.createTextNode((number === 1 ? 'One card' : number + ' cards') + ' relevant to this page! 😃')
  text1.className = 'forget-me-not-ping'
  pingDiv.appendChild(text1)
  var pageSpan = document.createElement('span')
  pageSpan.style.cssText = ''
    + 'color: grey;'
    + 'font-style: italic;'
    + 'margin-left: 5px;'
  pageSpan.innerHTML = 'Click to view'
  pingDiv.appendChild(pageSpan)
  pingDiv.onclick = e => {
    openDrawer(e)
    pingDiv.remove()
    pingStatus = 'closed'
  }
  document.body.appendChild(pingDiv)
  log.trace(pingDiv)
  pingStatus = 'showing'
}
const createDrawer = () => {
  try {
    drawer.style.cssText = ''
      + 'all: initial;'
      + 'position: fixed;'
      + 'top: 0;'
      + 'right: -400px;'
      + 'height: 100%;'
      + 'width: 400px;'
      + 'z-index: 1000000000000000;'
      + 'background: white;'
      + 'box-shadow: rgba(0, 0, 0, 0.4) -1px 3px 50px 0px;'
      + 'transition: right 0.6s ease 0s;'
    drawer.setAttribute('data-opened', 'false')

    iframe.src = chrome.runtime.getURL('./sidebar.html')
    iframe.id = 'forgetmenot-frame'
    iframe.style.cssText = ''
      + 'all: initial;'
      + 'position: absolute;'
      + 'top: 0;'
      + 'height: 100%;'
      + 'left: -100%;'
      + 'width: 200%;'
      + 'border: none;'
      + 'pointer-events: none;'

    const close = document.createElement('a')
    close.style.cssText = ''
      + 'all: initial;'
      + 'position: absolute;'
      + 'top: 6px;'
      + 'left: 4px;'
      + 'z-index: 2147483647;'
      + 'font-size: 20px;'
      + 'color: #999;'
      + 'font-family: Arial;'
      + 'border-radius: 6px;'
      + 'padding: 0px 9px 2px;'
      + 'cursor: pointer;'
      + 'font-weight: bold;'
      + 'pointer-events: all;'
    close.appendChild(document.createTextNode('x'))

    // Click Events
    close.onclick = e => closeDrawer(e)

    document.addEventListener('click', event => {
      const isClickInside = drawer.contains(event.target) || (pingDiv && pingDiv !== -1 && pingDiv.contains(event.target))
      if (!isClickInside)
        closeDrawer(event)
    })

    const timeSaved = document.createElement('div')
    timeSaved.style.cssText = ''
      + 'all: initial;'
      + 'font-family: Lato, Arial, sans-serif;'
      + 'position: absolute;'
      + 'bottom: 0;'
      + 'left: 0;'
      + 'right: 0;'
      + 'padding: 20px;'
      + 'background: white;'
      + 'box-shadow: 0px 0px 30px rgba(150,150,150,0.5)'
      + 'color: #999;'
      + 'text-align: center;'
      + 'font-weight: bold;'
    timeSaved.appendChild(document.createTextNode('You\'ve saved 4.5 hours so far this month! 💪'))

    drawer.appendChild(close)
    drawer.appendChild(iframe)
    // drawer.appendChild(timeSaved)
    document.body.appendChild(drawer)
  } catch (e) {
    log.error(e)
  }
}
const openDrawer = e => {
  if (drawer.getAttribute('data-opened') !== 'true' && (!e || !e.dealtWith)) {
    console.log('Opening Drawer')
    getPageResults()
    drawer.style.right = '0px'
    drawer.style.marginRight = '0px'
    drawer.style.boxShadow = 'rgba(0, 0, 0, 0.4) -1px 3px 50px 0px'
    drawer.setAttribute('data-opened', 'true')
    iframe.style.pointerEvents = 'all'
    iframe.style.display = 'block'
    log.info(drawer.getAttribute('data-opened'))
  }
  if (e) e.dealtWith = true
}
const closeDrawer = e => {
  if (drawer.getAttribute('data-opened') === 'true' && (!e || !e.dealtWith)) {
    console.log('Closing Drawer')
    sendToFrame({ action: 'closingDrawer' })
    drawer.style.right = '-' + drawer.style.width
    drawer.style.boxShadow = 'none'
    drawer.setAttribute('data-opened', 'false')
    iframe.style.pointerEvents = 'none'
    setTimeout(() => {
      if (drawer.getAttribute('data-opened') !== 'true') {
        drawer.style.marginRight = '-' + drawer.style.width
        iframe.style.display = 'none'
      }
    }, 1000)
  }
  // log.info(drawer.getAttribute('data-opened'))
  if (e) e.dealtWith = true
}
const toggleDrawer = e => {
  if (drawer.getAttribute('data-opened') === 'true') {
    closeDrawer(e)
  } else {
    openDrawer(e)
  }
}

/* ----------------------- */
/* ----------------------- */
/* --- ONLOAD Functions -- */

createDrawer()
getPageResults()
window.onload = e => getPageResults()
