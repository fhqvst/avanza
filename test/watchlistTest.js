import dotenv from 'dotenv';
dotenv.config()

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('watchlist', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a GET request to /_mobile/usercontent/watchlist/', () => {
        return client.getWatchlists().should.not.be.rejected;
    });
    
});