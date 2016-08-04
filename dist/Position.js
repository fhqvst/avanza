'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Position = function Position(position) {
    _classCallCheck(this, Position);

    this.accountId = position.accountId || '';
    this.acquiredValue = position.acquiredValue || 0;
    this.averageAcquiredPrice = position.averageAcquiredPrice || 0;
    this.profit = position.profit || 0;
    this.profitPercent = position.profitPercent || 0;
    this.value = position.value || 0;
    this.volume = position.volume || 0;
    this.instrumentId = position.orderbookId || '';
};

exports.default = Position;