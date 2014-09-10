var expect = require('chai').expect

var AssetModel = require('../src/AssetModel')
var WalletEngine = require('../src/WalletEngine')


describe.only('WalletEngine', function() {
  var walletEngine

  beforeEach(function() {
    walletEngine = new WalletEngine()
  })

  afterEach(function() {
    if (walletEngine.isInitialized())
      walletEngine.ccWallet.clearStorage()
  })

  function initializeWallet() {
    var mnemonic = walletEngine.generateMnemonic()
    walletEngine.initializeFromMnemonic(mnemonic)
  }

  it('getAssetModels throws Error', function() {
    expect(walletEngine.getAssetModels).to.throw(Error)
  })

  it('getAssetModels', function(done) {
    initializeWallet()
    walletEngine.setCallback(function() {
      walletEngine.getAssetModels().forEach(function(assetModel) {
        expect(assetModel).to.be.instanceof(AssetModel)
      })
      walletEngine.setCallback(function() {})
      done()
    })
    walletEngine.update()
  })

  it('update throws Error', function() {
    expect(walletEngine.update).to.throw(Error)
  })

  it('generateMnemonic', function() {
    var mnemonic = walletEngine.generateMnemonic()
    expect(mnemonic).to.be.a('string')
    expect(mnemonic.split(' ').length % 3).to.equal(0)
  })

  it('initializeFromMnemonic', function() {
    expect(walletEngine.isInitialized()).to.be.false
    initializeWallet()
    expect(walletEngine.isInitialized()).to.be.true
  })
})
