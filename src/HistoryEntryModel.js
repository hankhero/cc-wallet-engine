var _ = require('lodash')
var strftime = require('strftime')


/**
 * @class HistoryEntryModel
 *
 * @param {historyEntry} HistoryEntry
 */
function HistoryEntryModel(historyEntry) {
  this.historyEntry = historyEntry
}

/**
 * @return {string}
 */
HistoryEntryModel.prototype.getTxId = function() {
  return this.historyEntry.txId
}

/**
 * @return {string}
 */
HistoryEntryModel.prototype.getDate = function() {
  var timezoneOffset = new Date().getTimezoneOffset() * 60
  var date = new Date(this.historyEntry.getTimestamp() - timezoneOffset)
  return strftime('%m/%d/%y %H:%M:%S', date)
}

/**
 * @return {string[]}
 */
HistoryEntryModel.prototype.getValues = function() {
  var values = this.historyEntry.getValues().map(function(av) {
    return av.getAsset().formatValue(av.getValue())
  })

  return values
}

/**
 * @typedef {Object} HistoryTarget
 * @property {string} address0
 * @property {string} address1
 * @property {string} addressN
 */

/**
 * @return {HistoryTarget}
 */
HistoryEntryModel.prototype.getTargets = function() {
  var targets = this.historyEntry.getTargets().map(function(at) {
    return [at.getAddress(), at.getAsset().formatValue(at.getValue())]
  })

  return _.object(targets)
}

/**
 * @return {boolean}
 */
HistoryEntryModel.prototype.isSend = function() {
  return this.historyEntry.isSend()
}

/**
 * @return {boolean}
 */
HistoryEntryModel.prototype.isReceive = function() {
  return this.historyEntry.isReceive()
}

/**
 * @return {boolean}
 */
HistoryEntryModel.prototype.isPaymentToYourself = function() {
  return this.historyEntry.isPaymentToYourself()
}

/**
 * @return {string}
 */
HistoryEntryModel.prototype.getTransactionType = function() {
  if (this.isSend())
    return 'Send'

  if (this.isReceive())
    return 'Receive'

  if (this.isPaymentToYourself())
    return 'Payment to yourself'
}


module.exports = HistoryEntryModel
