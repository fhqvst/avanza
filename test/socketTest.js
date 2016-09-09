import dotenv from 'dotenv';
dotenv.config()

import Avanza from '../dist';

describe.only('socket', () => {

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

    it('should successfully subscribe to channels', done => {

        client.socket.on('connect', () => {
            client.socket.subscribe('5479', [
                'quotes', 'orderdepths', 'trades', 'brokertradesummary', 'orders', 'deals'
            ]);
        });

        let subscriptions = 0;
        client.socket.on('subscribe', data => {
            if(data.successful) {
                subscriptions++;
            }

            if(subscriptions === 6) {
                done()
            }

        });
        
        client.socket.initialize();

    });
    
});