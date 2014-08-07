var assert = require('assert')

var _ = require('lodash')
var ColorDefinitionManager = require('coloredcoinjs-lib').ColorDefinitionManager

var AssetDefinition = require('./AssetDefinition')
var AssetDefinitionStore = require('../store').AssetDefinitionStore


/**
 * @class AssetDefinitionManager
 *
 * @param {Object} params
 * @param {store.AssetDefinitionStore} params.assetDefinitionStore
 * @param {coloredcoinjs-lib.ColorDefinitionManager} params.colorDefinitionManager
 */
function AssetDefinitionManager(params) {
  assert(_.isObject(params), 'Expected Object params, got ' + params)
  assert(params.assetDefinitionStore instanceof AssetDefinitionStore,
    'Expected AssetDefinitionStore params.assetDefinitionStore, got ' + params.assetDefinitionStore)
  assert(params.colorDefinitionManager instanceof ColorDefinitionManager,
    'Expected ColorDefinitionManager params.colorDefinitionManager, got ' + params.colorDefinitionManager)

  this.adStore = params.assetDefinitionStore
  this.cdManager = params.colorDefinitionManager

  if (this.adStore.getByMoniker('bitcoin') === null)
    this.createAssetDefinition({
      monikers: ['bitcoin'],
      colorSet: [''],
      unit: 100000000
    })
}

/**
 * Create new AssetDefinition and return it or Error
 *
 * @param {Object} data
 * @param {Array} data.monikers Asset names
 * @param {Array} data.colorSet Asset colors
 * @param {number} [data.unit=1] Asset unit
 * @return {AssetDefinition|Error}
 */
AssetDefinitionManager.prototype.createAssetDefinition = function(data) {
  // asserts for data in AssetDefinition
  var assdef = new AssetDefinition({ colorDefinitionManager: this.cdManager, data: data })

  var error = this.adStore.add({
    ids: assdef.getIds(),
    monikers: assdef.getData().monikers,
    colorSet: assdef.getData().colorSet,
    unit: assdef.getData().unit
  })

  return (error === null ? assdef : error)
}

/**
 * @param {string} moniker
 * @return {AssetDefinition|null}
 */
AssetDefinitionManager.prototype.getByMoniker = function(moniker) {
  assert(_.isString(moniker), 'Expected string moniker, got ' + moniker)

  var result = this.adStore.getByMoniker(moniker)

  if (result !== null)
    result = new AssetDefinition({ colorDefinitionManager: this.cdManager, data: result })

  return result
}

/**
 * @return {Array}
 */
AssetDefinitionManager.prototype.getAllAssets = function() {
  var assdefs = this.adStore.getAll().map(function(record) {
    return new AssetDefinition({ colorDefinitionManager: this.cdManager, data: record })
  }.bind(this))

  return assdefs
}


module.exports = AssetDefinitionManager
