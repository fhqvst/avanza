import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

import {
    HIGHEST_RATED_FUNDS,
    LOWEST_FEE_INDEX_FUNDS,
    MOST_OWNED_FUNDS,
    BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS
} from '../dist/constants'

chai.use(chaiAsPromised);
chai.should();


describe.only('transactions', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully fetch recent transactions for an account', function() {
        return client.getTransactions(process.env.ACCOUNT).should.not.be.rejected;
    });

    it('should successfully fetch a list of the funds with the lowest fee', function() {
        return client.getTransactions(process.env.ACCOUNT, {
            from: '2014-10-29',
            to: '2016-10-29',
            minAmount: '10',
            maxAmount: '100',
            orderbookId: '106733,5276'
        }).should.not.be.rejected;
    });

});