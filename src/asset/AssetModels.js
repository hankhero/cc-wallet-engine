var events = require('events')
var util = require('util')

var _ = require('lodash')


/**
 * @class AssetModel
 *
 * @param {Wallet} wallet
 * @param {AssetDefinition} assetDefinition
 */
function AssetModel(wallet, assetDefinition) {
  events.EventEmitter.call(this)

  this.wallet = wallet
  this.assdef = assetDefinition

  this.totalBalance = 0
  this.unconfirmedBalance = 0
  this.availableBalance = 0
}

util.inherits(AssetModel, events.EventEmitter)

/**
 * @return {string}
 */
AssetModel.prototype.getMoniker = function () {
  return this.assdef.getMonikers[0]
}

/**
 * @return {string}
 */
AssetModel.prototype.getAddress = function () {
  return this.wallet.getSomeAddress(this.assdef)
}

/**
 * @return {string}
 */
AssetModel.prototype.getTotalBalance = function () {
  return this.assdef.formatValue(this.totalBalance)
}

/**
 * @return {string}
 */
AssetModel.prototype.getUnconfirmedBalance = function () {
  return this.assdef.formatValue(this.unconfirmedBalance)
}

/**
 * @return {string}
 */
AssetModel.prototype.getAvailableBalance = function () {
  return this.assdef.formatValue(this.availableBalance)
}

/**
 * Update model balance
 */
AssetModel.prototype.update = function() {
  var self = this

  self.wallet.getAvailableBalance(self.assdef, function(error, balance) {
    if (error === null && self.availableBalance !== balance) {
      self.availableBalance = balance
      self.emit('update')
    }
  })

  self.wallet.getTotalBalance(self.assdef, function(error, balance) {
    if (error === null && self.totalBalance !== balance) {
      self.totalBalance = balance
      self.emit('update')
    }
  })

  self.wallet.getUnconfirmedBalance(self.assdef, function(error, balance) {
    if (error === null && self.unconfirmedBalance !== balance) {
      self.unconfirmedBalance = balance
      self.emit('update')
    }
  })
}


/**
 * @class AssetModels
 */
function AssetModels(wallet) {
  events.EventEmitter.call(wallet)

  this.models = {}
  this.wallet = wallet
}

util.inherits(AssetModels, events.EventEmitter)

/**
 * @return {Array}
 */
AssetModels.prototype.getAssetModels = function() {
  return Object.keys(this.models).sort().map(function(colorHash) {
    return this.models[colorHash]
  }.bind(this))
}

/**
 * Add new models and update all
 */
AssetModels.prototype.update = function() {
  var self = this

  self.wallet.getAllAssetDefinitions().forEach(function(assdef) {
    var colorHash = assdef.getColorSet().getColorHash()

    if (_.isUndefined(self.models[colorHash])) {
      self.models[colorHash] = new AssetModel(self.wallet, assdef)
      self.models[colorHash].on('update', function() {
        self.emit('update')
      })

      self.emit('update')
    }

    self.models[colorHash].update()
  })
}


module.exports = AssetModels
