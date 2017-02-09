import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

import {
    STOCK
} from '../dist/constants'

chai.use(chaiAsPromised);
chai.should();


describe('orderbooks', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully fetch an orderbook', function() {
        return client.getOrderbook('5479', STOCK).should.not.be.rejected;
    });

    it('should successfully fetch list of orderbooks', function() {
        return client.getOrderbooks(['5479', '106733']).should.not.be.rejected;
    });

});
