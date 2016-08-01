export default class Instrument {

    constructor(instrument) {
        this._id            = instrument.id || ''
        this._marketPlace   = instrument.marketPlace || ''
        this._marketList    = instrument.marketList || ''
        this._currency      = instrument.currency || ''
        this._name          = instrument.name || ''
        this._country       = instrument.country || ''
        this._shortSellable = !!instrument.shortSellable
        this._tradable      = !!instrument.tradable
        this._lastPrice     = instrument.lastPrice || 0
        this._lastPriceUpdated = instrument.lastPriceUpdated ? new Date(instrument.lastPriceUpdated) : new Date('1970-01-01');
        this._changePercent = instrument.changePercent || 0
        this._change        = instrument.change || 0
        this._ticker        = instrument.tickerSymbol || ''
        this._totalVolumeTraded = instrument.totalVolumeTraded || 0
        this._totalValueTraded = instrument.totalValueTraded || 0

        if(instrument.keyRatios) {
            this._volatility    = instrument.keyRatios.volatility ? instrument.keyRatios.volatility : 0
            this._pe    = instrument.keyRatios.priceEarningsRatio || 0
            this._yield = instrument.keyRatios.directYield || 0
        } else {
            this._volatility = this._pe = this._yield = 0
        }
    }

    get id() {
        return this._id;
    }

    get marketPlace() {
        return this._marketPlace;
    }

    get marketList() {
        return this._marketList;
    }

    get name() {
        return this._name;
    }

    get country() {
        return this._country;
    }

    get ticker() {
        return this._ticker;
    }

    get currency() {
        return this._currency;
    }

    set currency(value) {
        this._currency = value;
    }

    get shortSellable() {
        return this._shortSellable;
    }

    set shortSellable(value) {
        this._shortSellable = value;
    }

    get tradable() {
        return this._tradable;
    }

    set tradable(value) {
        this._tradable = value;
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

    get changePercent() {
        return this._changePercent;
    }

    set changePercent(value) {
        this._changePercent = value;
    }

    get change() {
        return this._change;
    }

    set change(value) {
        this._change = value;
    }

    get totalVolumeTraded() {
        return this._totalVolumeTraded;
    }

    set totalVolumeTraded(value) {
        this._totalVolumeTraded = value;
    }

    get totalValueTraded() {
        return this._totalValueTraded;
    }

    set totalValueTraded(value) {
        this._totalValueTraded = value;
    }

    get volatility() {
        return this._volatility;
    }

    set volatility(value) {
        this._volatility = value;
    }

    get pe() {
        return this._pe;
    }

    set pe(value) {
        this._pe = value;
    }

    get yield() {
        return this._yield;
    }

    set yield(value) {
        this._yield = value;
    }
}