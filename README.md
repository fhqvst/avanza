# Avanza

A Node.js wrapper for the unofficial Avanza API. Please note that this is only a proof of concept, hence not meant to be used by anyone.

It might also be valuable to note that I am not affiliated with Avanza Bank AB in any way. The underlying API can be taken down or changed without warning at any point in time.

## Installation

Install via [npm](https://www.npmjs.com/package/avanza)
```bash
$ npm install avanza
```
## Documentation

Refer to [API.md](./API.md).

## Example

Authenticate and fetch currently held positions:

```javascript
import Avanza from 'avanza'
const avanza = new Avanza()

avanza.authenticate({
  username: 'USERNAME',
  password: 'PASSWORD'
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
  password: 'PASSWORD'
}).then(() => {
  avanza.subscribe('quotes', '19002', (quote) => {
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
