const test = require('ava')
const path = require('path')
const Avanza = require('index.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const avanza = new Avanza()

test.serial('authenticate()', async (t) => {
  const res = await avanza.authenticate({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  })
  t.is(typeof res.authenticationSession, 'string', 'authenticationSession is received')
  t.is(typeof res.pushSubscriptionId, 'string', 'pusbSubscriptionId is received')
  t.is(typeof res.customerId, 'string', 'customerId is received')
  t.is(typeof res.securityToken, 'string', 'securityToken is received')
})
