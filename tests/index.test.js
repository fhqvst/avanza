const test = require('ava')
const path = require('path')
const sinon = require('sinon')

const Avanza = require('../dist/index.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const avanza = new Avanza()

test.before(async () => {
  await avanza.authenticate({
    username: process.env.AVANZA_USERNAME,
    password: process.env.AVANZA_PASSWORD,
    totpSecret: process.env.AVANZA_TOTP_SECRET,
  })
})

test('authenticated', async t => {
  t.is(typeof avanza._authenticationSession, 'string', 'authenticationSession is set')
  t.is(typeof avanza._pushSubscriptionId, 'string', 'pushSubscriptionId is set')
  t.is(typeof avanza._customerId, 'string', 'customerId is set')
  t.is(typeof avanza._securityToken, 'string', 'securityToken is set')
})

test('make call after being authenticated', async t => {
  t.truthy(await avanza.getOverview())
})

test('place valid order, edit it and delete it', async t => {
  let actual
  let expected
  let orderId
  let price

  const date = new Date(Date.now() + 1000 * 60 * 60 * 24) // Tomorrow
  const dateString = date.toLocaleDateString('sv', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  /**
   * 0. Get orderbook information
   */
  try {
    actual = await avanza.getOrderbook(Avanza.STOCK, process.env.AVANZA_STOCK)
    price = parseFloat(actual.orderbook.lastPrice * 0.99).toFixed(2)
  } catch (e) {
    t.fail(`Could not fetch orderbook information:${e.statusMessage}`)
  }

  /**
   * 1. Place valid order
   */
  try {
    actual = await avanza.placeOrder({
      accountId: process.env.AVANZA_ACCOUNT,
      orderbookId: process.env.AVANZA_STOCK,
      orderType: Avanza.BUY,
      price,
      validUntil: dateString,
      volume: 3,
    })
    expected = {
      messages: [''],
      requestId: '-1',
      status: 'SUCCESS',
    }

    // Save for later
    orderId = actual.orderId

    t.deepEqual(actual.messages, expected.messages, 'placeOrder().messages')
    t.is(actual.requestId, '-1', 'placeOrder().requestId')
    t.is(actual.status, 'SUCCESS', 'placeOrder().status')
  } catch (e) {
    t.fail(`Could not place buy order:${e.statusMessage}`)
  }

  /**
   * 2. Get order
   *
   * Only check that the endpoint returns a non-error status code.
   */
  await new Promise(r => setTimeout(r, 1000 + 500 * Math.random()))
  try {
    await avanza.getOrder(Avanza.STOCK, process.env.AVANZA_ACCOUNT, orderId)
  } catch (e) {
    t.fail(`Could not fetch placed order:${e.statusMessage}`)
  }

  /**
   * 3. Edit order
   *
   * Increase volume by one unit.
   */
  await new Promise(r => setTimeout(r, 1000 + 500 * Math.random()))
  try {
    actual = await avanza.editOrder(Avanza.STOCK, orderId, {
      accountId: process.env.AVANZA_ACCOUNT,
      volume: 2,
      price: parseFloat(price * 0.99).toFixed(2),
      validUntil: dateString,
    })
    expected = {
      messages: [''],
      orderId,
      requestId: '-1',
      status: 'SUCCESS',
    }

    t.deepEqual(actual.messages, expected.messages, 'editOrder().messages')
    t.is(actual.orderId, expected.orderId, 'editOrder().orderId')
    t.is(actual.requestId, '-1', 'editOrder().requestId')
    t.is(actual.status, 'SUCCESS', 'editOrder().status')
  } catch (e) {
    t.fail(`Could not edit placed buy order:${e.statusMessage}`)
  }

  /**
   * 4. Delete order
   */
  await new Promise(r => setTimeout(r, 1000 + 500 * Math.random()))
  try {
    actual = await avanza.deleteOrder(process.env.AVANZA_ACCOUNT, orderId)
    expected = {
      messages: [''],
      orderId,
      requestId: '-1',
      status: 'SUCCESS',
    }

    t.deepEqual(actual.messages, expected.messages, 'deleteOrder().messages')
    t.is(actual.orderId, expected.orderId, 'deleteOrder().orderId')
    t.is(actual.requestId, '-1', 'deleteOrder().requestId')
    t.is(actual.status, 'SUCCESS', 'deleteOrder().status')
  } catch (e) {
    t.fail(`Could not delete buy order:${e.statusMessage}`)
  }
})

test.cb('subscribe() and unsubscribe()', t => {
  const sandbox = sinon.createSandbox()
  const spy = sandbox.spy(avanza, '_socketHandleMessage')

  const unsubscribe = avanza.subscribe(Avanza.QUOTES, process.env.AVANZA_STOCK2, () => {})
  setTimeout(() => unsubscribe(), 500)

  setTimeout(() => {
    t.deepEqual(
      spy.lastCall.args[0],
      JSON.stringify([
        {
          channel: '/meta/unsubscribe',
          id: '5',
          subscription: `/${Avanza.QUOTES}/${process.env.AVANZA_STOCK2}`,
          successful: true,
        },
      ])
    )
    t.end()
  }, 1000)
})
