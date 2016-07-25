import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('account', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a POST request to /_mobile/account/overview/', () => {
        return client.getOverview().should.not.be.rejected;
    });

    it('should successfully perform a POST request to /_mobile/account/dealsandorders/', () => {
        return client.getDealsAndOrders().should.not.be.rejected;
    });

    it('should successfully perform a GET request to /_mobile/market/search/', () => {
        return client.search('telia').should.not.be.rejected;
    });

    it('should successfully perform a GET request to /_mobile/market/search/', () => {
        return client.search('omx', 'equity_linked_bond').should.not.be.rejected;
    });
    
});