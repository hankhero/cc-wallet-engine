var assert = require('assert')
var events = require('events')
var inherits = require('util').inherits

var _ = require('lodash')
var cclib = require('coloredcoinjs-lib')
var bitcoin = require('bitcoinjs-lib')

var AddressManager = require('./AddressManager')
var AssetDefinitionManager = require('./asset').AssetDefinitionManager
var AssetModel = require('./asset').AssetModel
var store = require('./store')


/**
 * @class Wallet
 *
 * @param {Object} data
 * @param {Buffer|string} data.masterKey Seed for hierarchical deterministic wallet
 * @param {boolean} [data.testnet=false]
 */
function Wallet(data) {
  assert(_.isObject(data), 'Expected Object data, got ' + data)
  assert(Buffer.isBuffer(data.masterKey) || _.isString(data.masterKey),
    'Expected Buffer|string data.masterKey, got ' + data.masterKey)
  data.testnet = _.isUndefined(data.testnet) ? false : data.testnet
  assert(_.isBoolean(data.testnet), 'Expected boolean data.testnet, got ' + data.testnet)


  events.EventEmitter.call(this)

  this.config = new store.ConfigStore()

  this.aStore = new store.AddressStore()
  this.aManager = new AddressManager(this.aStore)
  var network = data.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  this.aManager.setMasterKeyFromSeed(data.masterKey, network)

  this.blockchain = new cclib.blockchain.BlockrIOAPI({ testnet: data.testnet })

  this.cDataStore = new cclib.store.ColorDataStore()
  this.cData = new cclib.ColorData({ cdStore: this.cDataStore, blockchain: this.blockchain })

  this.cdStore = new cclib.store.ColorDefinitionStore()
  this.cdManager = new cclib.ColorDefinitionManager(this.cdStore)

  this.adStore = new store.AssetDefinitionStore()
  this.adManager = new AssetDefinitionManager({
    assetDefinitionStore: this.adStore,
    colorDefinitionManager: this.cdManager
  })


  this.assetModels = []
  this.adManager.getAllAssets().forEach(function(assdef) {
    this.assetModels.push(new AssetModel({
      moniker: assdef.getMonikers()[0],
      address: this.aManager.getSomeAddress({ account: 0, chain: 0 })
    }))
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
  addresses = addresses.concat(this.aManager.getAllAddresses({ account: 0, chain: this.aManager.UNCOLORED_CHAIN }))
  addresses = addresses.concat(this.aManager.getAllAddresses({ account: 0, chain: this.aManager.EPOBC_CHAIN }))
  addresses = addresses.map(function(address) { return address.getAddress() })

  return new cclib.CoinQuery({
    addresses: addresses,
    blockchain: this.blockchain,
    colorData: this.cData,
    colorDefinitionManager: this.cdManager
  })
}

/**
 * @param {Object} data
 * @param {Array} data.monikers
 * @param {Array} data.colorSet
 * @param {number} [data.unit=1]
 * @return {Error|null}
 */
Wallet.prototype.addAssetDefinition = function(data) {
  // data asserts in adManager.createAssetDefinition
  var assdef = this.adManager.createAssetDefinition(data)
  if (assdef instanceof Error)
    return assdef

  this.assetModels.push(new AssetModel({
    moniker: assdef.getMonikers()[0],
    address: this.aManager.getSomeAddress({ account: 0, chain: 0 })
  }))
  this.updateAssetModels()

  return null
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

  this.assetModels.forEach(function(assetModel, index) {
    var assdef = _this.adManager.getByMoniker(assetModel.getMoniker())
    var colorIds = assdef.getColorSet().getColorIds()
    var colorDefinitions = colorIds.map(function(colorId) {
      return _this.cdManager.getByColorId({ colorId: colorId })
    })
    var coinQuery = _this.getCoinQuery().onlyColoredAs(colorDefinitions)


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

        var oldValue = _this.assetModels[index].props.totalBalance
        var newValue = colorValues[0].getValue()
        if (oldValue !== newValue) {
          _this.assetModels[index].props.totalBalance = newValue
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

        var oldValue = _this.assetModels[index].props.unconfirmedBalance
        var newValue = colorValues[0].getValue()
        if (oldValue !== newValue) {
          _this.assetModels[index].props.unconfirmedBalance = newValue
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

        var oldValue = _this.assetModels[index].props.availableBalance
        var newValue = colorValues[0].getValue()
        if (oldValue !== newValue) {
          _this.assetModels[index].props.availableBalance = newValue
          _this.emit('assetModelsUpdated')
        }
      })
    })
  })
}

/**
 * Drop all data from storage's
 */
Wallet.prototype.clearStorage = function() {
  this.config.clear()
  this.aStore.clear()
  this.cDataStore.clear()
  this.cdStore.clear()
  this.adStore.clear()
}



module.exports = Wallet
