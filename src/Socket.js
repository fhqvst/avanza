import WebSocket from 'ws';
import {EventEmitter} from 'events';

export default class Socket {

    constructor(options) {

        options = Object.assign({}, {
            url: '',
            subscriptionId: '',
            events: new EventEmitter()
        }, options);

        /**
         * Contains the WebSocket instance.
         * @type {WebSocket}
         * @private
         */
        this._socket = options.socket ? new options.socket : new WebSocket(options.url);

        /**
         * Contains the EventEmitter instance.
         * @type {EventEmitter}
         * @private
         */
        this._events = options.events;

        /**
         * The id of the current message.
         * @type {number}
         * @private
         */
        this._id = 1;

        /**
         * The subscriptionId received when authenticating.
         * @type {string}
         */
        this.subscriptionId = options.subscriptionId;

        /**
         * Might be used in the future to make sure we don't subscribe to the same resource more than once.
         * @type {Array}
         * @private
         */
        this._subscriptions = [];

        this._socket.on('message', (data, flags) => {

            let response = JSON.parse(String.fromCharCode.apply(null, flags.buffer));
            if (response.length && response[0]) {

                const message = response[0];

                if(message.error) {

                    switch(message.error) {

                        default:
                            console.error(message);

                    }

                } else {

                    if(message.channel === '/meta/handshake') {
                        this._events.emit('handshake', message);
                        this._clientId = message.clientId;

                        this._socket.send(JSON.stringify(
                            [{
                                advice: {
                                    timeout: 0
                                },
                                channel: '/meta/connect',
                                clientId: this._clientId,
                                connectionType: 'websocket',
                                id: this._id++
                            }]
                        ));

                    }

                    else if(message.channel === '/meta/connect') {
                        this._events.emit('connect', message);
                        const that = this
                        setTimeout(() => {
                          that._socket.send(JSON.stringify(
                              [{
                                  channel: '/meta/connect',
                                  clientId: that._clientId,
                                  connectionType: 'websocket',
                                  id: that._id++
                              }]
                          ));
                        }, 100)
                    }

                    else if(message.channel === '/meta/subscribe') {
                        this._events.emit('subscribe', message);
                    }

                    else if(message.channel.indexOf('/quotes/') !== -1) {
                        const data = message.data
                        this._events.emit('quotes', {
                            change: data.change,
                            changePercent: data.changePercent,
                            closingPrice: data.closingPrice,
                            highestPrice: data.highestPrice,
                            lastPrice: data.lastPrice,
                            lastUpdated: data.lastUpdated,
                            lowestPrice: data.lowestPrice,
                            instrumentId: data.orderbookId,
                            totalValueTraded: data.totalValueTraded,
                            totalVolumeTraded: data.totalVolumeTraded,
                            updated: data.updated
                        });
                    }

                    else if(message.channel.indexOf('/trades/') !== -1) {
                        const data = message.data
                        this._events.emit('trades', {
                            buyer: {
                                ticker: data.buyer,
                                name: data.buyerName
                            },
                            seller: {
                                ticker: data.seller,
                                name: data.sellerName
                            },
                            cancelled: data.cancelled,
                            dealTime: data.dealTime,
                            matchedOnMarket: data.matchedOnMarket,
                            instrumentId: data.orderbookId,
                            price: data.price,
                            volume: data.volume,
                            volumeWeightedAveragePrice: data.volumeWeightedAveragePrice
                        })
                    }

                    else if(message.channel.indexOf('/orderdepths/') !== -1) {
                        const data = message.data
                        this._events.emit('orderdepths', {
                            levels: data.levels.map(level => ({
                                buy: level.buySide,
                                sell: level.sellSide
                            })),
                            total: {
                                buy: data.totalLevel.buySide,
                                sell: data.totalLevel.sellSide,
                            }
                        });
                    }

                    else if(message.channel.indexOf('/brokertradesummary/') !== -1) {
                        const data = message.data
                        this._events.emit('brokertradesummary', data.brokerTradeSummaries.map(broker => ({
                                broker: {
                                    ticker: broker.brokerCode,
                                    name: broker.brokerName
                                },
                                buyVolume: broker.buyVolume,
                                buyVolumeWeightedAveragePrice: broker.buyVolumeWeightedAveragePrice,
                                netVolume: broker.netBuyVolume,
                                sellVolume: broker.sellVolume,
                                sellVolumeWeightedAveragePrice: broker.sellVolumeWeightedAveragePrice
                            })
                        ));
                    }



                }

                this._events.emit('message', message);

            }
        });

        this._socket.on('open', () => {
            this._events.emit('open');
        });

        this._socket.on('error', e => {
            this._events.emit('error', e);
        });

    }

    on(event, callback) {
        return this._events.on(event, callback);
    };

    once(event, callback) {
        return this._events.once(event, callback);
    };

    /**
     * Checks if the socket is currently connected.
     *
     * @returns {boolean}
     */
    isOpened() {
        return this._socket.readyState === this._socket.OPEN;
    }

    /**
     * Opens a connection with the current subscription ID, handshakes and
     * sets a valid client ID if successful.
     */
    initialize() {

        if(typeof this.subscriptionId === 'undefined') {
            throw new Error('The socket requires a subscription ID to work.')
        }

        if(this._socket.readyState === this._socket.OPEN) {
            this._socket.send(JSON.stringify([
                {
                    advice: {
                        timeout: 60000,
                        interval: 0
                    },
                    channel: '/meta/handshake',
                    ext: {
                        subscriptionId: this.subscriptionId
                    },
                    id: this._id++,
                    minimumVersion: '1.0',
                    supportedConnectionTypes: ['websocket', 'long-polling', 'callback-polling'],
                    version: '1.0'
                }])
            );
        } else {
            this._socket.on('open', () => {
                this.initialize();
            });
        }

    }

    /**
     *
     * @param id
     * @param channels An array of channels. Valid channels are: quotes, orderdepths, trades, brokertradesummary, orders
     * or deals. Defaults to quotes only.
     */
    subscribe(id, channels = ['quotes']) {

        if(!this.isOpened()) {
            throw new Error('The socket is not yet initialized. You must initialize() before subscribing to channels.');
        }

        let that = this;
        channels.forEach((channel) => {

            this._socket.send(JSON.stringify([
                {
                    channel: '/meta/subscribe',
                    clientId: that._clientId,
                    id: that._id++,
                    subscription: '/' + channel + '/' + id
                }])
            );

        });

    }

}
