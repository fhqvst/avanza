import dotenv from 'dotenv';
dotenv.config()

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist/Avanza';

chai.use(chaiAsPromised);
chai.should();


describe('positions', () => {

    let client;

    beforeEach(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should return all current positions for the authenticated user', () => {
        return client.getPositions().should.not.be.rejected;
    });

});