import https from 'https';

import {
    BASE_URL,
    PORT,
    USER_AGENT
} from './constants'

export default class Request {

    constructor(options) {
        return new Promise((resolve, reject) => {

            const request = https.request({
                host: options.host || BASE_URL,
                port: options.port || PORT,
                path: options.path || '',
                method: options.method || 'POST',
                headers: Object.assign({}, {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                    'User-Agent': USER_AGENT
                }, options.headers)
            }, response => {

                if (response.statusCode < 200 || response.statusCode > 299) {
                    return reject(new Error('The request returned an error: ' + response.statusCode + ' ' + response.statusMessage));
                }

                let body = [];
                response.on('data', chunk => body.push(chunk));
                response.on('end', () => {
                    if(options.onEnd) {
                        options.onEnd(response);
                    }
                    resolve(JSON.parse(body.join('')));
                });

            });

            if(options.data) {
                request.write(JSON.stringify(options.data));
            }

            request.end();
            request.on('error', e => reject(e))

        });
    }

}