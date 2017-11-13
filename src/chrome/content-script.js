/* global chrome */
import log from 'loglevel'
log.setLevel('debug')

const getPageText = function() {
  return document.body.innerText
}
const getUrl = function() {
  return window.location.href
}
const getBaseUrl = function() {
  return window.location.host.replace('www.', '')
}
const collectPageData = function() {
  const pageText = getPageText()
  const url = getUrl()
  const baseUrl = getBaseUrl()
  return {url: url, baseUrl: baseUrl, pageText: pageText}
}

var pingDiv
const drawer = document.createElement('div')
const iframe = document.createElement('iframe')

// document.addEventListener('DOMContentLoaded', function() { sendPageText() }, false)

window.onload = function(e) {
  sendPageText()
}

const sendPageText = function() {
  log.trace(sendPageText)
  const pageText = getPageText()
  const url = getUrl()
  const baseUrl = getBaseUrl()
  log.trace([pageText])
  log.debug(url)
  chrome.runtime.sendMessage({action: 'checkPage', data: {url: url, baseUrl: baseUrl, pageText: pageText}}, function(response) {
    log.debug(response)
    const numPings = response.pings.length
    log.debug('numPings: ', numPings)
    if (numPings && pingDiv !== -1) {
      const existingPings = document.getElementsByClassName('forget-me-not-ping')
      while (existingPings.length > 0) {
        log.trace('Deleting existing ping')
        existingPings[0].parentNode.removeChild(existingPings[0])
      }
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
        + 'z-index: 1000000;'
        + 'background: white;'
        + 'cursor: pointer;'
        + 'line-height: 1.4;'
        + 'font-family: Arial, sans-serif;'
      var pageFloat = document.createElement('div')
      pageFloat.style.cssText = ''
      + 'float: right;'
      pageFloat.innerHTML = '👆👆'
      pingDiv.appendChild(pageFloat)
      const text1 = document.createTextNode((numPings === 1 ? 'One memory' : numPings + ' memories') + ' relevant to this page! 😃')
      text1.className = 'forget-me-not-ping'
      pingDiv.appendChild(text1)
      var pageSpan = document.createElement('span')
      pageSpan.style.cssText = ''
        + 'color: grey;'
        + 'font-style: italic;'
        + 'margin-left: 5px;'
      pageSpan.innerHTML = 'Click to view'
      pingDiv.appendChild(pageSpan)
      pingDiv.onclick = function(e) {
        openDrawer(e)
        pingDiv.remove()
        pingDiv = -1
      }
      document.body.appendChild(pingDiv)
      log.trace(pingDiv)
    }
  })
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  log.trace('Request received')
  if (request.action === 'getPageData') {
    log.debug('1')
    log.trace('Received getPageData request')
    const pageData = collectPageData()
    log.debug(pageData)
    sendResponse(pageData)
  }
  if (request.event === 'popupOpened') {
    log.trace('Received popupOpened event')
    if (pingDiv) pingDiv.remove()
  }
  if (request.action === 'toggleDrawer') {
    log.trace('Received toggleDrawer action')
    toggleDrawer()
  }
})

sendPageText()

const createDrawer = function() {
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
    close.onclick = function(e) {
      closeDrawer(e)
    }
    document.addEventListener('click', function(event) {
      // log.info(pingDiv)
      var isClickInside = drawer.contains(event.target) || (pingDiv && pingDiv !== -1 && pingDiv.contains(event.target))

      if (!isClickInside) {
        closeDrawer(event)
      }
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
    drawer.appendChild(timeSaved)
    document.body.appendChild(drawer)
  } catch (e) {
    log.error(e)
  }
}
const displayPageResults = function() {
  log.info('Sending setLoading to frame')
  window.frames['forgetmenot-frame'].contentWindow.postMessage({action: 'setLoading'}, '*')
  chrome.runtime.sendMessage({action: 'getPageResults', data: {pageData: collectPageData()}}, function(response) {
    const message = {action: 'updatePageResults', data: {pageResults: response}}
    log.info(message)
    window.frames['forgetmenot-frame'].contentWindow.postMessage(message, '*')
  })
}
const openDrawer = function(e) {
  // log.info(drawer.getAttribute('data-opened'))
  if (drawer.getAttribute('data-opened') !== 'true' && (!e || !e.dealtWith)) {
    displayPageResults()
    drawer.style.right = '0px'
    // drawer.style.marginRight = '0px'
    drawer.style.boxShadow = 'rgba(0, 0, 0, 0.4) -1px 3px 50px 0px'
    iframe.style.pointerEvents = 'all'
    drawer.setAttribute('data-opened', 'true')
    iframe.style.display = 'block'
    log.info(drawer.getAttribute('data-opened'))
  }
  if (e) e.dealtWith = true
}
const closeDrawer = function(e) {
  // log.info(drawer.getAttribute('data-opened'))
  if (drawer.getAttribute('data-opened') === 'true' && (!e || !e.dealtWith)) {
    drawer.style.right = '-' + drawer.style.width
    // drawer.style.marginRight = '-' + drawer.style.width
    drawer.style.boxShadow = 'none'
    iframe.style.pointerEvents = 'none'
    drawer.setAttribute('data-opened', 'false')
    setTimeout(function () {
      if (drawer.getAttribute('data-opened') !== 'true') {
        iframe.style.display = 'none'
      }
    }, 1000)
  }
  // log.info(drawer.getAttribute('data-opened'))
  if (e) e.dealtWith = true
}
const toggleDrawer = function(e) {
  if (drawer.getAttribute('data-opened') === 'true') {
    closeDrawer(e)
  } else {
    openDrawer(e)
  }
}

window.addEventListener('message', function(event) {
  switch (event.data.action) {
    case 'getPageResults':
      log.info(5)
      displayPageResults()
      break
    case 'closeDrawer':
      console.log('closeDrawer')
      closeDrawer()
      break
    default:
  }
}, false)

createDrawer()
