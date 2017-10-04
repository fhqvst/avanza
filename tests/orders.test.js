const test = require('ava')
const path = require('path')

const Avanza = require('../dist/index.js')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const avanza = new Avanza()

test.before(async () => {
  await avanza.authenticate({
    username: process.env.AVANZA_USERNAME,
    password: process.env.AVANZA_PASSWORD
  })
})

test('place valid order, edit it and delete it', async (t) => {
  let actual
  let expected
  let orderId

  const date = new Date(Date.now() + (1000 * 60 * 60 * 24)) // Tomorrow
  const dateString = date.toLocaleDateString('us', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  /**
   * 1. Place valid order
   */
  try {
    actual = await avanza.placeOrder({
      accountId: process.env.AVANZA_ACCOUNT,
      orderbookId: process.env.AVANZA_STOCK,
      orderType: Avanza.BUY,
      price: 35,
      validUntil: dateString,
      volume: 10
    })
    expected = {
      messages: [''],
      requestId: '-1',
      status: 'SUCCESS'
    }

    // Save for later
    orderId = actual.orderId

    t.deepEqual(actual.messages, expected.messages, 'placeOrder().messages')
    t.is(actual.requestId, '-1', 'placeOrder().requestId')
    t.is(actual.status, 'SUCCESS', 'placeOrder().status')
  } catch (e) {
    console.log(e)
    t.fail(e.statusMessage)
  }

  /**
   * 2. Get order
   *
   * Only check that the endpoint returns a non-error status code.
   */
  await new Promise(r => setTimeout(r, 1000))
  try {
    await avanza.getOrder(Avanza.STOCK, process.env.AVANZA_ACCOUNT, orderId)
  } catch (e) {
    console.log(e)
    t.fail(e.statusMessage)
  }

  /**
   * 3. Edit order
   *
   * Increase volume by one unit.
   */
  await new Promise(r => setTimeout(r, 1000))
  try {
    actual = await avanza.editOrder(Avanza.STOCK, orderId, {
      accountId: process.env.AVANZA_ACCOUNT,
      volume: 11,
      price: 35,
      validUntil: dateString
    })
    expected = {
      messages: [''],
      orderId,
      requestId: '-1',
      status: 'SUCCESS'
    }

    t.deepEqual(actual.messages, expected.messages, 'editOrder().messages')
    t.is(actual.orderId, expected.orderId, 'editOrder().orderId')
    t.is(actual.requestId, '-1', 'editOrder().requestId')
    t.is(actual.status, 'SUCCESS', 'editOrder().status')
  } catch (e) {
    console.log(e)
    t.fail(e.statusMessage)
  }

  /**
   * 4. Delete order
   */
  await new Promise(r => setTimeout(r, 1000))
  try {
    actual = await avanza.deleteOrder(process.env.AVANZA_ACCOUNT, orderId)
    expected = {
      messages: [''],
      orderId,
      requestId: '-1',
      status: 'SUCCESS'
    }

    t.deepEqual(actual.messages, expected.messages, 'deleteOrder().messages')
    t.is(actual.orderId, expected.orderId, 'deleteOrder().orderId')
    t.is(actual.requestId, '-1', 'deleteOrder().requestId')
    t.is(actual.status, 'SUCCESS', 'deleteOrder().status')
  } catch (e) {
    console.log(e)
    t.fail(e.statusMessage)
  }
})
