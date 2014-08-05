

function AssetModel(props) {
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
