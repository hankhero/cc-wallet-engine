var expect = require('chai').expect

var _ = require('lodash')
var ccWallet = require('cc-wallet-core')

var HistoryEntries = require('../src/HistoryEntries')
var HistoryEntryModel = require('../src/HistoryEntryModel')


describe('HistoryEntries', function() {
  var wallet, historyEntries

  beforeEach(function(done) {
    wallet = new ccWallet({ masterKey: '12355564466111166655222222222222', testnet: true })

    wallet.fullScanAllAddresses(function(error) {
      expect(error).to.be.null
      historyEntries = new HistoryEntries(wallet)
      done()
    })
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  it('instance of HistoryEntries', function() {
    expect(historyEntries).to.be.instanceof(HistoryEntries)
  })

  it('getEntries return HistoryEntryModel[]', function(done) {
    historyEntries.on('update', function() {
      if (_.isUndefined(done))
        return

      var entries = historyEntries.getEntries()
      expect(entries).to.be.instanceof(Array).with.to.have.length(1)
      expect(entries[0]).to.be.instanceof(HistoryEntryModel)

      done()
      done = undefined
    })
    historyEntries.update()
  })
})
