
var bitcoin = require('coloredcoinjs-lib').bitcoin

function AssetTargetModel(assetTarget) {
  this.address = "FIXME get address";
  //var script = assetTarget.getScript();
  //var net = bitcoin.networks.testnet; // TODO wher to get current network?
  //this.address = bitcoin.Address.fromOutputScript(script, net).toBase58Check()
  // FIXME above throws TypeError: Expected Script, got 76a914f0bd20cfa50e8725d2d19be98dde3ed1af17df7f88ac

  var value = assetTarget.getValue();
  var asset = assetTarget.getAsset();
  this.formattedValue = asset.formatValue(value);
  this.assetMoniker = asset.getMonikers()[0];
}

AssetTargetModel.prototype.getAddress = function () {
  return this.address;
}

AssetTargetModel.prototype.getAssetMoniker = function () {
  return this.assetMoniker;
}

AssetTargetModel.prototype.getFormattedValue = function () {
  return this.formattedValue;
}

module.exports = AssetTargetModel;
