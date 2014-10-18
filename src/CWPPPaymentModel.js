var PaymentModel = require('./PaymentModel');
var inherits = require('util').inherits;
var request = require('request');
var cwpp = require('./cwpp');
var OperationalTx = require('cc-wallet-core').tx.OperationalTx;

function CWPPPaymentModel(walletEngine, paymentURI) {
    PaymentModel(null, null);
    this.walletEngine = walletEngine;
    this.paymentURI = paymentURI;
    this.state = 'non-initialized';
    this.payreq = null;
}

inherits(CWPPPaymentModel, PaymentModel);

CWPPPaymentModel.prototype.initialize = function (cb) {
    var self = this;
    request({method: 'GET',
             uri: cwpp.requestURL(this.paymentURI)},
            function (err, response, body) {
                if (err) return cb(err);
                if (response.statusCode !== 200) 
                    return cb(new Error('request failed'));
                else {
                    self.payreq = JSON.parse(body);
                    var assetid = self.payreq.assetId;
                    self.assetModel = self.walletEngine.assetModels.models[assetId];
                    
                    if (!self.assetModel)
                        return cb(new Error('asset not found'));
                    var assetdef = self.assetModel.assetdef;
                    var amount = assetdef.formatValue(self.payreq.value);
                    self.recipients = [{address: self.payreq.address,
                                        amount: amount}];
                    this.state = 'fresh';
                    return cb(null);
                }                
            });
};

CWPPPaymentModel.prototype.addRecipient = function (address, amount) {
    throw Error('can only get recipients from payment URI');
}

CWPPPaymentModel.prototype.selectCoins = function (cb) {
    var self = this;
    var wallet = this.walletEngine.ccWallet;
    var op_tx = new OperationalTx(wallet);
    var assetdef = this.assetModel.assetdef;
    var colordef =   wallet.cdManager.getByColorId(assetdef.getColorSet().getColorIds()[0]);
    var colorValue = new cclib.ColorValue(colordef, this.payreq.value);
    op_tx.selectCoins(colorValue, null, function (err, coins, value) {
        if (err) cb(err);
        else {
            var cinputs = coins.map(function (coin) { return coin.toRawCoin();});
            var change = null;
            if (value > self.payreq.value) {
                change = {address: op_tx.getChangeAddress(colordef),
                          value: (value - self.payreq.value)};
                          
            }
            cb(null, cinputs, change, colordef);
        }
    });
};

CWPPPaymentModel.prototype.publishTx = function (tx, cb) {
    // TODO: This code is from cc-wallet-core.Wallet, refactor later
    var signedTx = tx;
    var self = this.walletEngine.ccWallet;
    Q.ninvoke(self.getBlockchain(), 'sendTx', tx).then(function () {
            var timezoneOffset = new Date().getTimezoneOffset() * 60;
            var timestamp = Math.round(+new Date()/1000) + timezoneOffset;
            return Q.ninvoke(self.getTxDb(), 'addUnconfirmedTx', 
            { tx: signedTx, timestamp: timestamp });
    }).then(function() {
      return signedTx.getId();
    }).done(function(txId) { cb(null, txId); }, function(error) { cb(error); });
};

CWPPPaymentModel.prototype.send = function (cb) {
    var self = this;
    if (this.readOnly)
        throw new Error('Payment has already been comitted');
    if (!this.state == 'fresh')
        throw new Error('Payment was not properly initialized');
    if (this.recipients.length === 0)
        throw new Error('Recipients list is empty');
    if (this.seed === null)
        throw new Error('Mnemonic not set');
    
    this.readOnly = true;
    this.status = 'sending';

    var processURL= cwpp.processURL(this.paymentURI);

    function fail (err) {
        self.status = 'failed';
        cb(err);
    }

    function cwpp_process(message, prcb) {
        request({method: 'POST',
                 uri: processURL,
                 body: JSON.stringify(message)},
                function (err, response, body) {
                    if (err) fail(err);
                    if (response.statusCode !== 200)
                        fail(new Error('request failed'));
                    prcb(JSON.parse(body));
                });        
    }
    var wallet = this.walletEngine.ccWallet;
    this.selectCoins(function (err, cinputs, change, colordef) {
        if (err) fail(err);
        else {
            cwpp_process(
                cwpp.make_cinputs_proc_req_1(colordef.getColorDesc(),
                                             cinputs, change),
                function (resp) {
                    var rawtx = RawTx.fromHex(resp.tx);
                    // TODO: check before signing tx!
                    transformTx(rawtx, 'signed', {wallet: wallet, seed: self.seed},
                    function (err, tx) {
                        if (err) fail(err);
                        else
                        cwpp_process(
                            cwpp.make_cinputs_proc_req_2(tx.toHex()),
                            function (resp) {
                                self.publishTx(resp.tx, cb);
                            });
                    });
                });
        }                         
    });

};