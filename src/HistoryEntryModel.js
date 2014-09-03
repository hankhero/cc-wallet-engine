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
  var assetValues = this.historyEntry.getAssetValues()

  var values = assetValues.map(function(av) {
    return av.getAsset().formatValue(av.getValue())
  })

  return values
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
