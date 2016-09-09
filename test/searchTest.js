import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

import {
    STOCK, FUND, INDEX
} from '../dist/constants'

chai.use(chaiAsPromised);
chai.should();


describe.only('search', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a general search', function() {
        return client.search('avanza').should.not.be.rejected
    });

    it('should successfully perform a stock search', function() {
        return client.search('tel', STOCK).should.not.be.rejected
    });

    it('should successfully perform a fund search', function() {
        return client.search('zer', FUND).should.not.be.rejected
    });

    it('should successfully perform an index search', function() {
        return client.search('OMX', INDEX).should.not.be.rejected
    });
    
});