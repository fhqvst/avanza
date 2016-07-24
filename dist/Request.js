'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var https = require('https');

var _class = function _class(options) {
    _classCallCheck(this, _class);

    return new Promise(function (resolve, reject) {

        var request = https.request({
            host: options.host || 'www.avanza.se',
            port: options.port || 443,
            path: options.path || '/_mobile/account/positions?sort=changeAsc',
            method: options.method || 'POST',
            headers: Object.assign({}, {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)'
            }, options.headers)
        }, function (response) {

            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('The request returned an error: ' + response.statusCode));
            }

            var body = [];
            response.on('data', function (chunk) {
                return body.push(chunk);
            });
            response.on('end', function () {
                if (options.onEnd) {
                    options.onEnd(response);
                }
                resolve(JSON.parse(body.join('')));
            });
        });

        if (options.data) {
            request.write(JSON.stringify(options.data));
        }

        request.end();
        request.on('error', function (e) {
            return reject(e);
        });
    });
};

exports.default = _class;