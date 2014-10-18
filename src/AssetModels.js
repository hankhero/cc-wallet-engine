var events = require('events')
var util = require('util')

var _ = require('lodash')

var AssetModel = require('./AssetModel')

var decode_bitcoin_uri = require('./uri_decoder').decode_bitcoin_uri


/**
 * @class AssetModels
 *
 * @param {cc-wallet-core.Wallet} wallet
 *
 * Inhertis events.EventEmitter
 * Event 'update': triggered on assetModels updated
 */
function AssetModels(wallet, walletEngine) {
  events.EventEmitter.call(this)

  this.models = {}
  this.wallet = wallet
  this.walletEngine = walletEngine
}

util.inherits(AssetModels, events.EventEmitter)

/**
 * @return {AssetModel[]}
 */
AssetModels.prototype.getAssetModels = function() {
  var self = this

  var assetModels = Object.keys(self.models).sort().map(function(assetId) {
    return self.models[assetId]
  })

  return assetModels
}

/**
 * Add new models and update all
 */
AssetModels.prototype.update = function() {
  var self = this

  self.wallet.getAllAssetDefinitions().forEach(function(assetdef) {
    var assetId = assetdef.getId()

    if (_.isUndefined(self.models[assetId])) {
      self.models[assetId] = new AssetModel(self.walletEngine, self.wallet, assetdef)
      self.models[assetId].on('update', function() { self.emit('update') })

      self.emit('update')
    }

    self.models[assetId].update()
  })
}

AssetModels.prototype.getAssetForURI = function (uri) {
  var params = decode_bitcoin_uri(uri)
  if (!params || !params.address)
    return null

  var asset_id = params.asset_id
  if (!asset_id)
    asset_id = 'JNu4AFCBNmTE1' // asset_id for bitcoin

  return this.models[asset_id]
}


module.exports = AssetModels
