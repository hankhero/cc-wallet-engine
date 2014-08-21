var AssetModels = require('./AssetModels')
var Wallet = require('cc-wallet-core')


/**
 * @class WalletEngine
 *
 * @param {?} opts
 */
function WalletEngine(opts) {
  this.wallet = null
  this.assetModels = null
  this.updateCallback = function() {}
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.isInitialized = function() {
  return this.wallet !== null
}

/**
 * @return {AssetModel[]}
 */
WalletEngine.prototype.getAssetModels = function() {
  if (this.isInitialized())
    return this.assetModels.getAssetModels()

  return []
}

/**
 */
WalletEngine.prototype.update = function() {
  if (this.assetModels instanceof AssetModels)
    this.assetModels.update()
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
}

/**
 * @param {function} callback
 */
WalletEngine.prototype.setCallback = function(callback) {
  this.updateCallback = callback
}

/**
 * @param {?} entropy
 * @return {string}
 */
WalletEngine.prototype.generateRandomSeed = function(entropy) {
  // TODO
  return "test"
}

/**
 */
WalletEngine.prototype.getHistory = function() {
  // TODO
  return []
}


module.exports = WalletEngine
