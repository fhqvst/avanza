export default class Orderbook {

    constructor(orderbook) {
        this.instrumentId = orderbook.orderbook.id
        this.orders = [];
        this.trades = [];
        for(let i = 0; i < orderbook.latestTrades.length; i++) {
            const trade = orderbook.latestTrades[i]
            this.trades.push({
                price: trade.price,
                volume: trade.volume,
                time: new Date(trade.dealTime),
                seller: trade.seller || '-',
                buyer: trade.buyer || '-'
            })
        }
    }

}