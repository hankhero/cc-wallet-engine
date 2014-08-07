var expect = require('chai').expect

var cclib = require('coloredcoinjs-lib')

var AssetDefinition =require('../src/asset/AssetDefinition')
var AssetDefinitionManager = require('../src/asset').AssetDefinitionManager
var ColorSet = require('../src/asset/ColorSet')
var store = require('../src/store')


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

    beforeEach(function() {
      assdef = new AssetDefinition({
        colorDefinitionManager: cdManager,
        data: {
          monikers: ['bitcoin'],
          colorSet: [''],
          unit: 100000000
        }
      })
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
