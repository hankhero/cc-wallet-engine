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
  this.setCallback(function() {})
  this.assetModels = null

  opts = _.extend({ testnet: false }, opts)
  this.ccWallet = new ccWallet(opts)

  if (this.isInitialized())
    this._initializeWalletEngine()
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
 * @return {boolean}
 */
WalletEngine.prototype.isCurrentMnemonic = function(mnemonic, password) {
  var seed = BIP39.mnemonicToSeedHex(mnemonic, password)
  return this.ccWallet.isCurrentSeed(seed)
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.isInitialized = function() {
  return this.ccWallet.isInitialized() // FIXME add check for seed
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @throws {Error} If already initialized
 */
WalletEngine.prototype.initialize = function(mnemonic, password) {
  // only ever store see here and only in ram
  this.seed = BIP39.mnemonicToSeedHex(mnemonic, password)
  this.ccWallet.initialize(this.seed)
  this._initializeWalletEngine()
}

/**
 */
WalletEngine.prototype._initializeWalletEngine = function() {
  this.assetModels = new AssetModels(this.ccWallet)
  this.assetModels.on('update', function() { this.updateCallback() }.bind(this))
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
 */
WalletEngine.prototype.getHistory = function () {
  if (!this.isInitialized())
    return []

  var assetsEntries = this.assetModels.getAssetModels().map(function(am) {
    return am.getHistory()
  })

  return _.flatten(assetsEntries)
}

/**
 */
WalletEngine.prototype.update = function() {
  if (this.isInitialized())
    this.assetModels.update()
}

/**
 */
WalletEngine.prototype.getAssetForURI = function (uri) {
  if (!this.isInitialized())
    return null

  return this.assetModels.getAssetForURI(uri)
}


module.exports = WalletEngine
