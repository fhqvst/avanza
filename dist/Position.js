'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Position = function () {
    function Position(position) {
        _classCallCheck(this, Position);

        this._accountId = position.accountId || '';
        this._acquiredValue = position.acquiredValue || 0;
        this._averageAcquiredPrice = position.averageAcquiredPrice || 0;
        this._change = position.change || 0;
        this._changePercent = position.changePercent || 0;
        this._currency = position.currency || '';
        this._flagCode = position.flagCode || '';
        this._lastPrice = position.lastPrice || 0;
        this._lastPriceUpdated = position.lastPriceUpdated ? new Date(position.lastPriceUpdated) : new Date('1970-01-01');
        this._name = position.name || '';
        this._orderbookId = position.orderbookId || '';
        this._profit = position.profit || 0;
        this._profitPercent = position.profitPercent || 0;
        this._tradable = !!position.tradable;
        this._value = position.value || 0;
        this._volume = position.volume || 0;
    }

    _createClass(Position, [{
        key: 'accountId',
        get: function get() {
            return this._accountId;
        }
    }, {
        key: 'acquiredValue',
        get: function get() {
            return this._acquiredValue;
        },
        set: function set(value) {
            this._acquiredValue = value;
        }
    }, {
        key: 'averageAcquiredPrice',
        get: function get() {
            return this._averageAcquiredPrice;
        },
        set: function set(value) {
            this._averageAcquiredPrice = value;
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
        key: 'changePercent',
        get: function get() {
            return this._changePercent;
        },
        set: function set(value) {
            this._changePercent = value;
        }
    }, {
        key: 'currency',
        get: function get() {
            return this._currency;
        }
    }, {
        key: 'flagCode',
        get: function get() {
            return this._flagCode;
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
        key: 'name',
        get: function get() {
            return this._name;
        }
    }, {
        key: 'orderbookId',
        get: function get() {
            return this._orderbookId;
        }
    }, {
        key: 'profit',
        get: function get() {
            return this._profit;
        },
        set: function set(value) {
            this._profit = value;
        }
    }, {
        key: 'profitPercent',
        get: function get() {
            return this._profitPercent;
        },
        set: function set(value) {
            this._profitPercent = value;
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
        key: 'value',
        get: function get() {
            return this._value;
        },
        set: function set(value) {
            this._value = value;
        }
    }, {
        key: 'volume',
        get: function get() {
            return this._volume;
        },
        set: function set(value) {
            this._volume = value;
        }
    }]);

    return Position;
}();

exports.default = Position;