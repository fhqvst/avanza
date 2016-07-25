export default class Position {

    constructor(position) {
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

    get accountId() {
        return this._accountId;
    }

    get acquiredValue() {
        return this._acquiredValue;
    }

    set acquiredValue(value) {
        this._acquiredValue = value;
    }

    get averageAcquiredPrice() {
        return this._averageAcquiredPrice;
    }

    set averageAcquiredPrice(value) {
        this._averageAcquiredPrice = value;
    }

    get change() {
        return this._change;
    }

    set change(value) {
        this._change = value;
    }

    get changePercent() {
        return this._changePercent;
    }

    set changePercent(value) {
        this._changePercent = value;
    }

    get currency() {
        return this._currency;
    }

    get flagCode() {
        return this._flagCode;
    }

    get lastPrice() {
        return this._lastPrice;
    }

    set lastPrice(value) {
        this._lastPrice = value;
    }

    get lastPriceUpdated() {
        return this._lastPriceUpdated;
    }

    set lastPriceUpdated(value) {
        this._lastPriceUpdated = value;
    }

    get name() {
        return this._name;
    }

    get orderbookId() {
        return this._orderbookId;
    }

    get profit() {
        return this._profit;
    }

    set profit(value) {
        this._profit = value;
    }

    get profitPercent() {
        return this._profitPercent;
    }

    set profitPercent(value) {
        this._profitPercent = value;
    }

    get tradable() {
        return this._tradable;
    }

    set tradable(value) {
        this._tradable = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get volume() {
        return this._volume;
    }

    set volume(value) {
        this._volume = value;
    }
}