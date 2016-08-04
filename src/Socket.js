import WebSocket from 'ws';
import {EventEmitter} from 'events';

export default class Socket {
    
    constructor(options) {

        options = Object.assign({}, {
            url: '',
            subscriptionId: '',
            events: new EventEmitter()
        }, options);

        let _socket = options.socket ? new options.socket : new WebSocket(options.url);
        let subscriptionId = options.subscriptionId;
        let _events = options.events;

        this._socket = _socket;
        this._events = _events;
        this.subscriptionId = subscriptionId;
        this._id = 1;
        this._subscriptions = [];

        _socket.on('message', (data, flags) => {
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

                        _socket.send(JSON.stringify(
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
                    }

                    else if(message.channel === '/meta/subscribe') {
                        this._events.emit('subscribe', message);
                    }

                    else if(message.channel.indexOf('/quotes/') !== -1) {
                        this._events.emit('quote', message);
                    }

                }

                _events.emit('message', message);

            }
        });

        _socket.on('open', () => {
            _events.emit('open');
        });

        _socket.on('error', e => {
            _events.emit('error', e);
        });

    }
    
    on(event, callback) {
        return this._events.on(event, callback);
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

        // channels = ['quotes', 'orderdepths', 'trades', 'brokertradesummary', 'orders', 'deals']

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