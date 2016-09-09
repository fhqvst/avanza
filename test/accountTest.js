import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();

describe('account', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a POST request to /_mobile/account/overview/', function() {
        return client.getOverview().should.not.be.rejected;
    });

    it('should successfully perform a POST request to /_mobile/account/dealsandorders/', function() {
        return client.getDealsAndOrders().should.not.be.rejected;
    });
    
});