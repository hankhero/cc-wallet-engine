var expect = require('chai').expect

var ccWallet = require('cc-wallet-core')
var _ = require('lodash')

var HistoryEntries = require('../src/HistoryEntries')
var HistoryEntryModel = require('../src/HistoryEntryModel')


describe('HistoryEntryModel', function() {
  var wallet, assetModel, historyEntry

  beforeEach(function(done) {
    wallet = new ccWallet({ masterKey: '12355564466111166655222222222222', testnet: true })
    wallet.fullScanAllAddresses(function(error) {
      expect(error).to.be.null

      historyEntries = new HistoryEntries(wallet)
      historyEntries.on('update', function() {
        if (_.isUndefined(done))
          return

        var entries = historyEntries.getEntries()
        expect(entries).to.be.instanceof(Array).with.to.have.length(1)
        expect(entries[0]).to.be.instanceof(HistoryEntryModel)
        historyEntry = entries[0]

        done()
        done = undefined
      })
      historyEntries.update()
    })
  })

  afterEach(function() {
    wallet.clearStorage()
  })

  it('getTxId', function() {
    expect(historyEntry.getTxId()).to.equal('51e8dfe12367d3a0e9a9c8c558c774b98330561a12a8e3fdc805f6e6d25dc7db')
  })

  it('getDate', function() {
    expect(historyEntry.getDate()).to.equal('01/17/70 13:14:47')
  })

  it('getValues', function() {
    expect(historyEntry.getValues()).to.deep.equal([ '0.01000000' ])
  })

  it('isSend', function() {
    expect(historyEntry.isSend()).to.be.false
  })

  it('isReceive', function() {
    expect(historyEntry.isReceive()).to.be.true
  })

  it('isPaymentToYourself', function() {
    expect(historyEntry.isPaymentToYourself()).to.be.false
  })

  it('getTransactionType', function() {
    expect(historyEntry.getTransactionType()).to.equal('Receive')
  })
})
