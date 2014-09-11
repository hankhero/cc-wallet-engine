var BIP39 = require('bip39')


/**
 * @class PaymentModel
 *
 * @param {AssetModel} assetModel
 */
function PaymentModel(assetModel) {
  this.assetModel = assetModel

  this.readOnly = false
  this.recipients = []
  this.seed = null
}

/**
 * @param {string} address
 * @return {boolean}
 */
PaymentModel.prototype.checkAddress = function(address) {
  var assetdef = this.assetModel.assetdef
  var isValid = this.assetModel.wallet.checkAddress(assetdef, address)
  return isValid
}

/**
 * @param {string} amount
 * @return {boolean}
 */
PaymentModel.prototype.checkAmount = function(amount) {
  var assetdef = this.assetModel.assetdef

  var amountAvailable = assetdef.parseValue(this.assetModel.getAvailableBalance())
  var amountNeeded = assetdef.parseValue(amount)

  return amountAvailable >= amountNeeded
}

/**
 * @param {string} address Color addres or bitcoin address ?
 * @param {string} amount
 * @return {PaymentModel}
 * @throws {Error} If payment already sent
 */
PaymentModel.prototype.addRecipient = function(address, amount) {
  if (this.readOnly)
    throw new Error('payment has already been comitted')

  this.recipients.push({ address: address, amount: amount })

  return this
}

/**
 * @param {string} mnemonic
 * @param {string} password
 * @return {boolean}
 */
PaymentModel.prototype.checkMnemonic = function(mnemonic, password) {
  var seed = BIP39.mnemonicToSeedHex(mnemonic, password)
  return this.assetModel.wallet.isCurrentSeed(seed)
}

/**
 * @param {string} mnemonic
 * @param {string} password
 * @return {PaymentModel}
 * @throws {Error} If payment already sent
 */
PaymentModel.prototype.setMnemonic = function(mnemonic, password) {
  if (this.readOnly)
    throw new Error('payment has already been comitted')

  this.seed = BIP39.mnemonicToSeedHex(mnemonic, password)

  return this
}

/**
 * @callback PaymentModel~send
 * @param {?Error} error
 */

/**
 * @param {PaymentModel~send} cb
 * @return {PaymentModel}
 * @throws {Error} If payment already sent, recipients list not filled or mnemonic not set
 */
PaymentModel.prototype.send = function(cb) {
  if (this.readOnly)
    throw new Error('Payment has already been comitted')

  if (this.recipients.length === 0)
    throw new Error('Recipients list is empty')

  if (this.seed === null)
    throw new Error('Mnemonic not set')

  var assetdef = this.assetModel.assetdef

  var rawTargets = this.recipients.map(function(recipient) {
    return {
      address: this.assetModel.wallet.getBitcoinAddress(assetdef, recipient.address),
      value: assetdef.parseValue(recipient.amount)
    }
  }.bind(this))

  this.readOnly = true

  this.assetModel.wallet.sendCoins(this.seed, this.assetModel.assetdef, rawTargets, cb)

  return this
}

/**
 * @return {string}
 */
PaymentModel.prototype.getStatus = function() {
  var status = this.readOnly ? 'sent' : 'fresh'
  return status
}


module.exports = PaymentModel
