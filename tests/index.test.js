const test = require('ava')
const path = require('path')
const Avanza = require('index.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const avanza = new Avanza()

test.serial('authentication', async (t) => {
  const auth = await avanza.authenticate({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  })
  t.is(typeof auth.authenticationSession, 'string', 'authenticationSession is received.')
  t.is(typeof auth.pushSubscriptionId, 'string', 'pusbSubscriptionId is received.')
  t.is(typeof auth.customerId, 'string', 'customerId is received.')
  t.is(typeof auth.securityToken, 'string', 'securityToken is received.')
})
