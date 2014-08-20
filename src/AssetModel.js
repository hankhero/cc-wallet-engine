var events = require('events')
var util = require('util')

var PaymentModel = require('./PaymentModel')


/**
 * @class AssetModel
 *
 * Inhertis events.EventEmitter
 *
 * Event 'update': triggered on one of props properties updated
 *
 * @param {cc-wallet-core.Wallet} wallet
 * @param {cc-wallet-core.asset.AssetDefinition} assetdef
 */
function AssetModel(wallet, assetdef) {
  events.EventEmitter.call(this)

  this.wallet = wallet
  this.assetdef = assetdef

  this.props = {
    moniker: '',
    address: '',
    unconfirmedBalance: '',
    availableBalance: '',
    totalBalance: ''
  }
}

util.inherits(AssetModel, events.EventEmitter)

/**
 * @return {string}
 */
AssetModel.prototype.getMoniker = function () {
  return this.props.moniker
}

/**
 * @return {string}
 */
AssetModel.prototype.getAddress = function () {
  return this.props.address
}

/**
 * @return {string}
 */
AssetModel.prototype.getUnconfirmedBalance = function () {
  return this.props.unconfirmedBalance
}

/**
 * @return {string}
 */
AssetModel.prototype.getAvailableBalance = function () {
  return this.props.availableBalance
}

/**
 * @return {string}
 */
AssetModel.prototype.getTotalBalance = function () {
  return this.props.totalBalance
}

/**
 * @return {PaymentModel}
 */
AssetModel.prototype.makePayment = function() {
  return new PaymentModel(this)
}

/**
 * Update current AssetModel
 */
AssetModel.prototype.update = function() {
  var self = this

  var moniker = self.assetdef.getMonikers()[0]
  if (self.props.moniker !== moniker) {
    self.props.moniker = moniker
    self.emit('update')
  }

  var address = self.wallet.getSomeAddress(self.assetdef, true)
  if (self.props.address !== address) {
    self.props.address = address
    self.emit('update')
  }

  function updateBalance(balanceName, balance) {
    var formattedBalance = self.assetdef.formatValue(balance)

    if (self.props[balanceName] !== formattedBalance) {
      self.props[balanceName] = formattedBalance
      self.emit('update')
    }
  }

  self.wallet.getUnconfirmedBalance(self.assetdef, function(error, balance) {
    if (error === null)
      updateBalance('unconfirmedBalance', balance)
  })

  self.wallet.getAvailableBalance(self.assetdef, function(error, balance) {
    if (error === null)
      updateBalance('availableBalance', balance)
  })

  self.wallet.getTotalBalance(self.assetdef, function(error, balance) {
    if (error === null)
      updateBalance('totalBalance', balance)
  })
}


module.exports = AssetModel
