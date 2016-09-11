import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

import {
    STOCK,
    FUND,
    INDEX,
    ABOVE_OR_EQUAL,
    EMAIL,
    PUSH_NOTIFICATION
} from '../dist/constants'

chai.use(chaiAsPromised);
chai.should();


describe('notifications', function() {

    let client;

    before(function() {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully create a notification', function() {

        const payload = {
            accountId: process.env.ACCOUNT,
            expirationDate: '2075-01-02',
            messageTypes: [EMAIL, PUSH_NOTIFICATION],
            instrumentId: '5534', // AQ Group
            price: '192.50',
            logic: ABOVE_OR_EQUAL
        }

        return client.createNotification(payload).should.not.be.rejected

    })

    // @todo it('should successfully delete a notification')

});