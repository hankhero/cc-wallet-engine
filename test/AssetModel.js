var expect = require('chai').expect

var _ = require('lodash')
var cclib = require('coloredcoinjs-lib')
var ccWallet = require('cc-wallet-core')

var AssetModels = require('../src/AssetModels')
var AssetModel = require('../src/AssetModel')


describe('AssetModels', function() {
  var wallet, assetModels

  beforeEach(function() {
    wallet = new ccWallet({ masterKey: '12355564466111166655222222222222', testnet: true })
    assetModels = new AssetModels(wallet)
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  it.only('bitcoin AssetModel', function(done) {
    var cnt = 0
    assetModels.on('update', function() {
      if (++cnt !== 6)
        return

      var models = assetModels.getAssetModels()
      expect(models).to.be.instanceof(Array).with.to.have.length(1)
      expect(models[0]).to.be.instanceof(AssetModel)

      var bitcoin = models[0]
      expect(bitcoin.getMoniker()).to.equal('bitcoin')
      expect(bitcoin.getAddress()).to.equal('mv4jLE114t8KHL3LExNGBTXiP2dCjkaWJh')
      expect(bitcoin.getUnconfirmedBalance()).to.equal('0.00000000')
      expect(bitcoin.getAvailableBalance()).to.equal('0.01000000')
      expect(bitcoin.getTotalBalance()).to.equal('0.01000000')

      done()
    })
    assetModels.update()
  })
})
