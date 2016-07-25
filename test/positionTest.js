import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Position from '../dist/Position';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('positions', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should format position updated dates correctly', done => {

        const position = new Position({
            accountName: '1234567',
            accountType: 'Investeringssparkonto',
            depositable: true,
            accountId: '1234567',
            value: 7631.23,
            volume: 7,
            profit: -110.04,
            profitPercent: -1.42,
            acquiredValue: 7741.26584,
            averageAcquiredPrice: 1105.89512,
            currency: 'DKK',
            name: 'Pandora',
            orderbookId: '251370',
            tradable: true,
            changePercent: -4.74,
            lastPrice: 853.5,
            flagCode: 'DK',
            lastPriceUpdated: '2016-07-25T13:45:03.000+0000',
            change: -42.5
        });

        expect(position.lastPriceUpdated.getTime()).to.equal(1469454303000);
        done();

    });

    it('should successfully perform a POST request to /_mobile/account/positions/', () => {
        return client.getPositions().should.not.be.rejected;
    });
    
});