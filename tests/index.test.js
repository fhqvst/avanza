const test = require('ava')
const sinon = require('sinon')
const path = require('path')

const Avanza = require('index.js')
const constants = require('constants.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

test.beforeEach((t) => {
  t.context.avanza = new Avanza()
  t.context.call = sinon.stub(t.context.avanza, 'call')
})

test.skip.serial('authenticate()', async (t) => {
  const res = await t.context.avanza.authenticate({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  })
  t.is(typeof res.authenticationSession, 'string', 'authenticationSession is received')
  t.is(typeof res.pushSubscriptionId, 'string', 'pusbSubscriptionId is received')
  t.is(typeof res.customerId, 'string', 'customerId is received')
  t.is(typeof res.securityToken, 'string', 'securityToken is received')
})

test('getAccountOverview()', async (t) => {
  await t.context.avanza.getAccountOverview('12345')

  const actual = t.context.call.args[0]
  const expected = [ 'GET', constants.ACCOUNT_OVERVIEW_PATH.replace('{0}', '12345') ]
  t.deepEqual(actual, expected)
})

test('getTransactions() without options', async (t) => {
  await t.context.avanza.getTransactions('12345')

  const actual = t.context.call.args[0]
  const expected = [ 'GET', constants.TRANSACTIONS_PATH.replace('{0}', '12345') ]
  t.deepEqual(actual, expected)
})

test('getTransactions() with options', async (t) => {
  await t.context.avanza.getTransactions('12345', {
    from: '2017-01-01',
    to: '2018-01-01',
    maxAmount: 12345,
    minAmount: 54321,
    orderbookId: ['A', 'B', 'C']
  })

  const expectedPath = constants.TRANSACTIONS_PATH.replace('{0}', '12345')
  const expectedQuery = '?from=2017-01-01&to=2018-01-01&maxAmount=12345&minAmount=54321&orderbookId=A%2CB%2CC'

  const actual = t.context.call.args[0]
  const expected = [ 'GET', expectedPath + expectedQuery ]
  t.deepEqual(actual, expected)
})

test('addToWatchlist()', async (t) => {
  await t.context.avanza.addToWatchlist('12345', '54321')

  const expectedPath = constants.WATCHLISTS_ADD_PATH
    .replace('{1}', '12345')
    .replace('{0}', '54321')

  const actual = t.context.call.args[0]
  const expected = [ 'GET', expectedPath ]
  t.deepEqual(actual, expected)
})

test('getStock()', async (t) => {
  await t.context.avanza.getStock('12345')

  const actual = t.context.call.args[0]
  const expected = [ 'GET', constants.STOCK_PATH.replace('{0}', '12345') ]
  t.deepEqual(actual, expected)
})

test('getFund()', async (t) => {
  await t.context.avanza.getFund('12345')

  const actual = t.context.call.args[0]
  const expected = [ 'GET', constants.FUND_PATH.replace('{0}', '12345') ]
  t.deepEqual(actual, expected)
})

test('getOrderbook()', async (t) => {
  await t.context.avanza.getOrderbook('12345', 'STOCK')

  const expectedPath = constants.ORDERBOOK_PATH.replace('{0}', 'stock')
  const expectedQuery = '?orderbookId=12345'
  const actual = t.context.call.args[0]
  const expected = [ 'GET', expectedPath + expectedQuery ]
  t.deepEqual(actual, expected)
})

test('getOrderbooks()', async (t) => {
  await t.context.avanza.getOrderbooks(['123', '456', '789'])

  const expectedPath = constants.ORDERBOOK_LIST_PATH.replace('{0}', '123,456,789')
  const expectedQuery = '?sort=name'
  const actual = t.context.call.args[0]
  const expected = [ 'GET', expectedPath + expectedQuery ]
  t.deepEqual(actual, expected)
})

test('getChartdata()', async (t) => {
  await t.context.avanza.getChartdata('12345', 'test')

  const expectedPath = constants.CHARTDATA_PATH.replace('{0}', '12345')
  const expectedQuery = '?timePeriod=test'
  const actual = t.context.call.args[0]
  const expected = [ 'GET', expectedPath + expectedQuery ]
  t.deepEqual(actual, expected)
})

test('placeOrder()', async (t) => {
  const options = {
    accountId: '123',
    orderbookId: '456',
    orderType: 'BUY',
    price: 789,
    validUntil: '2023-01-01',
    volume: 100
  }
  await t.context.avanza.placeOrder(options)

  const actual = t.context.call.args[0]
  const expected = ['POST', constants.ORDER_PATH, options]
  t.deepEqual(actual, expected)
})

test('checkOrder()', async (t) => {
  await t.context.avanza.checkOrder('12345', '54321')

  const expectedPath = constants.ORDER_PATH
  const expectedQuery = '?accountId=12345&requestId=54321'
  const actual = t.context.call.args[0]
  const expected = [ 'GET', expectedPath + expectedQuery ]
  t.deepEqual(actual, expected)
})

test('deleteOrder()', async (t) => {
  await t.context.avanza.deleteOrder('12345', '54321')

  const expectedPath = constants.ORDER_PATH
  const expectedQuery = '?accountId=12345&orderId=54321'
  const actual = t.context.call.args[0]
  const expected = [ 'DELETE', expectedPath + expectedQuery ]
  t.deepEqual(actual, expected)
})

test.cb('subscribe()', (t) => {
  const { avanza } = t.context
  avanza.authenticate({
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  }).then(() => {
    setTimeout(() => {
      if (avanza._socketClientId) {
        t.pass()
      } else {
        t.fail()
      }
      t.end()
    }, 500)
    avanza.subscribe('quotes', '19002', () => {})
  })
})
