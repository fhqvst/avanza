'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function Request(options) {
    _classCallCheck(this, Request);

    return new Promise(function (resolve, reject) {

        var request = _https2.default.request({
            host: options.host || _constants.BASE_URL,
            port: options.port || _constants.PORT,
            path: options.path || '',
            method: options.method || 'POST',
            headers: Object.assign({}, {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'User-Agent': _constants.USER_AGENT
            }, options.headers)
        }, function (response) {

            if (response.statusCode < 200 || response.statusCode > 299) {
                return reject(new Error('The request returned an error: ' + response.statusCode + ' ' + response.statusMessage));
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

exports.default = Request;