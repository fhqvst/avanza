export default class Position {

    constructor(position) {
        this.accountId = position.accountId || '';
        this.acquiredValue = position.acquiredValue || 0;
        this.averageAcquiredPrice = position.averageAcquiredPrice || 0;
        this.profit = position.profit || 0;
        this.profitPercent = position.profitPercent || 0;
        this.value = position.value || 0;
        this.volume = position.volume || 0;
        this.instrumentId = position.orderbookId || '';
    }

}