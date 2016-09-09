import dotenv from 'dotenv';
dotenv.config()

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Avanza from '../dist';

chai.use(chaiAsPromised);

describe('authentication', function() {

    let client;

    before(function() {
        client = new Avanza();
    });

    it('should return a security token, subscription id and an authentication session when given correct credentials', function() {

        chai.should()

        const authentication = client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
        
        authentication.should.eventually.have.property('securityToken')
        authentication.should.eventually.have.property('authenticationSession')
        authentication.should.eventually.have.property('subscriptionId')

    });

});