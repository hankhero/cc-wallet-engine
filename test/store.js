var expect = require('chai').expect

var bitcoin = require('bitcoinjs-lib')
var ECPubKey = bitcoin.ECPubKey
var coloredcoinlib = require('coloredcoinjs-lib')

var store = require('../src/store')
var DataStore = require('../src/store/DataStore')


describe('store', function() {
  function getAvailableDBTest(cls) {
    var availableDB = cls.getAvailableDB()
    expect(availableDB).to.be.instanceof(Array)
    expect(availableDB).to.have.length.of.at.least(1)
  }

  describe('DataStore', function() {
    var ds

    it('inherits coloredcoinlib.store.DataStore', function() {
      ds = new DataStore()
      expect(ds).to.be.instanceof(DataStore)
      expect(ds).to.be.instanceof(coloredcoinlib.store.DataStore)
      expect(ds.store).not.to.be.undefined
    })
  })

  describe('AddressStore', function() {
    var aStore
    var masterKey1 = 'xprv9s21ZrQH143K2JF8RafpqtKiTbsbaxEeUaMnNHsm5o6wCW3z8ySyH4UxFVSfZ8n7ESu7fgir8imbZKLYVBxFPND1pniTZ81vKfd45EHKX73'
    var pubKeyHex1 = '021c10af30f8380f1ff05a02e10a69bd323a7305c43dc461f79c2b27c13532a12c'
    var pubKeyHex2 = '0375d65343d5dcf4527cf712168b41059cb1df513ba89b44108899835329eb643c'

    beforeEach(function() {
      aStore = new store.AddressStore()
    })

    afterEach(function() {
      aStore.clear()
    })

    it('inherits DataStore', function() {
      expect(aStore).to.be.instanceof(DataStore)
      expect(aStore).to.be.instanceof(store.AddressStore)
    })

    it('setMasterKey reset all records', function() {
      aStore.addPubKey({ account: 0, chain: 0, index: 0, pubKey: pubKeyHex1 })
      aStore.setMasterKey(masterKey1)
      expect(aStore.getAllPubKeys({ account: 0, chain: 0 })).to.have.length(0)
    })

    it('getMasterKey return null', function() {
      expect(aStore.getMasterKey()).to.be.undefined
    })

    it('getMasterKey', function() {
      aStore.setMasterKey(masterKey1)
      expect(aStore.getMasterKey()).to.equal(masterKey1)
    })

    it('addPubKey throw UniqueConstraint for account, chain and index', function() {
      aStore.addPubKey({ account: 0, chain: 0, index: 0, pubKey: pubKeyHex1 })
      var fn = function() { aStore.addPubKey({ account: 0, chain: 0, index: 0, pubKey: pubKeyHex2 }) }
      expect(fn).to.throw(Error)
    })

    it('addPubKey throw UniqueConstraint for pubKey', function() {
      aStore.addPubKey({ account: 0, chain: 0, index: 0, pubKey: pubKeyHex1 })
      var fn = function() { aStore.addPubKey({ account: 1, chain: 0, index: 0, pubKey: pubKeyHex1 }) }
      expect(fn).to.throw(Error)
    })

    it('getAllPubKeys', function() {
      aStore.addPubKey({ account: 0, chain: 0, index: 0, pubKey: pubKeyHex1 })
      aStore.addPubKey({ account: 1, chain: 0, index: 0, pubKey: pubKeyHex2 })
      var pubKeys = aStore.getAllPubKeys({ account: 0, chain: 0 })
      expect(pubKeys).to.deep.equal([{ account: 0, chain: 0, index: 0, pubKey: pubKeyHex1 }])
    })

    it('getMaxIndex for empty db', function() {
      var maxIndex = aStore.getMaxIndex({ account: 0, chain: 0 })
      expect(maxIndex).to.be.undefined
    })

    it('getMaxIndex', function() {
      aStore.addPubKey({ account: 0, chain: 0, index: 0, pubKey: pubKeyHex1 })
      aStore.addPubKey({ account: 0, chain: 0, index: 3, pubKey: pubKeyHex2 })
      var maxIndex = aStore.getMaxIndex({ account: 0, chain: 0 })
      expect(maxIndex).to.equal(3)
    })
  })

  describe('ConfigStore', function() {
    var cStore

    beforeEach(function() {
      cStore = new store.ConfigStore()
    })

    afterEach(function() {
      cStore.clear()
    })

    it('inherits DataStore', function() {
      expect(cStore).to.be.instanceof(DataStore)
      expect(cStore).to.be.instanceof(store.ConfigStore)
    })

    it('set/get', function() {
      cStore.set('key', 'myValue!!1')
      expect(cStore.get('key')).to.equal('myValue!!1')
    })

    it('get defaultValue', function() {
      expect(cStore.get('key', 'myDefaultValye')).to.equal('myDefaultValye')
    })
  })
})
