import https from 'https';
export default class Request {

    constructor(options) {
        return new Promise((resolve, reject) => {

            const request = https.request({
                host: options.host || 'www.avanza.se',
                port: options.port || 443,
                path: options.path || '/_mobile/account/positions?sort=changeAsc',
                method: options.method || 'POST',
                headers: Object.assign({}, {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)'
                }, options.headers)
            }, response => {

                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('The request returned an error: ' + response.statusCode + ' ' + response.statusMessage));
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