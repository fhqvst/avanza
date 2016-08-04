'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Orderbook = function Orderbook(orderbook) {
    _classCallCheck(this, Orderbook);

    this.instrumentId = orderbook.orderbook.id;
    this.orders = [];
    this.trades = [];
    for (var i = 0; i < orderbook.latestTrades.length; i++) {
        var trade = orderbook.latestTrades[i];
        this.trades.push({
            price: trade.price,
            volume: trade.volume,
            time: new Date(trade.dealTime),
            seller: trade.seller || '-',
            buyer: trade.buyer || '-'
        });
    }
};

exports.default = Orderbook;