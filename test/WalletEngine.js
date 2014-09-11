var expect = require('chai').expect

var AssetModel = require('../src/AssetModel')
var WalletEngine = require('../src/WalletEngine')


describe('WalletEngine', function() {
  var walletEngine

  beforeEach(function() {
    walletEngine = new WalletEngine()
  })

  afterEach(function() {
    walletEngine.ccWallet.clearStorage()
  })

  it('generateMnemonic', function() {
    var mnemonic = walletEngine.generateMnemonic()
    expect(mnemonic).to.be.a('string')
    expect(mnemonic.split(' ').length % 3).to.equal(0)
  })

  it('initialize', function() {
    expect(walletEngine.isInitialized()).to.be.false
    var mnemonic = walletEngine.generateMnemonic()
    walletEngine.initialize(mnemonic)
    expect(walletEngine.isInitialized()).to.be.true
  })

  it('getAssetModels', function(done) {
    var mnemonic = walletEngine.generateMnemonic()
    walletEngine.initialize(mnemonic)
    walletEngine.setCallback(function() {
      walletEngine.getAssetModels().forEach(function(assetModel) {
        expect(assetModel).to.be.instanceof(AssetModel)
      })
      walletEngine.setCallback(function() {})
      done()
    })
    walletEngine.update()
  })
})
