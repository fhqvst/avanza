export default class Instrument {

    constructor(instrument) {
        this.id            = instrument.id || ''
        this.marketPlace   = instrument.marketPlace || ''
        this.marketList    = instrument.marketList || ''
        this.currency      = instrument.currency || ''
        this.name          = instrument.name || ''
        this.country       = instrument.country || ''
        this.shortSellable = !!instrument.shortSellable
        this.tradable      = !!instrument.tradable
        this.lastPrice     = instrument.lastPrice || 0
        this.lastPriceUpdated = instrument.lastPriceUpdated ? new Date(instrument.lastPriceUpdated) : new Date('1970-01-01');
        this.changePercent = instrument.changePercent || 0
        this.change        = instrument.change || 0
        this.ticker        = instrument.tickerSymbol || ''
        this.totalVolumeTraded = instrument.totalVolumeTraded || 0
        this.totalValueTraded = instrument.totalValueTraded || 0
        this.numberOfOwners = instrument.numberOfOwners || 0
        this.company = instrument.company ? {
            marketCapital: instrument.company.marketCapital,
            chairman: instrument.company.chairman,
            description: instrument.company.description,
            name: instrument.company.name,
            ceo: instrument.company.CEO
        } : null;

        if(instrument.keyRatios) {
            this.volatility    = instrument.keyRatios.volatility ? instrument.keyRatios.volatility : 0
            this.pe    = instrument.keyRatios.priceEarningsRatio || 0
            this.yield = instrument.keyRatios.directYield || 0
        } else {
            this.volatility = this.pe = this.yield = 0
        }
    }
}