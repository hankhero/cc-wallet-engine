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

  if (this.ccWallet.isInitialized())
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
 * TODO rename to more fitting isCurrentSeed 
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
  return !!this.getSeed() && !!this.getPin() && this.ccWallet.isInitialized();
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.hasPin = function() {
  return !!this._pin;
}

/**
 * @return {string}
 */
WalletEngine.prototype.getPin = function() {
  return this._pin;
}

/**
 * @param {strin} pin
 */
WalletEngine.prototype.setPin = function(pin) {
  this._pin = pin;
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.hasSeed = function() {
  return !!this.getSeed();
}

/**
 * @return {string}
 */
WalletEngine.prototype.getSeed = function() {
  return this._seed;
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @throws {Error} If wrong seed
 */
WalletEngine.prototype.setSeed = function(mnemonic, password) {
  if (this.ccWallet.isInitialized() && !this.isCurrentMnemonic(mnemonic, password)){
    throw new Error('Wrong seed');
  }

  // only ever store see here and only in ram
  this._seed = BIP39.mnemonicToSeedHex(mnemonic, password);
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.canResetSeed = function() {
  return this.ccWallet.isInitialized() && !this.hasSeed();
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @throws {Error} If already initialized
 */
WalletEngine.prototype.initialize = function(mnemonic, password) {
  this.setSeed(mnemonic, password)
  this.ccWallet.initialize(this.getSeed())
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
  if (!this.ccWallet.isInitialized())
    return []

  return this.assetModels.getAssetModels()
}

/**
 */
WalletEngine.prototype.getHistory = function () {
  if (!this.ccWallet.isInitialized())
    return []

  var assetsEntries = this.assetModels.getAssetModels().map(function(am) {
    return am.getHistory()
  })

  return _.flatten(assetsEntries)
}

/**
 */
WalletEngine.prototype.update = function() {
  if (this.ccWallet.isInitialized())
    this.assetModels.update()
}

/**
 */
WalletEngine.prototype.getAssetForURI = function (uri) {
  if (!this.ccWallet.isInitialized())
    return null

  return this.assetModels.getAssetForURI(uri)
}


module.exports = WalletEngine
