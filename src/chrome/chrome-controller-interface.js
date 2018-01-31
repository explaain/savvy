/* global chrome */
module.exports.sendMessage = (data, resFunction) => {
  try {
    if (chrome) {
      return chrome.runtime.sendMessage(data, resFunction)
    }
  } catch (e) {
    return false
  }
}

module.exports.testMe = 'real'
