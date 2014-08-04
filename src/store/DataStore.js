global.localStorage = require('localStorage')
var store = require('store')


/**
 * @class DataStore
 */
function DataStore() {
  if (store.disabled)
    throw new Error('localStorage is not supported!')

  this.store = store
}

DataStore.globalPrefix = 'cc_wallet_'


module.exports = DataStore
