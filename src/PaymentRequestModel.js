var cwpp = require('./cwpp');
var assert = require('assert');
var request = require('request');

function PaymentRequestModel(wallet, assetdef, props) {
    this.wallet = wallet;
    this.assetdef = assetdef;
    this.props = props;
    this.paymentURI = null;
    assert(props.address, 'Address must be provided');
    assert(props.amount, 'Amount must be provided');
    

    var value = assetdef.parseValue(props.amount);
    this.cwppPayReq = cwpp.make_cinputs_payment_request(
        value, props.address, assetdef.getId(),
        assetdef.getColorSet().colorDescs[0]);
}

PaymentRequestModel.prototype.getPaymentURI = function (cb) {
    if (this.paymentURI) return cb(null, this.paymentURI());

    request({
        method: "POST", 
        uri: "http://localhost:4242/cwpp/new-reqest",
        body: JSON.stringify(this.cwppPayReq)},
        function (err, response, body) {
            if (err) return cb(err);
            if (response.statusCode !== 200)
                return cb(new Error("request failed"));
            var json = JSON.parse(body);
            this.paymentURI = "http://localhost:4242/cwpp/" + json.hash;
            return cb(null, this.paymentURI);
        });
};

module.exports = PaymentRequestModel;