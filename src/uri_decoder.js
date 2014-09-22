exports.decode_bitcoin_uri = function (uri) {

    if (uri.slice(0, 8) != 'bitcoin:')
        return null;

    // code from darkwallet
    uri = decodeURIComponent(uri);
    var pars = {};
    var req; // BIP-0021
    pars.address = uri.replace('bitcoin:', '').split('?')[0];
    if (uri.split('?')[1]) {
        uri.split('?')[1].split('&').forEach(function(parsed) {
            if(parsed) {
                pars[parsed.split('=')[0]] = parsed.split('=')[1];
                if (parsed.split('=')[0].indexOf('req-') == 0) {
                    req = true;
                }
            }
        });
    }
    return !req ? pars : null;
}
