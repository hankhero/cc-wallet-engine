var expect = require('chai').expect

var Wallet = require('../src/index')


function AssetModel(props) {
  if (props.totalBalance === undefined)
    props.totalBalance = 0
  if (props.unconfirmedBalance === undefined)
    props.unconfirmedBalance = 0
  if (props.availableBalance === undefined)
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



function AssetModels(wallet) {
  this.updateCallback = function() {}
  this.models = {}
  this.wallet = wallet
}

AssetModels.prototype.getAssetModels = function() {
  return this.models
}

AssetModels.prototype.setCallback = function(notifier) {
  this.updateCallback = notifier
}

AssetModels.prototype.updateAssetModels = function() {
  var _this = this

  var added = false
  this.wallet.getAllAssetDefinitions().forEach(function(assdef) {
    var colorHash = assdef.getColorSet().getColorHash()
    if (_this.models[colorHash] !== undefined)
      return

    _this.models[colorHash] = new AssetModel({
      moniker: assdef.getMonikers()[0],
      address: _this.wallet.getSomeAddress(assdef)
    })
    added = true
  })

  if (added)
    this.updateCallback()

  Object.keys(this.models).forEach(function(colorHash) {
    var model = _this.models[colorHash]
    var assdef = _this.wallet.getAssetDefinitionByMoniker(model.props.moniker)

    _this.wallet.getAvailableBalance(assdef, function(error, balance) {
      if (error === null && _this.models[colorHash].props.availableBalance !== balance) {
        _this.models[colorHash].props.availableBalance = balance
        _this.updateCallback()
      }
    })

    _this.wallet.getTotalBalance(assdef, function(error, balance) {
      if (error === null && _this.models[colorHash].props.totalBalance !== balance) {
        _this.models[colorHash].props.totalBalance = balance
        _this.updateCallback()
      }
    })

    _this.wallet.getUnconfirmedBalance(assdef, function(error, balance) {
      if (error === null && _this.models[colorHash].props.unconfirmedBalance !== balance) {
        _this.models[colorHash].props.unconfirmedBalance = balance
        _this.updateCallback()
      }
    })
  })
}


describe('AssetModelDemo', function() {
  var wallet, assetModels
  var masterKey = '123131123131123131123131123131123131123131123131123131'

  beforeEach(function() {
    wallet = new Wallet({ masterKey: masterKey, testnet: true })
    assetModels = new AssetModels(wallet)
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  this.timeout(5000)

  it('', function(done) {
    wallet.addAssetDefinition({
      monikers: ['gold'],
      colorSet: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679']
    })
    var waitEvents = 5
    assetModels.setCallback(function() {
      waitEvents -= 1
      if (waitEvents === 0) {
        var uncoloredModel = assetModels.getAssetModels()['JNu4AFCBNmTE1']
        expect(uncoloredModel.getTotalBalance()).to.equal(67000000)
        expect(uncoloredModel.getUnconfirmedBalance()).to.equal(0)
        expect(uncoloredModel.getAvailableBalance()).to.equal(67000000)

        var epobcModel = assetModels.getAssetModels()['ES5wsZmWHs5xzP']
        expect(epobcModel.getTotalBalance()).to.equal(2000)
        expect(epobcModel.getUnconfirmedBalance()).to.equal(0)
        expect(epobcModel.getAvailableBalance()).to.equal(2000)

        done()
      }
    })
    assetModels.updateAssetModels()
  })
})
