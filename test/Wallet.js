var expect = require('chai').expect

var _ = require('lodash')
var cclib = require('coloredcoinjs-lib')

var AssetModel = require('../src/asset/AssetModel')
var Wallet = require('../src/index')


describe('Wallet', function() {
  var wallet
  var masterKey = '123131123131123131123131123131123131123131123131123131'

  beforeEach(function() {
    wallet = new Wallet({ masterKey: masterKey, testnet: true })
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  it('constructor', function() {})

  it('return CoinQuery', function() {
    expect(wallet.getCoinQuery()).to.be.instanceof(cclib.CoinQuery)
  })

  it('getAssetModels', function() {
    var result = wallet.getAssetModels()
    expect(result).to.have.length(1)
    expect(result[0]).to.be.instanceof(AssetModel)
  })

  it('addAssetDefinition return error', function() {
    var result = wallet.addAssetDefinition({
      monikers: ['bitcoin'],
      colorSet: ['']
    })
    expect(result).to.be.instanceof(Error)
  })

  it('addAssetDefinition return null', function() {
    var result = wallet.addAssetDefinition({
      monikers: ['gold'],
      colorSet: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679'],
      unit: 10
    })
    expect(result).to.be.null
  })

  it('wait calculated balance', function(done) {
    function balanceExpect() {
      wallet.getAssetModels().forEach(function(assetModel) {
        if (assetModel.getMoniker() === 'bitcoin') {
          expect(assetModel.getTotalBalance()).to.equal(66000000)
          expect(assetModel.getAvailableBalance()).to.equal(66000000)
        }
      })
      done()
    }
    // Todo
    /*
    wallet.addAssetDefinition({
      monikers: ['gold'],
      colorSet: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679']
    })
    */
    var waitEvents = 2
    wallet.on('assetModelsUpdated', function() {
      waitEvents -= 1
      if (waitEvents === 0)
        balanceExpect()
      //console.log(wallet.getAssetModels())
    })
  })
})
