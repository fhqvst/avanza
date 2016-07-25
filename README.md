# Avanza

A Node.js wrapper for the unofficial Avanza API. Please note that this is only a proof of concept, hence not meant to be used by anyone.

## Installation

Install via [npm](https://www.npmjs.com/package/github)

```bash
$ npm install avanza
```

or

Install via git clone

```bash
$ git clone https://github.com/fhqvst/avanza.git
$ cd avanza
$ npm install
```

## Documentation

...to be written.

## Test auth file

Create a `.env` file to run the tests.

```bash
# .env
USERNAME=my_username
PASSWORD=my_password
ACCOUNT=12345       # your valid account id
ORDER=12345         # the id of an order belonging to the specified account
```

## Example

...to be written.

## Authentication

Logging in returns three important credentials: An authentication session, a subscription id and a security token. The first two are found in the body of the response, and the security token is found in a header: `X-SecurityToken`.
The authentication session and security token are used in every request, but the subscription id is only needed when subscribing to sockets.

The `Content-Length` header is only required when doing the authentication.

## Tests

Run all tests

```bash
$ npm test
```

Or run a specific test

```bash
$ npm test test/exampleTest.js
```

## LICENSE

MIT license. See the LICENSE file for details.