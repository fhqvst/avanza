const querystring = require('querystring');
const https = require('https');

export default class {

    constructor() {
        this.isAuthenticated = false;
    }

    setSecurityToken(securityToken) {
        this.securityToken = securityToken;
    }

    setAuthenticationSession(authenticationSession) {
        this.authenticationSession = authenticationSession;
    }

    getSecurityToken() {
        return this.securityToken;
    }

    getAuthenticationSession() {
        return this.authenticationSession;
    }

    request(url, data, headers) {

        return new Promise((resolve, reject) => {

            let options = {
                host: 'www.avanza.se',
                port: 443,
                path: url,
                json: true,
                method: 'POST',
                headers: Object.assign({}, {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                    'Content-Length': '80',
                    'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)'
                }, headers)
            };

            let request = https.request(options, response => {

                if(options.json) {

                    const body = [];
                    response.on('data', (chunk) => body.push(chunk));
                    response.on('end', () => {
                        resolve({
                            headers: response.headers,
                            body: JSON.parse(body.join(''))
                        });
                    });

                } else {
                    resolve(response);
                }

            });

            request.write(data);
            request.end();
            request.on('error', function(e) {
                console.log(e);
            });

        });
    }

    getPositions() {

        let that = this;
        return new Promise((resolve, reject) => {
            if(this.isAuthenticated) {
                
                const request = https.request({
                    host: 'www.avanza.se',
                    port: 443,
                    path: '/_mobile/account/positions?sort=changeAsc',
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)',
                        'X-AuthenticationSession': that.getAuthenticationSession(),
                        'X-SecurityToken': that.getSecurityToken()
                    }}, (response) => {

                    if (response.statusCode < 200 || response.statusCode > 299) {
                        reject(new Error('Failed to load page, status code: ' + response.statusCode));
                    }

                    let body = [];
                    response.on('data', chunk => body.push(chunk));
                    response.on('end', () => {
                        resolve(JSON.parse(body.join('')));
                    });
                });

                request.end();
                request.on('error', (err) => reject(err))


            } else {
                reject(new Error('Not authenticated.'));
            }
        })

    }

    getInstrument(instrumentId) {

        return this.login().then(data => {

            return new Promise((resolve, reject) => {

                const request = https.request({
                    host: 'www.avanza.se',
                    port: 443,
                    path: '/_mobile/market/stock/' + instrumentId,
                    method: 'POST',
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json',
                        'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)',
                        'X-AuthenticationSession': data.authenticationSession,
                        'X-SecurityToken': data.securityToken
                    }}, (response) => {

                    if (response.statusCode < 200 || response.statusCode > 299) {
                        reject(new Error('Failed to load page, status code: ' + response.statusCode));
                    }

                    const body = [];
                    response.on('data', (chunk) => body.push(chunk));
                    response.on('end', () => {
                        resolve(JSON.parse(body.join('')));
                    });
                });

                request.end();
                request.on('error', (err) => reject(err))

            });

        });

    }

    authenticate(credentials) {

        let that = this;
        return new Promise((resolve, reject) => {

            const request = https.request({
                host: 'www.avanza.se',
                port: 443,
                path: '/_api/authentication/sessions/username',
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                    'Content-Length': '80',
                    'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)'
                }}, (response) => {

                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }

                let body = [];
                response.on('data', (chunk) => body.push(chunk));
                response.on('end', () => {

                    const data = JSON.parse(body.join(''));
                    data.securityToken = response.headers['x-securitytoken'];

                    that.isAuthenticated = true;
                    that.setSecurityToken(data.securityToken);
                    that.setAuthenticationSession(data.authenticationSession);

                    resolve({
                        securityToken: data.securityToken,
                        authenticationSession: data.authenticationSession
                    })

                });
            });

            request.write(JSON.stringify({
                'maxInactiveMinutes':'1440',
                'password': credentials.password,
                'username': credentials.username
            }));

            request.end();
            request.on('error', e => reject(new Error(e)));

        });

    }

}