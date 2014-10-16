exports.make_cinputs_payment_request = function (value, address, assetId, colorDesc) {
    return {
        protocol: "cwpp/0.0",
        messageType: "PaymentRequest",
        acceptedMethods: {cinputs: true},
        value: value,
        address: address,
        colorDesc: colorDesc,
        assetid: assetid
    };
};

exports.make_cinputs_proc_req_1 = function (colorDesc, cinputs, change) {
    return {
        protocol: "cwpp/0.0",
        messageType: "ProcessRequest",
        method: "cinputs",
        stage: 1,
        colorDesc: colorDesc,
        cinputs: cinputs,
        change: change        
    };
};

exports.make_cinputs_proc_req_2 = function (tx) {
    return {
        protocol: "cwpp/0.0",
        messageType: "ProcessRequest",
        method: "cinputs",
        stage: 2,
        tx: tx
    };
};

exports.is_cwpp_uri = function (uri) {
    return uri.indexOf('cwpp:') === 0;    
};

exports.requestURL = function (uri) {
    if (! uri.indexOf('cwpp:') === 0) return null;
    return uri.slice(5)
};

exports.processURL = function (uri) {
    var url = exports.requestURL(uri);
    if (url) {
        return url.replace('/cwpp/', '/cwpp/process/');
    } else return null;
};