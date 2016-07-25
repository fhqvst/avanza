import dotenv from 'dotenv';
dotenv.config()

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('instruments', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully fetch instrument details when given a valid instrument id', () => {
        return client.getStock('5479').should.not.be.rejected;
    });

});