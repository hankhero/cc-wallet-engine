var expect = require('chai').expect

var ccWallet = require('cc-wallet-core')

var AssetModel = require('../src/AssetModel')
var PaymentModel = require('../src/PaymentModel')


describe('PaymentModel', function() {
  var wallet, assetModel, paymentModel

  beforeEach(function(done) {
    wallet = new ccWallet({ masterKey: '12355564466111166655222332222222', testnet: true })

    var cnt = 0
    assetModel = new AssetModel(wallet, wallet.getAssetDefinitionByMoniker('bitcoin'))
    assetModel.on('update', function() {
      if (++cnt === 5) {
        paymentModel = assetModel.makePayment()
        done()
      }
    })
    assetModel.update()
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  it('checkAddress return true', function() {
    var isValid = paymentModel.checkAddress('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW')
    expect(isValid).to.be.true
  })

  it('checkAddress return false', function() {
    var isValid = paymentModel.checkAddress('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5Wg')
    expect(isValid).to.be.false
  })

  it('checkAmount return true', function() {
    var isValid = paymentModel.checkAmount('0.01')
    expect(isValid).to.be.true
  })

  it('checkAmount return false', function() {
    var isValid = paymentModel.checkAmount('1')
    expect(isValid).to.be.false
  })

  it('addRecipient not throw error', function() {
    var fn = function() { paymentModel.addRecipient('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW', '0.01') }
    expect(fn).to.not.throw(Error)
  })

  it('addRecipient throw error', function(done) {
    paymentModel.addRecipient('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW', '0.001').send(function() {
      var fn = function() { paymentModel.addRecipient('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW', '0.01') }
      expect(fn).to.throw(Error)
      done()
    })
  })

  it('send throw error (payment already sent)', function(done) {
    paymentModel.addRecipient('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW', '0.001').send(function(error, txId) {
      var fn = function() { paymentModel.send(function() {}) }
      expect(fn).to.throw(Error)
      done()
    })
  })

  it('send throw error (recipient is empty)', function() {
    var fn = function() { paymentModel.send(function() {}) }
    expect(fn).to.throw(Error)
  })

  it('send return txId', function(done) {
    paymentModel.addRecipient('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW', '0.001').send(function(error, txId) {
      expect(error).to.be.null
      expect(txId).to.be.an('string')
      done()
    })
  })

  it('getStatus return sent', function(done) {
    paymentModel.addRecipient('n2f687HTAW5R8pg6DRVHn5AS1a2hAK5WgW', '0.001').send(function(error, txId) {
      expect(paymentModel.getStatus()).to.equal('sent')
      done()
    })
  })

  it('getStatus return fresh', function() {
    expect(paymentModel.getStatus()).to.equal('fresh')
  })
})
