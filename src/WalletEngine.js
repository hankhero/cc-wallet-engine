var BIP39 = require('bip39')
var ccWallet = require('cc-wallet-core')
var _ = require('lodash')

var AssetModels = require('./AssetModels')


/**
 * @class WalletEngine
 *
 * @param {Object} opts
 * @param {boolean} opts.testnet
 */
function WalletEngine(opts) {
  this.initialized = false
  this.setCallback(function() {})

  this.ccWalletOpts = _.extend({
    testnet: false
  }, opts)
  this.ccWallet = null
  this.assetModels = null
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.isInitialized = function() {
  return this.initialized
}

/**
 * @return {AssetModel[]}
 * @throws {Error} If wallet not initialized
 */
WalletEngine.prototype.getAssetModels = function() {
  if (!this.isInitialized())
    throw new Error('Wallet not initialized')

  return this.assetModels.getAssetModels()
}

/**
 * @throws {Error} If wallet not initialized
 */
WalletEngine.prototype.update = function() {
  if (!this.isInitialized())
    throw new Error('Wallet not initialized')

  this.assetModels.update()
}

/**
 * @param {function} callback
 */
WalletEngine.prototype.setCallback = function(callback) {
  this.updateCallback = callback
}

/**
 * @return {string}
 */
WalletEngine.prototype.generateMnemonic = BIP39.generateMnemonic

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @throws {Error} If already initialized
 */
WalletEngine.prototype.initializeFromMnemonic = function(mnemonic, password) {
  if (this.isInitialized())
    throw new Error('Already initialized')

  var ccWalletOpts = _.extend({
    masterKey: BIP39.mnemonicToSeedHex(mnemonic, password)
  }, this.ccWalletOpts)
  this.ccWallet = new ccWallet(ccWalletOpts)

  this.assetModels = new AssetModels(this.ccWallet)
  this.assetModels.on('update', function() { this.updateCallback() }.bind(this))

  this.initialized = true
}


module.exports = WalletEngine
