# Avanza [![Build Status](https://travis-ci.com/fhqvst/avanza.svg?branch=master)](https://travis-ci.com/fhqvst/avanza)

A Node.js wrapper for the unofficial Avanza API. Please note that this is only a proof of concept, hence not meant to be used by anyone.

It might also be valuable to note that I am not affiliated with Avanza Bank AB in any way. The underlying API can be taken down or changed without warning at any point in time.

## Algorithmic Trading

If you're interested in algorithmic trading, you should definitely check out [DevAlpha](https://devalpha.io)!

## Installation

Install via [npm](https://www.npmjs.com/package/avanza)
```bash
$ npm install avanza
```
## Documentation

Refer to [API.md](./API.md).

## Getting a TOTP Secret

**NOTE: Since May 2018 two-factor authentication is used to log in.**

Here are the steps to get your TOTP Secret:

0. Go to Mina Sidor > Profil > Sajtinställningar > Tvåfaktorsinloggning and click "Återaktivera". (*Only do this step if you have already set up two-factor auth.*)
1. Click "Aktivera" on the next screen.
2. Select "Annan app för tvåfaktorsinloggning".
3. Click "Kan du inte scanna QR-koden?" to reveal your TOTP Secret.
5. Finally, run `node -e "console.log(require('avanza/dist/totp')('PASTE_YOUR_TOTP_SECRET_HERE'))"` to generate an initial code.
6. Done! From now on all you have to do is supply your secret in the `authenticate()` function as in the example below.

## Example

Authenticate and fetch currently held positions:

```javascript
import Avanza from 'avanza'
const avanza = new Avanza()

avanza.authenticate({
  username: 'MY_USERNAME',
  password: 'MY_PASSWORD',
  totpSecret: 'MY_TOTP_SECRET'
}).then(async () => {
  const positions = await avanza.getPositions()
  console.log(positions)
})
```

Authenticate and subscribe to real-time data:

```javascript
import Avanza from 'avanza'
const avanza = new Avanza()

avanza.authenticate({
  username: 'USERNAME',
  password: 'PASSWORD',
  totpSecret: 'MY_TOTP_SECRET'
}).then(() => {
  avanza.subscribe(Avanza.QUOTES, '5479', (quote) => {
    console.log('Received quote:', quote)
  })
})
```
## Documentation

Refer to [API.md](API.md).

## Tests

Tests will not run without an `.env` file. Use the `.env-example` as reference.

```bash
$ npm test
```
## LICENSE

MIT license. See the LICENSE file for details.

## RESPONSIBILITIES

The author of this software is not responsible for any indirect damages (foreseeable or unforeseeable), such as, if necessary, loss or alteration of or fraudulent access to data, accidental transmission of viruses or of any other harmful element, loss of profits or opportunities, the cost of replacement goods and services or the attitude and behavior of a third party.
