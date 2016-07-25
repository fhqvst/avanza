import dotenv from 'dotenv';
dotenv.config()

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('order', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully check the current status of an order', () => {
       return client.checkOrder(process.env.ACCOUNT, process.env.ORDER).should.not.be.rejected;
    });

    it('should successfully place an order', () => {
       return client.placeOrder({
           'price': '90.5',
           'validUntil': '2017-09-25',
           'volume': '30.0',
           'orderbookId': '5269',
           'orderType': 'SELL',
           'accountId': process.env.ACCOUNT
       }).should.not.be.rejected;
    });
    
});