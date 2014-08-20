var expect = require('chai').expect

var ccWallet = require('cc-wallet-core')

var AssetModel = require('../src/AssetModel')


describe('AssetModels', function() {
  var wallet, assetModel

  beforeEach(function() {
    wallet = new ccWallet({ masterKey: '12355564466111166655222222222222', testnet: true })
    assetModel = new AssetModel(wallet, wallet.getAssetDefinitionByMoniker('bitcoin'))
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  it('bitcoin AssetModel', function(done) {
    var cnt = 0
    assetModel.on('update', function() {
      if (++cnt !== 5)
        return

      expect(assetModel.getMoniker()).to.equal('bitcoin')
      expect(assetModel.getAddress()).to.equal('JNu4AFCBNmTE1@mv4jLE114t8KHL3LExNGBTXiP2dCjkaWJh')
      expect(assetModel.getUnconfirmedBalance()).to.equal('0.00000000')
      expect(assetModel.getAvailableBalance()).to.equal('0.01000000')
      expect(assetModel.getTotalBalance()).to.equal('0.01000000')

      done()
    })
    assetModel.update()
  })
})
