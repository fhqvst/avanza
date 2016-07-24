'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        key: 'getPositions',
        value: function getPositions() {

            var that = this;
            return new _Request2.default({
                path: '/_mobile/account/positions?sort=changeAsc',
                headers: {
                    'X-AuthenticationSession': that.getAuthenticationSession(),
                    'X-SecurityToken': that.getSecurityToken()
                }
            });
        }
    }, {
        key: 'getInstrument',
        value: function getInstrument(id) {

            var that = this;
            return new _Request2.default({
                path: '/_mobile/market/stock/' + id,
                headers: {
                    'X-AuthenticationSession': that.getAuthenticationSession(),
                    'X-SecurityToken': that.getSecurityToken()
                }
            });
        }
    }, {
        key: 'authenticate',
        value: function authenticate(credentials) {

            var that = this;

            return new Promise(function (resolve, reject) {

                var securityToken = void 0;

                /**
                 * Create the authentication request
                 */
                var authenticate = new _Request2.default({
                    path: '/_api/authentication/sessions/username',
                    headers: {
                        'Content-Length': '80'
                    },
                    data: {
                        'maxInactiveMinutes': '1440',
                        'password': credentials.password,
                        'username': credentials.username
                    },
                    onEnd: function onEnd(response) {

                        /**
                         * Parse the securitytoken from the headers of the responsee
                         */
                        securityToken = response.headers['x-securitytoken'];
                    }
                });

                authenticate.then(function (response) {
                    that.isAuthenticated = true;
                    that.setSecurityToken(securityToken);
                    that.setAuthenticationSession(response.authenticationSession);

                    resolve({
                        securityToken: securityToken,
                        authenticationSession: response.authenticationSession
                    });
                }).catch(function (e) {
                    return reject(e);
                });
            });
        }
    }]);

    return _class;
}();

exports.default = _class;