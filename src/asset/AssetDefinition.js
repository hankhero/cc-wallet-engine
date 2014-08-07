var assert = require('assert')

var _ = require('lodash')
var ColorDefinitionManager = require('coloredcoinjs-lib').ColorDefinitionManager

var ColorSet = require('./ColorSet')


/**
 * @class AssetDefinition
 *
 * @param {Object} params
 * @param {coloredcoinjs-lib.ColorDefinitionManager} params.colorDefinitionManager
 * @param {Object} params.data
 * @param {Array} params.data.monikers
 * @param {Array} params.data.colorSet
 * @param {number} [params.data.unit=1]
 */
function AssetDefinition(params) {
  assert(_.isObject(params), 'Expected Object params, got ' + params)
  assert(params.colorDefinitionManager instanceof ColorDefinitionManager,
    'Expected ColorDefinitionManager params.colorDefinitionManager, got ' + params.colorDefinitionManager)
  assert(_.isObject(params.data), 'Expected Object params.data, got ' + params.data)
  assert(_.isArray(params.data.monikers), 'Expected Array params.data.monikers, got ' + params.data.monikers)
  params.data.monikers.forEach(function(moniker) {
    assert(_.isString(moniker), 'Expected Array strings params.data.monikers, got ' + params.data.monikers)
  })
  assert(_.isArray(params.data.colorSet), 'Expected Array params.data.colorSet, got ' + params.data.colorSet)
  params.data.colorSet.forEach(function(color) {
    assert(_.isString(color), 'Expected Array strings params.data.colorSet, got ' + params.data.colorSet)
  })
  params.data.unit = _.isUndefined(params.data.unit) ? 1 : params.data.unit
  assert(_.isNumber(params.data.unit), 'Expected number params.data.unit, got ' + params.data.unit)

  // Todo
  assert(params.data.colorSet.length === 1, 'Currently only single-color assets are supported')

  this.monikers = params.data.monikers
  this.colorSet = new ColorSet({
    colorDefinitionManager: params.colorDefinitionManager,
    colorSchemeSet: params.data.colorSet
  })
  this.unit = params.data.unit
}

/**
 * @return {string}
 */
AssetDefinition.prototype.getId = function() {
  return this.colorSet.getColorHash()
}

/**
 * @return {Array}
 */
AssetDefinition.prototype.getIds = function() {
  return [this.getId()]
}

/**
 * @return {Array}
 */
AssetDefinition.prototype.getMonikers = function() {
  return this.monikers
}

/**
 * @return {ColorSet}
 */
AssetDefinition.prototype.getColorSet = function() {
  return this.colorSet
}

/**
 * @return {Object}
 */
AssetDefinition.prototype.getData = function() {
  return {
    monikers: this.monikers,
    colorSet: this.colorSet.getData(),
    unit: this.unit
  }
}


module.exports = AssetDefinition
