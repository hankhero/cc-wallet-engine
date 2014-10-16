
function AssetTargetModel(assetTarget) {
  this.address = assetTarget.getAddress()
  var value = assetTarget.getValue(),
    asset = assetTarget.getAsset()

  this.formattedValue = asset.formatValue(value)
  this.assetMoniker = asset.getMonikers()[0]
}

AssetTargetModel.prototype.getAddress = function () {
  return this.address
}

AssetTargetModel.prototype.getAssetMoniker = function () {
  return this.assetMoniker
}

AssetTargetModel.prototype.getFormattedValue = function () {
  return this.formattedValue
}

module.exports = AssetTargetModel;