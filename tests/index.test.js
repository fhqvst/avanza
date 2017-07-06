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

test('getPositions()', async (t) => {
  const res = await avanza.getPositions()
  
  t.true(Array.isArray(res.instrumentPositions), 'instrumentPositions is an array')
  t.is(typeof res.totalProfit, 'number', 'totalProfit is a number')
  t.is(typeof res.totalBuyingPower, 'number', 'totalBuyingPower is a number')
  t.is(typeof res.totalOwnCapital, 'number', 'totalOwnCapital is a number')
  t.is(typeof res.totalBalance, 'number', 'totalBalance is a number')
  t.is(typeof res.totalProfitPercent, 'number', 'totalProfitPercent is a number')
})

test('getOverview()', async (t) => {
  const res = await avanza.getOverview()
  t.true(Array.isArray(res.accounts), 'accounts is an array')

})
