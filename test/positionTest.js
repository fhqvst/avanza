import dotenv from 'dotenv';
dotenv.config()

import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);
chai.should();


describe('positions', () => {

    let client;

    before(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should successfully perform a POST request to /_mobile/account/positions/', () => {
        return client.getPositions().should.not.be.rejected;
    });
    
});