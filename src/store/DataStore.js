var assert = require('assert')
var inherits = require('util').inherits

var _ = require('lodash')
var coloredcoinlib = require('coloredcoinjs-lib')
var CCDataStore = coloredcoinlib.store.DataStore

/*
 * @class DataStore
 *
 * Inherits coloredcoinjs-lib.store.DataStore
 */
function DataStore(opts) {
  opts = _.isUndefined(opts) ? {} : opts
  opts.globalPrefix = _.isUndefined(opts.globalPrefix) ? 'cc_wallet_' : opts.globalPrefix

  CCDataStore.call(this, opts)
}

inherits(DataStore, CCDataStore)


module.exports = DataStore
