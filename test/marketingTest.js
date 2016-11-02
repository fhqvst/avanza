import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

import {
    HIGHEST_RATED_FUNDS,
    LOWEST_FEE_INDEX_FUNDS,
    MOST_OWNED_FUNDS,
    BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS,
    MOST_OWNED_STOCKS,
    LOWEST_PE_STOCKS,
    HIGHEST_YIELD_STOCKS
} from '../dist/constants'

chai.use(chaiAsPromised);
chai.should();


describe('marketing', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully fetch all types of inspiration lists', function() {
        return client.getInspirationList(HIGHEST_RATED_FUNDS).should.not.be.rejected;
    });

    it('should successfully fetch a list of the funds with the lowest fee', function() {
        return client.getInspirationList(LOWEST_FEE_INDEX_FUNDS).should.not.be.rejected;
    });

    it('should successfully fetch a list of the funds with the most owners', function() {
        return client.getInspirationList(MOST_OWNED_FUNDS).should.not.be.rejected;
    });

    it('should successfully fetch a list of the funds with best development in the last three months', function() {
        return client.getInspirationList(BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS).should.not.be.rejected;
    });

});