const querystring = require('querystring');
const https = require('https');

import Request from './Request';

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

    getPositions() {

        let that = this;
        return new Request({
            path: '/_mobile/account/positions?sort=changeAsc',
            headers: {
                'X-AuthenticationSession': that.getAuthenticationSession(),
                'X-SecurityToken': that.getSecurityToken()
            }
        });

    }

    getInstrument(id) {

        let that = this;
        return new Request({
            path: '/_mobile/market/stock/' + id,
            headers: {
                'X-AuthenticationSession': that.getAuthenticationSession(),
                'X-SecurityToken': that.getSecurityToken()
            }
        });
    }

    authenticate(credentials) {

        let that = this;

        return new Promise((resolve, reject) => {

            let securityToken;

            /**
             * Create the authentication request
             */
            const authenticate = new Request({
                path: '/_api/authentication/sessions/username',
                headers: {
                    'Content-Length': '80'
                },
                data: {
                    'maxInactiveMinutes':'1440',
                    'password': credentials.password,
                    'username': credentials.username
                },
                onEnd: response => {

                    /**
                     * Parse the securitytoken from the headers of the responsee
                     */
                    securityToken = response.headers['x-securitytoken'];

                }
            });

            authenticate.then(response => {
                that.isAuthenticated = true;
                that.setSecurityToken(securityToken);
                that.setAuthenticationSession(response.authenticationSession);

                resolve({
                    securityToken: securityToken,
                    authenticationSession: response.authenticationSession
                });

            }).catch(e => reject(e));

        });

    }

}