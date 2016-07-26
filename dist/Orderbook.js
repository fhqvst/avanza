'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Orderbook = function () {
    function Orderbook(orderbook) {
        _classCallCheck(this, Orderbook);

        this._instrumentId = orderbook.orderbook.id;
        this._orders = [];
        this._trades = [];
        for (var i = 0; i < orderbook.latestTrades.length; i++) {
            var trade = orderbook.latestTrades[i];
            this._trades.push({
                price: trade.price,
                volume: trade.volume,
                time: new Date(trade.dealTime),
                seller: trade.seller || '-',
                buyer: trade.buyer || '-'
            });
        }
    }

    _createClass(Orderbook, [{
        key: 'instrumentId',
        get: function get() {
            return this._instrumentId;
        }
    }, {
        key: 'trades',
        get: function get() {
            return this._trades;
        },
        set: function set(value) {
            this._trades = value;
        }
    }, {
        key: 'orders',
        get: function get() {
            return this._orders;
        },
        set: function set(value) {
            this._orders = value;
        }
    }]);

    return Orderbook;
}();

exports.default = Orderbook;