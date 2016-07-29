import dotenv from 'dotenv';
dotenv.config()

import Avanza from '../dist';

describe('socket', () => {

    let client;

    beforeEach(() => {
        client = new Avanza();
        return client.authenticate({
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        })
    });

    it('should do a successful handshake with the connection', done => {

        client.socket.on('handshake', data => {
            done();
        });
        client.socket.initialize();

    });

    it('should successfully connect', done => {

        client.socket.on('connect', data => {
            done();
        });
        client.socket.initialize();

    });

    it('should successfully subscribe to a channel', done => {

        client.socket.on('connect', () => {
            client.socket.subscribe('5479');
        });

        client.socket.on('subscribe', data => {
            done();
        });
        
        client.socket.initialize();

    });
    
    
    
});