export default class Position {

    constructor(position) {
        this._accountId = position.accountId || '';
        this._acquiredValue = position.acquiredValue || 0;
        this._averageAcquiredPrice = position.averageAcquiredPrice || 0;
        this._profit = position.profit || 0;
        this._profitPercent = position.profitPercent || 0;
        this._value = position.value || 0;
        this._volume = position.volume || 0;
        this._instrumentId = position.orderbookId || ''
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

    get instrumentId() {
        return this._instrumentId;
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