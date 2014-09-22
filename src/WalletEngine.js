var BIP39 = require('bip39')
var ccWallet = require('cc-wallet-core')
var _ = require('lodash')

var AssetModels = require('./AssetModels')

var store = require('store');


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
  return this.ccWallet.isInitialized()
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @throws {Error} If already initialized
 */
WalletEngine.prototype.initialize = function(mnemonic, password) {


  var seed = BIP39.mnemonicToSeedHex(mnemonic, password);

  //TODO: temporary
  store.set('temp_cc_seed', seed);

  this.ccWallet.initialize(seed)
  this._initializeWalletEngine()
}

/**
 */
WalletEngine.prototype._initializeWalletEngine = function() {
    //TODO: temporary
  this.ccWallet.temp_seed = store.get('temp_cc_seed');

  this.assetModels = new AssetModels(this.ccWallet)
  this.assetModels.on('update', function() { this.updateCallback() }.bind(this))
}

/**
 * @return {AssetModel[]}
 */
WalletEngine.prototype.getAssetModels = function() {
  if (this.isInitialized()) {
      return this.assetModels.getAssetModels();
  } else {
      return [];
  }
}


WalletEngine.prototype.getHistory = function () {
    if (!this.isInitialized())
        return [];

    var entries = [];

    this.assetModels.getAssetModels().forEach(function (am) {
        entries = entries.concat(am.getHistory());
    });

    return entries;
};


WalletEngine.prototype.update = function() {
  if (this.isInitialized()) {
      this.assetModels.update();
  }
}

WalletEngine.prototype.getAssetForURI = function (uri) {
    if (!this.isInitialized())
        return null;
    return this.assetModels.getAssetForURI(uri);
}


module.exports = WalletEngine
