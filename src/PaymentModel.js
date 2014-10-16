var BIP39 = require('bip39')


/**
 * @class PaymentModel
 *
 * @param {AssetModel} assetModel
 */
function PaymentModel(assetModel, seed) {
  this.assetModel = assetModel
  this.readOnly = false
  this.status = null
  this.recipients = []
  this.seed = seed
}

PaymentModel.prototype.setSeed = function (seed) {
    this.seed = seed;
};

PaymentModel.prototype.getAssetModel = function () {
    return this.assetModel;
}
PaymentModel.prototype.getTotalAmount = function () {
    var assetdef = this.assetModel.assetdef;
    var sum = 0;
    this.recipients.forEach(function (recp) {
            sum += assetdef.parseValue(recp.amount);
    });
    return assetdef.formatValue(sum);
}

PaymentModel.prototype.getRecipients = function () {
    return this.recipients;
};


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
 * @callback PaymentModel~send
 * @param {?Error} error
 */

/**
 * @param {PaymentModel~send} cb
 * @return {PaymentModel}
 * @throws {Error} If payment already sent, recipients list not filled or mnemonic not set
 */
PaymentModel.prototype.send = function(cb) {
  var self = this
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
  this.status = 'sending'

  function sendCoinsCallback(err, txid) {
    if (err)
      console.error(err)

    self.status = err ? 'failed' : 'send'
    self.assetModel.update()

    cb(err, txid)
  }

  this.assetModel.wallet.sendCoins(
    this.seed, this.assetModel.assetdef, rawTargets, sendCoinsCallback)

  return this
}

// 'fresh', 'sending', 'sent', 'failed'

/**
 * @return {string}
 */
PaymentModel.prototype.getStatus = function() {
  if (!this.readOnly)
    return 'fresh'

  return this.status
}


module.exports = PaymentModel
