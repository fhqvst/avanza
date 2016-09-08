'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = function () {
    function Socket(options) {
        var _this = this;

        _classCallCheck(this, Socket);

        options = Object.assign({}, {
            url: '',
            subscriptionId: '',
            events: new _events.EventEmitter()
        }, options);

        /**
         * Contains the WebSocket instance.
         * @type {WebSocket}
         * @private
         */
        this._socket = options.socket ? new options.socket() : new _ws2.default(options.url);

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

        this._socket.on('message', function (data, flags) {

            var response = JSON.parse(String.fromCharCode.apply(null, flags.buffer));
            if (response.length && response[0]) {

                var message = response[0];

                if (message.error) {

                    switch (message.error) {

                        default:
                            console.error(message);

                    }
                } else {

                    if (message.channel === '/meta/handshake') {
                        _this._events.emit('handshake', message);
                        _this._clientId = message.clientId;

                        _this._socket.send(JSON.stringify([{
                            advice: {
                                timeout: 0
                            },
                            channel: '/meta/connect',
                            clientId: _this._clientId,
                            connectionType: 'websocket',
                            id: _this._id++
                        }]));
                    } else if (message.channel === '/meta/connect') {
                        _this._events.emit('connect', message);
                    } else if (message.channel === '/meta/subscribe') {
                        _this._events.emit('subscribe', message);
                    } else if (message.channel.indexOf('/quotes/') !== -1) {
                        _this._events.emit('quote', message);
                    }
                }

                _this._events.emit('message', message);
            }
        });

        this._socket.on('open', function () {
            _this._events.emit('open');
        });

        this._socket.on('error', function (e) {
            _this._events.emit('error', e);
        });
    }

    _createClass(Socket, [{
        key: 'on',
        value: function on(event, callback) {
            return this._events.on(event, callback);
        }
    }, {
        key: 'isOpened',


        /**
         * Checks if the socket is currently connected.
         *
         * @returns {boolean}
         */
        value: function isOpened() {
            return this._socket.readyState === this._socket.OPEN;
        }

        /**
         * Opens a connection with the current subscription ID, handshakes and
         * sets a valid client ID if successful.
         */

    }, {
        key: 'initialize',
        value: function initialize() {
            var _this2 = this;

            if (typeof this.subscriptionId === 'undefined') {
                throw new Error('The socket requires a subscription ID to work.');
            }

            if (this._socket.readyState === this._socket.OPEN) {
                this._socket.send(JSON.stringify([{
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
                }]));
            } else {
                this._socket.on('open', function () {
                    _this2.initialize();
                });
            }
        }

        /**
         *
         * @param id
         * @param channels An array of channels. Valid channels are: quotes, orderdepths, trades, brokertradesummary, orders
         * or deals. Defaults to quotes only.
         */

    }, {
        key: 'subscribe',
        value: function subscribe(id) {
            var _this3 = this;

            var channels = arguments.length <= 1 || arguments[1] === undefined ? ['quotes'] : arguments[1];


            if (!this.isOpened()) {
                throw new Error('The socket is not yet initialized. You must initialize() before subscribing to channels.');
            }

            var that = this;
            channels.forEach(function (channel) {

                _this3._socket.send(JSON.stringify([{
                    channel: '/meta/subscribe',
                    clientId: that._clientId,
                    id: that._id++,
                    subscription: '/' + channel + '/' + id
                }]));
            });
        }
    }]);

    return Socket;
}();

exports.default = Socket;