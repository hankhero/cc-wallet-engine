var assert = require('assert')
var events = require('events')
var inherits = require('util').inherits

var _ = require('lodash')
var cclib = require('coloredcoinjs-lib')
var bitcoin = require('bitcoinjs-lib')

var AddressManager = require('./AddressManager')
var AssetModel = require('./AssetModel')
var store = require('./store')

var UNCOLORED_CHAIN = 0
var EPOBC_CHAIN = 826130763


/**
 * @class Wallet
 *
 * @param {Object} params
 * @param {Buffer|string} params.masterKey Seed for hierarchical deterministic wallet
 * @param {boolean} [params.testnet=false]
 */
function Wallet(params) {
  assert(_.isObject(params), 'Expected Object params, got ' + params)
  assert(Buffer.isBuffer(params.masterKey) || _.isString(params.masterKey),
    'Expected Buffer|string params.masterKey, got ' + params.masterKey)
  params.testnet = _.isUndefined(params.testnet) ? false : params.testnet
  assert(_.isBoolean(params.testnet), 'Expected boolean params.testnet, got ' + params.testnet)


  events.EventEmitter.call(this)

  this.config = new store.ConfigStore()

  this.aStore = new store.AddressStore()
  this.aManager = new AddressManager(this.aStore)
  var network = params.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  this.aManager.setMasterKeyFromSeed(params.masterKey, network)

  this.blockchain = new cclib.blockchain.BlockrIOAPI({ testnet: params.testnet })

  this.cDataStore = new cclib.store.ColorDataStore()
  this.cData = new cclib.ColorData({ cdStore: this.cDataStore, blockchain: this.blockchain })

  this.cDefinitionStore = new cclib.store.ColorDefinitionStore()
  this.cDefinitionManager = new cclib.ColorDefinitionManager(this.cDefinitionStore)

  this.assetModels = {}
  // add uncolored
  var uncolored = this.cDefinitionManager.getUncolored()
  this.assetModels[uncolored.getColorId()] = new AssetModel({
    asset: 'Bitcoin',
    address: this.aManager.getSomeAddress({ account: 0, chain: UNCOLORED_CHAIN })
  })
  // add other assets
  // Todo: add asset storage
  this.cDefinitionManager.getAllColorDefinitions().forEach(function(colorDefinition) {
    var address
    if (colorDefinition.getScheme().indexOf('epobc') === 0)
      address = this.aManager.getSomeAddress({ account: 0, chain: EPOBC_CHAIN })

    this.assetModels[colorDefinition.getColorId()] = new AssetModel({
      asset: 'colorId: #' + colorDefinition.getColorId(),
      address: address
    })
  }.bind(this))

  this.updateAssetModels()
}

inherits(Wallet, events.EventEmitter)

/**
 * Return new CoinQuery for request confirmed/unconfirmed coins, balance ...
 *
 * @return {CoinQuery}
 */
Wallet.prototype.getCoinQuery = function() {
  var addresses = []
  addresses = addresses.concat(this.aManager.getAllAddresses({ account: 0, chain: UNCOLORED_CHAIN }))
  addresses = addresses.concat(this.aManager.getAllAddresses({ account: 0, chain: EPOBC_CHAIN }))
  addresses = addresses.map(function(address) { return address.getAddress() })

  return new cclib.CoinQuery({
    addresses: addresses,
    blockchain: this.blockchain,
    colorData: this.cData,
    colorDefinitionManager: this.cDefinitionManager
  })
}

/**
 * @return {Array}
 */
Wallet.prototype.getAssetModels = function() {
  var _this = this

  var assetModels = Object.keys(this.assetModels).map(function(key) {
    return _this.assetModels[key]
  })

  return assetModels
}

/**
 */
Wallet.prototype.updateAssetModels = function() {
  var _this = this

  Object.keys(this.assetModels).map(function(colorId) {
    var colorDefinition = _this.cDefinitionManager.getByColorId({ colorId: parseInt(colorId) })
    var coinQuery = _this.getCoinQuery().onlyColoredAs(colorDefinition)

    coinQuery.getCoins(function(error, coinList) {
      if (error !== null) {
        _this.emit('error', error)
        return
      }

      coinList.getTotalValue(function(error, colorValues) {
        if (error !== null) {
          _this.emit('error', error)
          return
        }

        if (colorValues.length === 0)
          return

        var oldValue = _this.assetModels[colorId].props.totalBalance
        var newValue = colorValues[0].getValue()
        if (oldValue !== newValue) {
          _this.assetModels[colorId].props.totalBalance = newValue
          _this.emit('assetModelsUpdated')
        }
      })
    })

    coinQuery.getUnconfirmed().getCoins(function(error, coinList) {
      if (error !== null) {
        _this.emit('error', error)
        return
      }

      coinList.getTotalValue(function(error, colorValues) {
        if (error !== null) {
          _this.emit('error', error)
          return
        }

        if (colorValues.length === 0)
          return

        var oldValue = _this.assetModels[colorId].props.unconfirmedBalance
        var newValue = colorValues[0].getValue()
        if (oldValue !== newValue) {
          _this.assetModels[colorId].props.unconfirmedBalance = newValue
          _this.emit('assetModelsUpdated')
        }
      })
    })

    coinQuery.getConfirmed().getCoins(function(error, coinList) {
      if (error !== null) {
        _this.emit('error', error)
        return
      }

      coinList.getTotalValue(function(error, colorValues) {
        if (error !== null) {
          _this.emit('error', error)
          return
        }

        if (colorValues.length === 0)
          return

        var oldValue = _this.assetModels[colorId].props.availableBalance
        var newValue = colorValues[0].getValue()
        if (oldValue !== newValue) {
          _this.assetModels[colorId].props.availableBalance = newValue
          _this.emit('assetModelsUpdated')
        }
      })
    })
  })
}


module.exports = Wallet
