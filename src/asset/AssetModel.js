var _ = require('lodash')


function AssetModel(props) {
  if (_.isUndefined(props.totalBalance))
    props.totalBalance = 0
  if (_.isUndefined(props.unconfirmedBalance))
    props.unconfirmedBalance = 0
  if (_.isUndefined(props.availableBalance))
    props.availableBalance = 0

  this.props = props
}

AssetModel.prototype.getMoniker = function () {
  return this.props.moniker
}

AssetModel.prototype.getAddress = function () {
  return this.props.address
}

AssetModel.prototype.getTotalBalance = function () {
  return this.props.totalBalance
}

AssetModel.prototype.getUnconfirmedBalance = function () {
  return this.props.unconfirmedBalance
}

AssetModel.prototype.getAvailableBalance = function () {
  return this.props.availableBalance
}


module.exports = AssetModel
