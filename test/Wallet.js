var expect = require('chai').expect

var _ = require('lodash')
var cclib = require('coloredcoinjs-lib')

var ccWalletEngine = require('../src/index')
var Wallet = ccWalletEngine.Wallet


describe('Wallet', function() {
  var wallet
  var masterKey = '00000000000000000000000000000000'

  beforeEach(function() {
    wallet = new Wallet({ masterKey: masterKey, testnet: true })
  })

  it('constructor', function() {})

  it('return CoinQuery', function() {
    expect(wallet.getCoinQuery()).to.be.instanceof(cclib.CoinQuery)
  })

  it('wait event assetModelsUpdated', function(mochaDone) {
    function done() {
      if (!_.isUndefined(mochaDone)) {
        mochaDone()
        mochaDone = undefined
      }
    }

    wallet.on('assetModelsUpdated', done)
    wallet.on('error', function(error) {
      expect(error).to.be.null // for abort, how make it's best?
      done()
    })
  })
})
