'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _events = require('events');

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

var _Socket = require('./Socket');

var _Socket2 = _interopRequireDefault(_Socket);

var _constants = require('./constants');

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Avanza = function () {
    function Avanza(options) {
        _classCallCheck(this, Avanza);

        this._events = new _events.EventEmitter();
        this.socket = options && options.socket ? options.socket : new _Socket2.default({
            url: constants.SOCKET_URL,
            events: this._events
        });
        this._events.emit('init', this);
    }

    /**
     * Fetch all positions held by the current user
     */


    _createClass(Avanza, [{
        key: 'getPositions',
        value: function getPositions() {

            var that = this;
            return new Promise(function (resolve, reject) {
                new _Request2.default({
                    path: constants.POSITIONS_PATH + '?sort=changeAsc',
                    method: 'GET',
                    headers: {
                        'X-AuthenticationSession': that.authenticationSession,
                        'X-SecurityToken': that.securityToken
                    }
                }).then(function (positions) {

                    var temp = [];
                    for (var i = 0; i < positions.instrumentPositions.length; i++) {
                        for (var j = 0; j < positions.instrumentPositions[i].positions.length; j++) {

                            var object = {},
                                position = positions.instrumentPositions[i].positions[j];

                            object.accountId = position.accountId || null;
                            object.acquiredValue = position.acquiredValue || null;
                            object.averageAcquiredPrice = position.averageAcquiredPrice || null;
                            object.profit = position.profit || null;
                            object.profitPercent = position.profitPercent || null;
                            object.value = position.value || null;
                            object.volume = position.volume || null;
                            object.instrumentId = position.orderbookId || null;

                            temp.push(object);
                        }
                    }
                    resolve(temp);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Fetch an overview of the accounts of the current user
         */

    }, {
        key: 'getOverview',
        value: function getOverview() {
            return new _Request2.default({
                path: constants.OVERVIEW_PATH,
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
        * Fetch an overview for a given accountId of the current user
         *
         * @param accountId
         */

    }, {
        key: 'getAccountOverview',
        value: function getAccountOverview(accountId) {
            return new _Request2.default({
                path: constants.ACCOUNT_OVERVIEW_PATH.replace('{0}', accountId),
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetch recent transactions and orders by the current user
         */

    }, {
        key: 'getDealsAndOrders',
        value: function getDealsAndOrders() {
            return new _Request2.default({
                path: constants.DEALS_AND_ORDERS_PATH,
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetch specific transaction details for a given account
         * @param accountId {String}
         * @param options {Object} Take a look at the example below:
         *      from: 2014-09-15
         *      to: 2016-10-19
         *      maxAmount: 150000
         *      minAmount: 10
         *      orderbookId: 106733,5276,5422
         */

    }, {
        key: 'getTransactions',
        value: function getTransactions(accountId) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return new _Request2.default({
                path: constants.TRANSACTIONS_PATH.replace('{0}', accountId) + '?' + _querystring2.default.stringify(options),
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetch the current user's watchlists
         */

    }, {
        key: 'getWatchlists',
        value: function getWatchlists() {
            return new _Request2.default({
                path: constants.WATCHLISTS_PATH,
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Adds an instrument to a watchlist
         *
         * @param instrumentId
         * @param watchlistId
         */

    }, {
        key: 'addToWatchlist',
        value: function addToWatchlist(instrumentId, watchlistId) {
            return new _Request2.default({
                path: constants.WATCHLISTS_ADD_PATH.replace('{0}', watchlistId).replace('{1}', instrumentId),
                method: 'PUT',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetch information about a stock
         *
         * @param id The instrument id
         */

    }, {
        key: 'getStock',
        value: function getStock(id) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                return new _Request2.default({
                    path: constants.STOCK_PATH.replace('{0}', id),
                    headers: {
                        'X-AuthenticationSession': _this.authenticationSession,
                        'X-SecurityToken': _this.securityToken
                    }
                }).then(function (instrument) {

                    var object = {};

                    object.id = instrument.id || null;
                    object.marketPlace = instrument.marketPlace || null;
                    object.marketList = instrument.marketList || null;
                    object.currency = instrument.currency || null;
                    object.name = instrument.name || null;
                    object.country = instrument.country || null;
                    object.lastPrice = instrument.lastPrice || null;
                    object.totalValueTraded = instrument.totalValueTraded || null;
                    object.numberOfOwners = instrument.numberOfOwners || null;
                    object.buyPrice = instrument.buyPrice || null;
                    object.sellPrice = instrument.sellPrice || null;

                    object.shortSellable = !!instrument.shortSellable;
                    object.tradable = !!instrument.tradable;

                    object.lastPriceUpdated = instrument.lastPriceUpdated ? new Date(instrument.lastPriceUpdated).getTime() : new Date('1970-01-01').getTime();

                    object.changePercent = instrument.changePercent;
                    object.change = instrument.change;
                    object.ticker = instrument.tickerSymbol || null;
                    object.totalVolumeTraded = instrument.totalVolumeTraded || null;

                    object.company = instrument.company ? {
                        marketCapital: instrument.company.marketCapital,
                        chairman: instrument.company.chairman,
                        description: instrument.company.description,
                        name: instrument.company.name,
                        ceo: instrument.company.CEO
                    } : null;

                    if (instrument.keyRatios) {
                        object.volatility = instrument.keyRatios.volatility ? instrument.keyRatios.volatility : 0;
                        object.pe = instrument.keyRatios.priceEarningsRatio || null;
                        object.yield = instrument.keyRatios.directYield || null;
                    } else {
                        object.volatility = _this.pe = _this.yield = 0;
                    }

                    resolve(object);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Fetch information about a fund
         *
         * @param id
         */

    }, {
        key: 'getFund',
        value: function getFund(id) {
            return new _Request2.default({
                path: constants.FUND_PATH.replace('{0}', id),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetch detailed orderbook information for a given instrument. Note that both id and type is required.
         *
         * @param id
         * @param type Any of the constants defined at the top of this file.
         */

    }, {
        key: 'getOrderbook',
        value: function getOrderbook(id, type) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {

                return new _Request2.default({
                    path: constants.ORDERBOOK_PATH.replace('{0}', type.toLowerCase()) + '?' + _querystring2.default.stringify({
                        orderbookId: id
                    }),
                    headers: {
                        'X-AuthenticationSession': _this2.authenticationSession,
                        'X-SecurityToken': _this2.securityToken
                    }
                }).then(function (orderbook) {

                    var object = {};

                    object.instrumentId = orderbook.orderbook.id;
                    object.orderbook = orderbook.orderbook;
                    object.levels = [];
                    object.trades = [];

                    orderbook.orderDepthLevels.map(function (level) {
                        object.levels.push({
                            buy: level.buy,
                            sell: level.sell
                        });
                    });

                    orderbook.latestTrades.map(function (trade) {
                        object.trades.push({
                            price: trade.price,
                            volume: trade.volume,
                            time: new Date(trade.dealTime).getTime(),
                            seller: trade.seller || '-',
                            buyer: trade.buyer || '-'
                        });
                    });

                    resolve(object);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        /**
         * Fetch a list of orderbook information.
         *
         * @param ids An array of ids
         */

    }, {
        key: 'getOrderbooks',
        value: function getOrderbooks(ids) {
            return new _Request2.default({
                path: constants.ORDERBOOK_LIST_PATH.replace('{0}', ids.join(',')) + '?' + _querystring2.default.stringify({
                    sort: 'name'
                }),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetch data points for a given orderbook id.
         *
         * @param id
         * @param period
         */

    }, {
        key: 'getChartdata',
        value: function getChartdata(id) {
            var period = arguments.length <= 1 || arguments[1] === undefined ? constants.ONE_YEAR : arguments[1];

            return new _Request2.default({
                path: constants.CHARTDATA_PATH.replace('{0}', id) + '?' + _querystring2.default.stringify({
                    timePeriod: period
                }),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Place an order.
         *
         * @param options An object containing the following properties: price, validUntil ("Y-m-d"), volume, orderbookId,
         * orderType (either "BUY" or "SELL") and accountId.
         */

    }, {
        key: 'placeOrder',
        value: function placeOrder(options) {
            return new _Request2.default({
                path: constants.ORDER_PATH,
                data: options,
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Fetches a request status (a request is what precedes an order)
         *
         * @param accountId
         * @param requestId
         */

    }, {
        key: 'checkOrder',
        value: function checkOrder(accountId, requestId) {
            return new _Request2.default({
                path: constants.ORDER_PATH + '?' + _querystring2.default.stringify({
                    accountId: accountId,
                    requestId: requestId
                }),
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Deletes an order
         *
         * @param accountId
         * @param orderId
         */

    }, {
        key: 'deleteOrder',
        value: function deleteOrder(accountId, orderId) {
            return new _Request2.default({
                path: constants.ORDER_PATH + '?' + _querystring2.default.stringify({
                    accountId: accountId,
                    orderId: orderId
                }),
                method: 'DELETE',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Searches for the given query. If type is supplied, only search for results of specified type.
         *
         * @param query
         * @param type Any of the constants defined at the top of this file.
         */

    }, {
        key: 'search',
        value: function search(query, type) {

            var path = void 0;
            if (type) {
                path = constants.SEARCH_PATH.replace('{0}', type.toUpperCase()) + '?' + _querystring2.default.stringify({
                    limit: 100,
                    query: query
                });
            } else {
                path = constants.SEARCH_PATH.replace('/{0}', '') + '?' + _querystring2.default.stringify({
                    query: query
                });
            }

            return new _Request2.default({
                path: path,
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }

        /**
         * Authenticate credentials
         *
         * @param credentials An object containing the properties username and password
         * @param force Do authentication even if the user is already authenticated
         */

    }, {
        key: 'authenticate',
        value: function authenticate(credentials, force) {
            var _this3 = this;

            var that = this;
            return new Promise(function (resolve, reject) {

                if (typeof credentials === 'undefined' || !credentials.username || !credentials.password) {
                    reject('Avanza.authenticate received no credentials.');
                }

                if (that.isAuthenticated && !force) {

                    resolve({
                        securityToken: that.securityToken,
                        authenticationSession: that.authenticationSession,
                        subscriptionId: that.subscriptionId
                    });
                } else {
                    (function () {

                        var securityToken = void 0;

                        var data = {
                            'maxInactiveMinutes': constants.MAX_INACTIVE_MINUTES,
                            'password': credentials.password,
                            'username': credentials.username
                        };

                        /**
                         * Create the authentication request
                         */
                        var authenticate = new _Request2.default({
                            path: constants.AUTHENTICATION_PATH,
                            headers: {
                                'Content-Length': JSON.stringify(data).length
                            },
                            data: data,
                            onEnd: function onEnd(response) {

                                /**
                                 * Parse the securitytoken from the headers of the responsee
                                 */
                                securityToken = response.headers['x-securitytoken'];
                            }
                        });

                        authenticate.then(function (response) {

                            that.isAuthenticated = true;
                            that.securityToken = securityToken;
                            that.authenticationSession = response.authenticationSession;
                            that.subscriptionId = response.pushSubscriptionId;
                            that.customerId = response.customerId;

                            that.socket.subscriptionId = response.pushSubscriptionId;

                            resolve({
                                securityToken: that.securityToken,
                                authenticationSession: that.authenticationSession,
                                subscriptionId: that.subscriptionId
                            });

                            _this3._events.emit('authenticate');
                        }).catch(function (e) {
                            return reject(e);
                        });
                    })();
                }
            });
        }

        /**
         *
         * @param options
         * @param {string}  options.accountId If SMS-notification is set, use this account when paying for it.
         * @param {string}  options.expirationDate A string on the form YYYY-MM-DD describing the expiration date of the
         *                  notification.
         * @param {Array}   options.messageTypes An array of channels to use: {@link PUSH_NOTIFICATION}, {@link EMAIL}
         *                  and/or {@link SMS}.
         * @param {string}  options.instrumentId The instrument to notify on.
         * @param {string}  options.price The price level to use as trigger.
         * @param {string}  options.logic The logic to use when triggering. Can be either {@link ABOVE_OR_EQUAL} or
         *                  {@linke BELOW_OR_EQUAL}.
         * @returns {Request}
         */

    }, {
        key: 'createNotification',
        value: function createNotification(options) {

            var data = {
                accountId: options.accountId,
                expirationDate: options.expirationDate,
                messageTypes: options.messageTypes,
                orderbookId: options.instrumentId,
                price: options.price,
                priceAim: options.logic
            };

            return new _Request2.default({
                path: constants.NOTIFICATION_CREATE_PATH,
                method: 'POST',
                headers: {
                    'AZA-loggedin': true,
                    'AZA-usertoken': this.securityToken,
                    'Cookie': 'AZAHLI=userCredentials; aza-usertoken:' + this.securityToken,
                    'Content-Length': JSON.stringify(data).length
                },
                data: data
            });
        }

        /**
         *
         * @param {string} id   A URL-encoded notification id. The only way of getting the notification id is by scraping
         *                      the HTML-markup which {@link createNotification} returns.
         * @returns {Request}
         */

    }, {
        key: 'deleteNotification',
        value: function deleteNotification(id) {
            return new _Request2.default({
                path: constants.NOTIFICATION_DELETE_PATH.replace('{0}', id),
                method: 'POST',
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }
    }, {
        key: 'on',
        value: function on(event, callback) {
            return this._events.on(event, callback);
        }

        /**
         * Fetch an inspiration list
         *
         * @param type
         */

    }, {
        key: 'getInspirationList',
        value: function getInspirationList(type) {
            return new _Request2.default({
                path: constants.INSPIRATION_LIST_PATH.replace('{0}', type),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            });
        }
    }]);

    return Avanza;
}();

exports.default = Avanza;