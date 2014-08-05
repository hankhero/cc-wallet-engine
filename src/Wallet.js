var _ = require('lodash')
var cclib = require('coloredcoinjs-lib')

var AddressManager = require('./AddressManager')
var AssetModel = require('./AssetModel')
var store = require('./store')


/**
 * @class Wallet
 */
function Wallet() {
  this.config = new store.ConfigStore()

  this.aStore = new store.AddressStore()
  this.aManager = new AddressManager(this.aStore)

  this.blockchain = new cclib.blockchain.BlockrIOAPI({ testnet: this.config.get('testnet', false) })

  this.cDataStore = new cclib.store.ColorDataStore()
  this.cData = new cclib.ColorData({ cdStore: this.cDataStore, blockchain: this.blockchain })

  this.cDefinitionStore = new cclib.store.ColorDefinitionStore()
  this.cDefinitionManager = new cclib.ColorDefinitionManager(this.cDefinitionStore)

  this.assetModels = {}

  var _this = this
  process.nextTick(function() {
    var uncolored = _this.cDefinitionManager.getUncolored()
    var totalBalance, unconfirmedBalance, availableBalance

    function done() {
      if (_.isUndefined(totalBalance) || _.isUndefined(unconfirmedBalance) || _.isUndefined(availableBalance))
        return

      _this.assetModels[uncolored.getColorId()] = new AssetModel({
        asset: 'Bitcoin',
        address: _this.aManager.getSomeAddress(),
        totalBalance: totalBalance,
        unconfirmedBalance: unconfirmedBalance,
        availableBalance: availableBalance,
      })
    }

    _this.getCoinQuery().onlyColoredAs(uncolored).getCoins(function(error, coinList) {
      coinList.getTotalValue(function(error, colorValues) {
        totalBalance = colorValues[0].getValue()
        done()
      })
    })

    _this.getCoinQuery().getUnconfirmed().onlyColoredAs(uncolored).getCoins(function(error, coinList) {
      coinList.getTotalValue(function(error, colorValues) {
        unconfirmedBalance = colorValues[0].getValue()
        done()
      })
    })

    _this.getCoinQuery().getConfirmed().onlyColoredAs(uncolored).getCoins(function(error, coinList) {
      coinList.getTotalValue(function(error, colorValues) {
        availableBalance = colorValues[0].getValue()
        done()
      })
    })
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
 * Todo: change to events?
 */
Wallet.prototype.setCallback = function(notifier) {
  this.updateCallback = notifier
}

/**
 * @return {CoinQuery}
 */
Wallet.prototype.getCoinQuery = function() {
  return new cclib.CoinQuery({
    addresses: this.aManager.getAllAddresses(),
    blockchain: this.blockchain,
    colorData: this.cData,
    colorDefinitionManager: this.cDefinitionManager
  })
}


module.exports = Wallet
