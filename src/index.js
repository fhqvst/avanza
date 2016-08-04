import querystring from 'querystring';
import {EventEmitter} from 'events';

import Request from './Request';
import Position from './Position';
import Instrument from './Instrument';
import Orderbook from './Orderbook';
import Socket from './Socket';

export const STOCK = 'stock'
export const FUND = 'fund'
export const BOND = 'bond'
export const OPTION = 'option'
export const FUTURE_FORWARD = 'future_forward'
export const CERTIFICATE = 'certificate'
export const WARRANT = 'warrant'
export const ETF = 'exchange_traded_fund'
export const INDEX = 'index';
export const PREMIUM_BOND = 'premium_bond'
export const SUBSCRIPTION_OPTION = 'subscription_option'
export const EQUITY_LINKED_BOND = 'equity_linked_bond';
export const CONVERTIBLE = 'convertible';

export default class Avanza {

    constructor(options) {
        this._events = new EventEmitter();
        this.socket = (options && options.socket) ? options.socket : new Socket({
            url: 'wss://www.avanza.se/_push/cometd',
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
                path: '/_mobile/account/positions?sort=changeAsc',
                method: 'GET',
                headers: {
                    'X-AuthenticationSession': that.authenticationSession,
                    'X-SecurityToken': that.securityToken
                }
            }).then(positions => {

                let temp = [];
                for(let i = 0; i < positions.instrumentPositions.length; i++) {
                    for(let j = 0; j < positions.instrumentPositions[i].positions.length; j++) {
                        temp.push(new Position(positions.instrumentPositions[i].positions[j]));
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
            path: '/_mobile/account/overview',
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
            path: '/_mobile/account/dealsandorders',
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
    getWatchlists() {
        return new Request({
            path: '/_mobile/usercontent/watchlist',
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
            path: '/_api/usercontent/watchlist/' + watchlistId + '/orderbooks/' + instrumentId,
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
                path: '/_mobile/market/stock/' + id,
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            }).then(instrument => {
                resolve(new Instrument(instrument));
            }).catch(error => reject(error));
        })


    }

    /**
     * Fetch information about a fund
     *
     * @param id
     */
    getFund(id) {
        return new Request({
            path: '/_mobile/market/fund/' + id,
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
                path: '/_mobile/order/' + type.toLowerCase() + '?' + querystring.stringify({
                    orderbookId: id
                }),
                headers: {
                    'X-AuthenticationSession': this.authenticationSession,
                    'X-SecurityToken': this.securityToken
                }
            }).then(orderbook => {
                resolve(new Orderbook(orderbook));
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
            path: '/_mobile/market/orderbooklist' + ids.join(',') + '?' + querystring.stringify({
                sort: 'name'
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
            path: '/_api/order',
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
            path: '/_api/order?' + querystring.stringify({
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
            path: '/_api/order?' + querystring.stringify({
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
            path = '/_mobile/market/search/' + type.toUpperCase() + '?' + querystring.stringify({
                limit: 100,
                query: query
            })
        } else {
            path = '/_mobile/market/search?' + querystring.stringify({
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

                /**
                 * Create the authentication request
                 */
                const authenticate = new Request({
                    path: '/_api/authentication/sessions/username',
                    headers: {
                        'Content-Length': '80'
                    },
                    data: {
                        'maxInactiveMinutes':'1440',
                        'password': credentials.password,
                        'username': credentials.username
                    },
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

    on(event, callback) {
        return this._events.on(event, callback);
    }

}