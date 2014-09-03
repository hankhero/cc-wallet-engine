var events = require('events')
var util = require('util')

var HistoryEntryModel = require('./HistoryEntryModel')


/**
 * @class HistoryEntries
 *
 * Inhertis events.EventEmitter
 *
 * Event 'update': triggered on collection of history records updated
 */
function HistoryEntries(wallet) {
  events.EventEmitter.call(this)

  this.entries = []
  this.wallet = wallet
}

util.inherits(HistoryEntries, events.EventEmitter)

/**
 * @return {HistoryEntryModel[]}
 */
HistoryEntries.prototype.getEntries = function() {
  return this.entries
}

/**
 * Update entries collection
 */
HistoryEntries.prototype.update = function() {
  var self = this

  self.wallet.getHistory(function(error, entries) {
    if (error)
      return

    var equal = self.entries.length === entries.length
    if (equal)
      equal = self.entries.every(function(entry, index) { return entry.getTxId() === entries[index].getTxId() })

    if (equal)
      return

    self.entries = entries.map(function(entry) { return new HistoryEntryModel(entry) })
    self.emit('update')
  })
}


module.exports = HistoryEntries
