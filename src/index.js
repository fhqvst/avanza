import querystring from 'querystring';
import {EventEmitter} from 'events';

import Request from './Request';
import Socket from './Socket';

import * as constants from './constants'

export default class Avanza {

    constructor(options) {
        this._events = new EventEmitter();
        this.socket = (options && options.socket) ? options.socket : new Socket({
            url: constants.SOCKET_URL,
            events: this._events
        });
        this._events.emit('init', this)
    }

    /**
     * Fetch all positions held by the current user
     */
    getPositions() {

        let that = this;
        return new Promise((resolve, reject) => {
            new Request({
                path: constants.POSITIONS_PATH + '?sort=changeAsc',
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': that.authenticationSession,
                    'X-SecurityToken': that.securityToken
                }
            }).then(positions => {

                let temp = [];
                for(let i = 0; i < positions.instrumentPositions.length; i++) {
                    for(let j = 0; j < positions.instrumentPositions[i].positions.length; j++) {

                        let object = {},
                            position = positions.instrumentPositions[i].positions[j]

                        object.accountId = position.accountId || null;
                        object.acquiredValue = position.acquiredValue || null;
                        object.averageAcquiredPrice = position.averageAcquiredPrice || null;
                        object.profit = position.profit || null;
                        object.profitPercent = position.profitPercent || null;
                        object.value = position.value || null;
                        object.volume = position.volume || null;
                        object.instrumentId = position.orderbookId || null;

                        temp.push(object)
                    }
                }
                resolve(temp);

            }).catch(error => reject(error));
        })
    }

    /**
     * Fetch an overview of the accounts of the current user
     */
    getOverview() {
        return new Request({
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
    getAccountOverview(accountId) {
        return new Request({
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
    getDealsAndOrders() {
        return new Request({
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
    getTransactions(accountId, options = {}) {
        return new Request({
            path: constants.TRANSACTIONS_PATH.replace('{0}', accountId) + '?' + querystring.stringify(options),
            method: 'GET',
            headers: {
                'X-AuthenticationSession': this.authenticationSession,
                'X-SecurityToken': this.securityToken
            }
        })
    }

    /**
     * Fetch the current user's watchlists
     */
    getWatchlists() {
        return new Request({
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
    addToWatchlist(instrumentId, watchlistId) {
        return new Request({
            path: constants.WATCHLISTS_ADD_PATH
                .replace('{0}', watchlistId)
                .replace('{1}', instrumentId),
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
    getStock(id) {

        return new Promise((resolve, reject) => {
            return new Request({
                path: constants.STOCK_PATH.replace('{0}', id),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            }).then(instrument => {

                let object = {}

                object.id            = instrument.id || null
                object.marketPlace   = instrument.marketPlace || null
                object.marketList    = instrument.marketList || null
                object.currency      = instrument.currency || null
                object.name          = instrument.name || null
                object.country       = instrument.country || null
                object.lastPrice     = instrument.lastPrice || null
                object.totalValueTraded = instrument.totalValueTraded || null
                object.numberOfOwners = instrument.numberOfOwners || null
                object.buyPrice      = instrument.buyPrice || null
                object.sellPrice     = instrument.sellPrice || null

                object.shortSellable = !!instrument.shortSellable
                object.tradable      = !!instrument.tradable

                object.lastPriceUpdated = instrument.lastPriceUpdated ?
                    new Date(instrument.lastPriceUpdated).getTime() :
                    new Date('1970-01-01').getTime();

                object.changePercent = instrument.changePercent
                object.change        = instrument.change
                object.ticker        = instrument.tickerSymbol || null
                object.totalVolumeTraded = instrument.totalVolumeTraded || null

                object.company = instrument.company ? {
                    marketCapital: instrument.company.marketCapital,
                    chairman: instrument.company.chairman,
                    description: instrument.company.description,
                    name: instrument.company.name,
                    ceo: instrument.company.CEO
                } : null;

                if(instrument.keyRatios) {
                    object.volatility    = instrument.keyRatios.volatility ? instrument.keyRatios.volatility : 0
                    object.pe    = instrument.keyRatios.priceEarningsRatio || null
                    object.yield = instrument.keyRatios.directYield || null
                } else {
                    object.volatility = this.pe = this.yield = 0
                }

                resolve(object)

            }).catch(error => reject(error))
        })


    }

    /**
     * Fetch information about a fund
     *
     * @param id
     */
    getFund(id) {
        return new Request({
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
    getOrderbook(id, type) {
        return new Promise((resolve, reject) => {

            return new Request({
                path: constants.ORDERBOOK_PATH.replace('{0}', type.toLowerCase()) + '?' + querystring.stringify({
                    orderbookId: id
                }),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            }).then(orderbook => {

                let object = {}

                object.instrumentId = orderbook.orderbook.id
                object.orderbook = orderbook.orderbook
                object.levels = []
                object.trades = []

                orderbook.orderDepthLevels.map(level => {
                    object.levels.push({
                        buy: level.buy,
                        sell: level.sell
                    })
                })

                orderbook.latestTrades.map(trade => {
                    object.trades.push({
                        price: trade.price,
                        volume: trade.volume,
                        time: new Date(trade.dealTime).getTime(),
                        seller: trade.seller || '-',
                        buyer: trade.buyer || '-'
                    })
                })

                resolve(object)

            }).catch(error => reject(error));

        })
    }

    /**
     * Fetch a list of orderbook information.
     *
     * @param ids An array of ids
     */
    getOrderbooks(ids) {
        return new Request({
            path: constants.ORDERBOOK_LIST_PATH.replace('{0}', ids.join(',')) + '?' + querystring.stringify({
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
    getChartdata(id, period = constants.ONE_YEAR) {
        return new Request({
            path: constants.CHARTDATA_PATH.replace('{0}', id) + '?' + querystring.stringify({
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
    placeOrder(options) {
        return new Request({
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
    checkOrder(accountId, requestId) {
        return new Request({
            path: constants.ORDER_PATH + '?' + querystring.stringify({
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
    deleteOrder(accountId, orderId) {
        return new Request({
            path: constants.ORDER_PATH + '?' + querystring.stringify({
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
    search(query, type) {

        let path;
        if(type) {
            path = constants.SEARCH_PATH.replace('{0}', type.toUpperCase()) + '?' + querystring.stringify({
                limit: 100,
                query: query
            })
        } else {
            path = constants.SEARCH_PATH.replace('/{0}', '') + '?' + querystring.stringify({
                query: query
            })
        }

        return new Request({
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
    authenticate(credentials, force) {

        let that = this;
        return new Promise((resolve, reject) => {

            if(
                typeof credentials === 'undefined' ||
                !credentials.username ||
                !credentials.password
            ) {
                reject('Avanza.authenticate received no credentials.')
            }

            if(that.isAuthenticated && !force) {

                resolve({
                    securityToken: that.securityToken,
                    authenticationSession: that.authenticationSession,
                    subscriptionId: that.subscriptionId
                })

            } else {

                let securityToken;

                const data = {
                    'maxInactiveMinutes': constants.MAX_INACTIVE_MINUTES,
                    'password': credentials.password,
                    'username': credentials.username
                }

                /**
                 * Create the authentication request
                 */
                const authenticate = new Request({
                    path: constants.AUTHENTICATION_PATH,
                    headers: {
                        'Content-Length': JSON.stringify(data).length
                    },
                    data: data,
                    onEnd: response => {

                        /**
                         * Parse the securitytoken from the headers of the responsee
                         */
                        securityToken = response.headers['x-securitytoken'];
                    }
                });

                authenticate.then(response => {

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

                    this._events.emit('authenticate')

                }).catch(e => reject(e));

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
    createNotification(options) {

        const data = {
            accountId: options.accountId,
            expirationDate: options.expirationDate,
            messageTypes: options.messageTypes,
            orderbookId: options.instrumentId,
            price: options.price,
            priceAim: options.logic
        }

        return new Request({
            path: constants.NOTIFICATION_CREATE_PATH,
            method: 'POST',
            headers: {
                'AZA-loggedin': true,
                'AZA-usertoken': this.securityToken,
                'Cookie': 'AZAHLI=userCredentials; aza-usertoken:' + this.securityToken,
                'Content-Length': JSON.stringify(data).length
            },
            data: data
        })
    }

    /**
     *
     * @param {string} id   A URL-encoded notification id. The only way of getting the notification id is by scraping
     *                      the HTML-markup which {@link createNotification} returns.
     * @returns {Request}
     */
    deleteNotification(id) {
        return new Request({
            path: constants.NOTIFICATION_DELETE_PATH.replace('{0}', id),
            method: 'POST',
            headers: {
                'X-AuthenticationSession': this.authenticationSession,
                'X-SecurityToken': this.securityToken
            }
        })
    }

    on(event, callback) {
        return this._events.on(event, callback);
    }

    /**
     * Fetch an inspiration list
     *
     * @param type
     */
    getInspirationList(type) {
        return new Request({
            path: constants.INSPIRATION_LIST_PATH.replace('{0}', type),
            headers: {
                'X-AuthenticationSession': this.authenticationSession,
                'X-SecurityToken': this.securityToken
            }
        });
    }

}
