var expect = require('chai').expect

var cclib = require('coloredcoinjs-lib')

var AssetDefinition =require('../src/asset/AssetDefinition')
var AssetDefinitionManager = require('../src/asset/AssetDefinitionManager')
var ColorSet = require('../src/asset/ColorSet')
var store = require('../src/store')
var Wallet = require('../src/index')


describe('asset', function() {
  var cdStore, cdManager

  beforeEach(function() {
    cdStore = new cclib.store.ColorDefinitionStore()
    cdManager = new cclib.ColorDefinitionManager(cdStore)
  })

  afterEach(function() {
    cdStore.clear()
  })

  describe('AssetDefinition', function() {
    var assdef
    var bitcoinData = {
      monikers: ['bitcoin'],
      colorSet: [''],
      unit: 100000000
    }

    beforeEach(function() {
      assdef = new AssetDefinition(cdManager, bitcoinData)
    })

    it('constructor return error', function() {
      assdef = new AssetDefinition(cdManager, {
        monikers: ['bitcoin'],
        colorSet: [''],
        unit: 2
      })
      expect(assdef).to.be.instanceof(Error)
    })

    it('getId', function() {
      expect(assdef.getId()).to.equal('JNu4AFCBNmTE1')
    })

    it('getIds', function() {
      expect(assdef.getIds()).to.deep.equal(['JNu4AFCBNmTE1'])
    })

    it('getMonikers', function() {
      expect(assdef.getMonikers()).to.deep.equal(['bitcoin'])
    })

    it('getColorSet', function() {
      expect(assdef.getColorSet()).to.be.instanceof(ColorSet)
    })

    describe('parseValue', function() {
      var fixtures = [
        { description: 'return NaN', value: 'a.00', expect: NaN },
        { description: '0 satoshi', value: '0.00000000', expect: 0 },
        { description: '1 satoshi', value: '0.00000001', expect: 1 },
        { description: '1 btc minus 1 satoshi', value: '0.99999999', expect: 99999999 },
        { description: '1 btc', value: '1.00000000', expect: 100000000 },
        { description: '1 btc plus 1 satoshi', value: '1.00000001', expect: 100000001 },
        { description: '5 btc plus 345 mbtc', value: '5.34500000', expect: 534500000 }
      ]

      fixtures.forEach(function(fixture) {
        it(fixture.description, function() {
          expect(assdef.parseValue(fixture.value)).to.deep.equal(fixture.expect)
        })
      })
    })

    describe('formatValue', function() {
      var fixtures = [
        { description: '0 satoshi', value: 0, expect: '0.00000000' },
        { description: '1 satoshi', value: 1, expect: '0.00000001' },
        { description: '1 btc minus 1 satoshi', value: 99999999, expect: '0.99999999' },
        { description: '1 btc', value: 100000000, expect: '1.00000000' },
        { description: '1 btc plus 1 satoshi', value: 100000001, expect: '1.00000001' },
        { description: '5 btc plus 345 mbtc', value: 534500000, expect: '5.34500000' }
      ]

      fixtures.forEach(function(fixture) {
        it(fixture.description, function() {
          expect(assdef.formatValue(fixture.value)).to.deep.equal(fixture.expect)
        })
      })
    })

    it('getData', function() {
      expect(assdef.getData()).to.deep.equal({
        monikers: ['bitcoin'],
        colorSet: [''],
        unit: 100000000
      })
    })
  })

  describe('AssetDefinitionManager', function() {
    var adStore, adManager

    beforeEach(function() {
      adStore = new store.AssetDefinitionStore()
      adManager = new AssetDefinitionManager({ assetDefinitionStore: adStore, colorDefinitionManager: cdManager })
    })

    afterEach(function() {
      adStore.clear()
    })

    it('create bitcoin AssetDefinition in constructor', function() {
      var assets = adManager.getAllAssets()
      expect(assets).to.have.length(1)
      expect(assets[0].getMonikers()).to.deep.equal(['bitcoin'])
    })

    it('bitcoin AssetDefinition alredy exists', function() {
      adManager = new AssetDefinitionManager({ assetDefinitionStore: adStore, colorDefinitionManager: cdManager })
      var assets = adManager.getAllAssets()
      expect(assets).to.have.length(1)
      expect(assets[0].getMonikers()).to.deep.equal(['bitcoin'])
    })

    it('createAssetDefinition/getAllAssets', function() {
      adManager.createAssetDefinition({
        monikers: ['gold'],
        colorSet: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679'],
        unit: 10000
      })
      var assets = adManager.getAllAssets()
      expect(assets).to.have.length(2)
    })

    it('getByMoniker return AssetDefinition', function() {
      var asset = adManager.getByMoniker('bitcoin')
      expect(asset).to.be.instanceof(AssetDefinition)
    })

    it('getByMoniker return null', function() {
      var asset = adManager.getByMoniker('bronze')
      expect(asset).to.be.null
    })
  })

  describe('AssetModels', function() {
      var wallet
      var masterKey = '123131123131123131123131123131123131123131123131123131'

      beforeEach(function() {
        wallet = new Wallet({ masterKey: masterKey, testnet: true })
      })

      afterEach(function() {
        wallet.clearStorage()
      })

      this.timeout(5000)

      it('', function(done) {
        wallet.addAssetDefinition({
          monikers: ['gold'],
          colorSet: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679']
        })
        var assetModels = wallet.getAssetModels()
        var waitEvents = 5
        assetModels.on('update', function() {
          if (--waitEvents !== 0)
            return

          function checkAssetModel(moniker, model) {
            if (moniker === 'bitcoin') {
              expect(model.getTotalBalance()).to.equal(67000000)
              expect(model.getUnconfirmedBalance()).to.equal(0)
              expect(model.getAvailableBalance()).to.equal(67000000)
            }
            if (moniker === 'gold') {
              expect(model.getTotalBalance()).to.equal(2000)
              expect(model.getUnconfirmedBalance()).to.equal(0)
              expect(model.getAvailableBalance()).to.equal(2000)
            }
          }

          var models = assetModels.getAssetModels()
          expect(models).to.have.length(2)
          checkAssetModel(models[0].getMoniker(), models[0])
          checkAssetModel(models[1].getMoniker(), models[1])

          done()
        })
        assetModels.update()
      })
  })

  describe('ColorSet', function() {
    var colorSet

    it('getColorHash', function() {
      colorSet = new ColorSet({
        colorDefinitionManager: cdManager,
        colorSchemeSet: ['', 'epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679']
      })
      expect(colorSet.getColorHash()).to.equal('6xgXQgnviwX5Lk')
    })

    it('getColorIds', function() {
      colorSet = new ColorSet({ colorDefinitionManager: cdManager, colorSchemeSet: [''] })
      expect(colorSet.getColorIds()).to.deep.equal([0])
    })

    it('getData', function() {
      colorSet = new ColorSet({ colorDefinitionManager: cdManager, colorSchemeSet: [''] })
      expect(colorSet.getData()).to.deep.equal([''])
    })
  })
})
