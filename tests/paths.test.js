const test = require('ava')
const sinon = require('sinon')
const path = require('path')

const Avanza = require('../dist/index.js')
const constants = require('../dist/constants.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

test.beforeEach(t => {
  t.context.avanza = new Avanza()
  sinon.stub(t.context.avanza, 'call')
})

test.serial('getAccountOverview()', async t => {
  await t.context.avanza.getAccountOverview('12345')

  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', constants.paths.ACCOUNT_OVERVIEW_PATH.replace('{0}', '12345')]
  t.deepEqual(actual, expected)
})

test.serial('getTransactions() without options', async t => {
  await t.context.avanza.getTransactions('12345')

  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', constants.paths.TRANSACTIONS_PATH.replace('{0}', '12345')]
  t.deepEqual(actual, expected)
})

test.serial('getTransactions() with options', async t => {
  await t.context.avanza.getTransactions('12345', {
    from: '2017-01-01',
    to: '2018-01-01',
    maxAmount: 12345,
    minAmount: 54321,
    orderbookId: ['A', 'B', 'C'],
  })

  const expectedPath = constants.paths.TRANSACTIONS_PATH.replace('{0}', '12345')
  const expectedQuery = '?from=2017-01-01&to=2018-01-01&maxAmount=12345&minAmount=54321&orderbookId=A%2CB%2CC'

  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', expectedPath + expectedQuery]
  t.deepEqual(actual, expected)
})

test.serial('addToWatchlist()', async t => {
  await t.context.avanza.addToWatchlist('12345', '54321')

  const expectedPath = constants.paths.WATCHLISTS_ADD_DELETE_PATH.replace('{1}', '12345').replace('{0}', '54321')

  const actual = t.context.avanza.call.args[0]
  const expected = ['PUT', expectedPath]
  t.deepEqual(actual, expected)
})

test.serial('removeFromWatchlist()', async t => {
  await t.context.avanza.removeFromWatchlist('12345', '54321')

  const expectedPath = constants.paths.WATCHLISTS_ADD_DELETE_PATH.replace('{1}', '12345').replace('{0}', '54321')

  const actual = t.context.avanza.call.args[0]
  const expected = ['DELETE', expectedPath]
  t.deepEqual(actual, expected)
})

test.serial('getInstrument()', async t => {
  await t.context.avanza.getInstrument('STOCK', '12345')

  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', constants.paths.INSTRUMENT_PATH.replace('{0}', 'stock').replace('{1}', '12345')]
  t.deepEqual(actual, expected)
})

test.serial('getOrderbook()', async t => {
  await t.context.avanza.getOrderbook('STOCK', '12345')

  const expectedPath = constants.paths.ORDERBOOK_PATH.replace('{0}', 'stock')
  const expectedQuery = '?orderbookId=12345'
  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', expectedPath + expectedQuery]
  t.deepEqual(actual, expected)
})

test.serial('getOrderbooks()', async t => {
  await t.context.avanza.getOrderbooks(['123', '456', '789'])

  const expectedPath = constants.paths.ORDERBOOK_LIST_PATH.replace('{0}', '123,456,789')
  const expectedQuery = '?sort=name'
  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', expectedPath + expectedQuery]
  t.deepEqual(actual, expected)
})

test.serial('getChartdata()', async t => {
  await t.context.avanza.getChartdata('12345', 'test')

  const expectedPath = constants.paths.CHARTDATA_PATH.replace('{0}', '12345')
  const expectedQuery = '?timePeriod=test'
  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', expectedPath + expectedQuery]
  t.deepEqual(actual, expected)
})

test.serial('placeOrder()', async t => {
  const options = {
    accountId: '123',
    orderbookId: '456',
    orderType: 'BUY',
    price: 789,
    validUntil: '2023-01-01',
    volume: 100,
  }
  await t.context.avanza.placeOrder(options)

  const actual = t.context.avanza.call.args[0]
  const expected = ['POST', constants.paths.ORDER_PLACE_DELETE_PATH, { ...options }]
  t.deepEqual(actual, expected)
})

test.serial('getOrder()', async t => {
  await t.context.avanza.getOrder('STOCK', '12345', '54321')

  const expectedPath = constants.paths.ORDER_GET_PATH.replace('{0}', 'stock')
  const expectedQuery = '?accountId=12345&orderId=54321'
  const actual = t.context.avanza.call.args[0]
  const expected = ['GET', expectedPath + expectedQuery]
  t.deepEqual(actual, expected)
})

test.serial('deleteOrder()', async t => {
  await t.context.avanza.deleteOrder('12345', '54321')

  const expectedPath = constants.paths.ORDER_PLACE_DELETE_PATH
  const expectedQuery = '?accountId=12345&orderId=54321'
  const actual = t.context.avanza.call.args[0]
  const expected = ['DELETE', expectedPath + expectedQuery]
  t.deepEqual(actual, expected)
})
