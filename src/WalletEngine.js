var BIP39 = require('bip39')
var ccWallet = require('cc-wallet-core')
var CryptoJS = require("crypto-js");
var _ = require('lodash')
var store = require('store');

var AssetModels = require('./AssetModels')

/**
 * Taken from https://code.google.com/p/crypto-js/#The_Cipher_Output
 */
var _JsonFormatter = { 
    stringify: function (cipherParams) {
        // create json object with ciphertext
        var jsonObj = {
            ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
        };

        // optionally add iv and salt
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString();
        }
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString();
        }

        // stringify json object
        return JSON.stringify(jsonObj);
    },

    parse: function (jsonStr) {
        // parse json string
        var jsonObj = JSON.parse(jsonStr);

        // extract ciphertext from json object, and create cipher params object
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
        });

        // optionally extract iv and salt
        if (jsonObj.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
        }
        if (jsonObj.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
        }

        return cipherParams;
    }
};

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
 * @throws {Error} If seed es not set
 * @return {string}
 */
WalletEngine.prototype.getPinEncrypted = function() {
  if (!this.hasSeed()){
    throw new Error('No seed set');
  }
  var encrypted = CryptoJS.AES.encrypt(
      this._pin, 
      this.getSeed(), 
      { format: _JsonFormatter }
  );
  return encrypted.toString()
}

/**
 * @param {strin} pin
 * @throws {Error} If seed es not set
 */
WalletEngine.prototype.setPinEncrypted = function(encryptedpin) {
  if (!this.hasSeed()){
    throw new Error('No seed set');
  }
  var decrypted = CryptoJS.AES.decrypt(
      encryptedpin, 
      this.getSeed(), 
      { format: _JsonFormatter }
  );
  this._pin = decrypted.toString(CryptoJS.enc.Utf8)
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
  if (!!this.ccWallet.isInitialized() && !this.isCurrentMnemonic(mnemonic, password)){
    throw new Error('Wrong seed');
  }

  // only ever store see here and only in ram
  this._seed = BIP39.mnemonicToSeedHex(mnemonic, password);
}

WalletEngine.prototype.stored_mnemonic = function() {
  return store.get('cc-wallet-engine__mnemonic');
}

WalletEngine.prototype.stored_encryptedpin = function() {
  return store.get('cc-wallet-engine__encryptedpin');
}

/**
 * @return {boolean}
 */
WalletEngine.prototype.canResetSeed = function() {
  return (
    !this.hasSeed() && 
    !!this.stored_mnemonic() && 
    !!this.stored_encryptedpin() && 
    this.ccWallet.isInitialized()
  );
}

WalletEngine.prototype.resetSeed = function(password) {
  if (!this.canResetSeed()){
    throw new Error('Cannot reset seed!');
  }
  this.setSeed(this.stored_mnemonic(), password);
  this.setPinEncrypted(this.stored_encryptedpin());
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @param {string} pin
 * @throws {Error} If already initialized
 */
WalletEngine.prototype.initialize = function(mnemonic, password, pin) {
  this.setSeed(mnemonic, password)
  this.ccWallet.initialize(this.getSeed())
  this._initializeWalletEngine()
  this.setPin(pin);
  store.set('cc-wallet-engine__mnemonic', mnemonic);
  store.set('cc-wallet-engine__encryptedpin', this.getPinEncrypted());
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
