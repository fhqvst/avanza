import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Position from '../dist/Position';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('orderbooks', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a request to /_mobile/order/', () => {
        return client.getOrderbook('5479', 'stock').should.not.be.rejected;
    });
    
});