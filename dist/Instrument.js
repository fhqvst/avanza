'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instrument = function () {
    function Instrument(instrument) {
        _classCallCheck(this, Instrument);

        this._id = instrument.id || '';
        this._marketPlace = instrument.marketPlace || '';
        this._marketList = instrument.marketList || '';
        this._currency = instrument.currency || '';
        this._name = instrument.name || '';
        this._country = instrument.country || '';
        this._shortSellable = !!instrument.shortSellable;
        this._tradable = !!instrument.tradable;
        this._lastPrice = instrument.lastPrice || 0;
        this._lastPriceUpdated = instrument.lastPriceUpdated ? new Date(instrument.lastPriceUpdated) : new Date('1970-01-01');
        this._changePercent = instrument.changePercent || 0;
        this._change = instrument.change || 0;
        this._ticker = instrument.tickerSymbol || '';
        this._totalVolumeTraded = instrument.totalVolumeTraded || 0;
        this._totalValueTraded = instrument.totalValueTraded || 0;
        this._volatility = instrument.keyRatios.volatility || 0;
        this._pe = instrument.keyRatios.priceEarningsRatio || 0;
        this._yield = instrument.keyRatios.directYield || 0;
    }

    _createClass(Instrument, [{
        key: 'id',
        get: function get() {
            return this._id;
        }
    }, {
        key: 'marketPlace',
        get: function get() {
            return this._marketPlace;
        }
    }, {
        key: 'marketList',
        get: function get() {
            return this._marketList;
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        }
    }, {
        key: 'country',
        get: function get() {
            return this._country;
        }
    }, {
        key: 'ticker',
        get: function get() {
            return this._ticker;
        }
    }, {
        key: 'currency',
        get: function get() {
            return this._currency;
        },
        set: function set(value) {
            this._currency = value;
        }
    }, {
        key: 'shortSellable',
        get: function get() {
            return this._shortSellable;
        },
        set: function set(value) {
            this._shortSellable = value;
        }
    }, {
        key: 'tradable',
        get: function get() {
            return this._tradable;
        },
        set: function set(value) {
            this._tradable = value;
        }
    }, {
        key: 'lastPrice',
        get: function get() {
            return this._lastPrice;
        },
        set: function set(value) {
            this._lastPrice = value;
        }
    }, {
        key: 'lastPriceUpdated',
        get: function get() {
            return this._lastPriceUpdated;
        },
        set: function set(value) {
            this._lastPriceUpdated = value;
        }
    }, {
        key: 'changePercent',
        get: function get() {
            return this._changePercent;
        },
        set: function set(value) {
            this._changePercent = value;
        }
    }, {
        key: 'change',
        get: function get() {
            return this._change;
        },
        set: function set(value) {
            this._change = value;
        }
    }, {
        key: 'totalVolumeTraded',
        get: function get() {
            return this._totalVolumeTraded;
        },
        set: function set(value) {
            this._totalVolumeTraded = value;
        }
    }, {
        key: 'totalValueTraded',
        get: function get() {
            return this._totalValueTraded;
        },
        set: function set(value) {
            this._totalValueTraded = value;
        }
    }, {
        key: 'volatility',
        get: function get() {
            return this._volatility;
        },
        set: function set(value) {
            this._volatility = value;
        }
    }, {
        key: 'pe',
        get: function get() {
            return this._pe;
        },
        set: function set(value) {
            this._pe = value;
        }
    }, {
        key: 'yield',
        get: function get() {
            return this._yield;
        },
        set: function set(value) {
            this._yield = value;
        }
    }]);

    return Instrument;
}();

exports.default = Instrument;