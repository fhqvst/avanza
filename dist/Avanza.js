'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var querystring = require('querystring');
var https = require('https');

var _class = function () {
    function _class() {
        _classCallCheck(this, _class);

        this.isAuthenticated = false;
    }

    _createClass(_class, [{
        key: 'setSecurityToken',
        value: function setSecurityToken(securityToken) {
            this.securityToken = securityToken;
        }
    }, {
        key: 'setAuthenticationSession',
        value: function setAuthenticationSession(authenticationSession) {
            this.authenticationSession = authenticationSession;
        }
    }, {
        key: 'getSecurityToken',
        value: function getSecurityToken() {
            return this.securityToken;
        }
    }, {
        key: 'getAuthenticationSession',
        value: function getAuthenticationSession() {
            return this.authenticationSession;
        }
    }, {
        key: 'request',
        value: function request(url, data, headers) {

            return new Promise(function (resolve, reject) {

                var options = {
                    host: 'www.avanza.se',
                    port: 443,
                    path: url,
                    json: true,
                    method: 'POST',
                    headers: Object.assign({}, {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'Content-Length': '80',
                        'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)'
                    }, headers)
                };

                var request = https.request(options, function (response) {

                    if (options.json) {
                        (function () {

                            var body = [];
                            response.on('data', function (chunk) {
                                return body.push(chunk);
                            });
                            response.on('end', function () {
                                resolve({
                                    headers: response.headers,
                                    body: JSON.parse(body.join(''))
                                });
                            });
                        })();
                    } else {
                        resolve(response);
                    }
                });

                request.write(data);
                request.end();
                request.on('error', function (e) {
                    console.log(e);
                });
            });
        }
    }, {
        key: 'getPositions',
        value: function getPositions() {
            var _this = this;

            var that = this;
            return new Promise(function (resolve, reject) {
                if (_this.isAuthenticated) {

                    var request = https.request({
                        host: 'www.avanza.se',
                        port: 443,
                        path: '/_mobile/account/positions?sort=changeAsc',
                        method: 'POST',
                        headers: {
                            'Accept': '*/*',
                            'Content-Type': 'application/json',
                            'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)',
                            'X-AuthenticationSession': that.getAuthenticationSession(),
                            'X-SecurityToken': that.getSecurityToken()
                        } }, function (response) {

                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error('Failed to load page, status code: ' + response.statusCode));
                        }

                        var body = [];
                        response.on('data', function (chunk) {
                            return body.push(chunk);
                        });
                        response.on('end', function () {
                            resolve(JSON.parse(body.join('')));
                        });
                    });

                    request.end();
                    request.on('error', function (err) {
                        return reject(err);
                    });
                } else {
                    reject(new Error('Not authenticated.'));
                }
            });
        }
    }, {
        key: 'getInstrument',
        value: function getInstrument(instrumentId) {

            return this.login().then(function (data) {

                return new Promise(function (resolve, reject) {

                    var request = https.request({
                        host: 'www.avanza.se',
                        port: 443,
                        path: '/_mobile/market/stock/' + instrumentId,
                        method: 'POST',
                        headers: {
                            'Accept': '*/*',
                            'Content-Type': 'application/json',
                            'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)',
                            'X-AuthenticationSession': data.authenticationSession,
                            'X-SecurityToken': data.securityToken
                        } }, function (response) {

                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error('Failed to load page, status code: ' + response.statusCode));
                        }

                        var body = [];
                        response.on('data', function (chunk) {
                            return body.push(chunk);
                        });
                        response.on('end', function () {
                            resolve(JSON.parse(body.join('')));
                        });
                    });

                    request.end();
                    request.on('error', function (err) {
                        return reject(err);
                    });
                });
            });
        }
    }, {
        key: 'authenticate',
        value: function authenticate(credentials) {

            var that = this;
            return new Promise(function (resolve, reject) {

                var request = https.request({
                    host: 'www.avanza.se',
                    port: 443,
                    path: '/_api/authentication/sessions/username',
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'Content-Length': '80',
                        'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)'
                    } }, function (response) {

                    if (response.statusCode < 200 || response.statusCode > 299) {
                        reject(new Error('Failed to load page, status code: ' + response.statusCode));
                    }

                    var body = [];
                    response.on('data', function (chunk) {
                        return body.push(chunk);
                    });
                    response.on('end', function () {

                        var data = JSON.parse(body.join(''));
                        data.securityToken = response.headers['x-securitytoken'];

                        that.isAuthenticated = true;
                        that.setSecurityToken(data.securityToken);
                        that.setAuthenticationSession(data.authenticationSession);

                        resolve({
                            securityToken: data.securityToken,
                            authenticationSession: data.authenticationSession
                        });
                    });
                });

                request.write(JSON.stringify({
                    'maxInactiveMinutes': '1440',
                    'password': credentials.password,
                    'username': credentials.username
                }));

                request.end();
                request.on('error', function (e) {
                    return reject(new Error(e));
                });
            });
        }
    }]);

    return _class;
}();

exports.default = _class;