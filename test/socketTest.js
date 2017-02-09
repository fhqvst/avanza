import dotenv from 'dotenv';
dotenv.config()

import Avanza from '../dist';

describe('socket', function() {

    this.timeout(120000);
    let client;

    beforeEach(function() {
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

        client.socket.on('quote', data => {
          console.log((new Date).toISOString(), 'Received quote: ', data.lastPrice);
        });

        let successes = 0
        client.socket.on('connect', data => {

          if (data.successful) {
            successes++;
          } else {
            throw new Error('Connection was not successful');
          }

          if (successes === 2) {
            done();
          }

        })

        client.socket.once('connect', data => {
            client.socket.subscribe('5479', ['quotes', 'brokertradesummary']);
        });
        client.socket.initialize();

    });

    it('should successfully subscribe to channels', done => {

        client.socket.once('connect', function() {
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
