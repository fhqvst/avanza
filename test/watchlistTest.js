import dotenv from 'dotenv';
dotenv.config()

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('watchlist', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a GET request to /_mobile/usercontent/watchlist/', function() {
        return client.getWatchlists().should.not.be.rejected;
    });
    
});