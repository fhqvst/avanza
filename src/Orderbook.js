export default class Orderbook {

    constructor(orderbook) {
        this._instrumentId = orderbook.orderbook.id
        this._orders = [];
        this._trades = [];
        for(let i = 0; i < orderbook.latestTrades.length; i++) {
            const trade = orderbook.latestTrades[i]
            this._trades.push({
                price: trade.price,
                volume: trade.volume,
                time: new Date(trade.dealTime),
                seller: trade.seller || '-',
                buyer: trade.buyer || '-'
            })
        }
    }

    get instrumentId() {
        return this._instrumentId;
    }

    get trades() {
        return this._trades;
    }

    set trades(value) {
        this._trades = value;
    }

    get orders() {
        return this._orders;
    }

    set orders(value) {
        this._orders = value;
    }

}