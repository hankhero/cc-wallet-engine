var AssetModels = require('./AssetModels')
var Wallet = require('cc-wallet-core')

function WalletEngine(opts) {
    this.wallet = null;
    this.assetModels = null;
    this.updateCallback = function () {};
}

WalletEngine.prototype.isInitialized = function () {
    return this.wallet != null;
};

WalletEngine.prototype.getAssetModels = function () {
    if (this.isInitialized()) {
        return [];
    } else {
        return this.assetModels.getAssetModels();
    }
};

WalletEngine.prototype.update = function () {
    if (this.assetModels)
        this.assetModels.update();
};

WalletEngine.prototype.initializeFromSeed = function (seed) {
    var params = null;
    if (seed === 'test')
        params = {
                "masterKey": "123131123131123131123131123131123131123131123131123131", 
                testnet: true
        };
    if (params == null) throw 'not implemented';
    this.wallet = new Wallet(params);
    this.assetModels = new AssetModels(wallet);
    this.assetModels.on('update', function () { this.updateCallback(); });
    this.assetModels.update();
};


WalletEngine.prototype.setCallback = function (callback) {
    this.updateCallback = callbacl;
};

WalletEngine.prototype.generateRandomSeed = function (entropy) {
    // TODO
    return "test";
}

WalletEngine.prototype.getHistory = function () {
    // TODO
    return [];
}

module.exports = WalletEngine;
