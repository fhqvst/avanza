# Avanza

A Node.js wrapper for the unofficial Avanza API. Please note that this is only a proof of concept, hence not meant to be used by anyone.

## Installation

Install via [npm](https://www.npmjs.com/package/avanza)
```bash
$ npm install avanza
```
## Documentation

Please see [API.md](API.md).

## Example

Authenticate and fetch currently held positions:

```javascript
let Avanza = require('avanza')
const avanza = new Avanza()

avanza.authenticate({
    username: 'draghimario',
    password: 'cashisking1337'
}).then(async () => {

   const positions = await avanza.getPositions()
   console.log(positions)

})
```
## Documentation

Please see [API.md]

## Tests

Create a `.env` file to run the tests.

```bash
# .env
USERNAME=my_username
PASSWORD=my_password
ACCOUNT=12345       # your valid account id
ORDER=12345         # the id of an order *from today* belonging to the specified account
```

And then:

```bash
$ npm test
```

NOTE: No tests will run without an `.env` file and, as surprising as it may seem, the values in it must be valid.

## LICENSE

MIT license. See the LICENSE file for details.

## RESPONSIBILITIES

The author of this software is not responsible for any indirect damages (foreseeable or unforeseeable), such as, if necessary, loss or alteration of or fraudulent access to data, accidental transmission of viruses or of any other harmful element, loss of profits or opportunities, the cost of replacement goods and services or the attitude and behavior of a third party.
