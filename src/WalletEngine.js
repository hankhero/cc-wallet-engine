var Wallet = require('cc-wallet-core')

var AssetModels = require('./AssetModels')
var HistoryEntries = require('./HistoryEntries')


/**
 * @class WalletEngine
 *
 * @param {?} opts
 */
function WalletEngine(opts) {
  this.wallet = null
  this.assetModels = null
  this.historyEntries = null
  this.initialized = false
  this.updateCallback = function() {}
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.isInitialized = function() {
  return this.initialized
}

/**
 * @return {AssetModel[]}
 */
WalletEngine.prototype.getAssetModels = function() {
  if (!this.isInitialized())
    return []

  return this.assetModels.getAssetModels()
}

/**
 * @return {HistoryEntryModel[]}
 */
WalletEngine.prototype.getHistory = function() {
  if (this.isInitialized())
    return []

  return this.historyEntries.getEntries()
}

/**
 */
WalletEngine.prototype.update = function() {
  if (!this.isInitialized())
    return

  this.assetModels.update()
  this.historyEntries.update()
}

/**
 * @param {function} callback
 */
WalletEngine.prototype.setCallback = function(callback) {
  this.updateCallback = callback
}

/**
 */
WalletEngine.prototype.initializeFromSeed = function(seed) {
  var walletOpts = null
  if (seed === 'test')
    walletOpts = {
      masterKey: '123131123131123131123131123131123131123131123131123131',
      testnet: true
    }

  if (walletOpts === null)
    throw new Error('not implemented')

  this.wallet = new Wallet(walletOpts)

  this.assetModels = new AssetModels(this.wallet)
  this.assetModels.on('update', function() { this.updateCallback() }.bind(this))
  this.assetModels.update()

  this.historyEntries = new HistoryEntries(this.wallet)
  this.historyEntries.update()

  this.initialized = true
}

/**
 * @param {?} entropy
 * @return {string}
 */
WalletEngine.prototype.generateRandomSeed = function(entropy) {
  // TODO
  return "test"
}


module.exports = WalletEngine
