var events = require('events')
var util = require('util')

var HistoryEntryModel = require('./HistoryEntryModel')
var PaymentModel = require('./PaymentModel')
var _ = require('lodash')

var decode_bitcoin_uri = require('./uri_decoder').decode_bitcoin_uri


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
    totalBalance: '',
    historyEntries: []
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
 * @return {HistoryEntryModel[]}
 */
AssetModel.prototype.getHistory = function() {
  return this.props.historyEntries
}

/**
 * @return {PaymentModel}
 */
AssetModel.prototype.makePayment = function(seed) {
  return new PaymentModel(this, seed)
}


// TODO: we should create PaymentModel instead of 
// decoding URI
AssetModel.prototype.decodePaymentURI = function (uri) {
  var params = decode_bitcoin_uri(uri)
  if (!params || !params.address)
    throw new Error('wrong payment URI')

  var asset_id = params.asset_id
  if (!asset_id)
    asset_id = 'JNu4AFCBNmTE1' // asset_id for bitcoin
  if (asset_id != this.assetdef.getId())
    throw new Error('wrong payment URI (wrong asset)')

  var coloraddress = params.address
  if (asset_id != 'JNu4AFCBNmTE1')
    coloraddress = asset_id + "@" + coloraddress

  return { address: coloraddress, amount: params.amount }
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

  var isBitcoin = (self.assetdef.getId() == 'JNu4AFCBNmTE1')
  var address = self.wallet.getSomeAddress(self.assetdef, !isBitcoin)
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
    else console.log(error)
  })

  self.wallet.getAvailableBalance(self.assetdef, function(error, balance) {
    if (error === null)
      updateBalance('availableBalance', balance)
    else console.log(error)
  })

  self.wallet.getTotalBalance(self.assetdef, function(error, balance) {
    if (error === null)
      updateBalance('totalBalance', balance)
    else console.log(error)
  })

  self.wallet.getHistory(self.assetdef, function(error, entries) {
    if (error)
      return

    function entryEqualFn(entry, index) { return entry.getTxId() === entries[index].getTxId() }

    var isEqual = self.props.historyEntries.length === entries.length && self.props.historyEntries.every(entryEqualFn)
    if (isEqual)
        return

    self.props.historyEntries = entries.map(function(entry) { 
        return new HistoryEntryModel(entry)
    }).reverse()

    self.emit('update')
  })
}


module.exports = AssetModel
