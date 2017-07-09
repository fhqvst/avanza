'use strict'

const EventEmitter = require('events')
const https = require('https')
const querystring = require('querystring')
const WebSocket = require('ws')
const constants = require('./constants.js')

const BASE_URL =              'www.avanza.se'
const USER_AGENT =            'Avanza/se.avanza.iphone (2.18.1 - (#501); iOS 10.2 ; iPhone)'
const MAX_INACTIVE_MINUTES =  60 * 60 * 24
const SOCKET_URL =            'wss://www.avanza.se/_push/cometd'

/**
* An Avanza API wrapper.
*
* ### Constants
*
* Some methods require certain constants as parameters. These are described below.
*
* #### Instrument types
*
* | Type                          | Note |
* | :---------------------------- | :--- |
* | `Avanza.STOCK`                |      |
* | `Avanza.FUND`                 |      |
* | `Avanza.BOND`                 |      |
* | `Avanza.OPTION`               |      |
* | `Avanza.FUTURE_FORWARD`       |      |
* | `Avanza.CERTIFICATE`          |      |
* | `Avanza.WARRANT`              |      |
* | `Avanza.EXCHANGE_TRADED_FUND` |      |
* | `Avanza.INDEX`                |      |
* | `Avanza.PREMIUM_BOND`         |      |
* | `Avanza.SUBSCRIPTION_OPTION`  |      |
* | `Avanza.EQUITY_LINKED_BOND`   |      |
* | `Avanza.CONVERTIBLE`          |      |
*
* #### Periods
*
* | Period                | Note |
* | :-------------------- | :--- |
* | `Avanza.TODAY`        |      |
* | `Avanza.ONE_WEEK`     |      |
* | `Avanza.ONE_MONTH`    |      |
* | `Avanza.THREE_MONTHS` |      |
* | `Avanza.THIS_YEAR`    |      |
* | `Avanza.ONE_YEAR`     |      |
* | `Avanza.FIVE_YEARS`   |      |
*
* #### Lists
*
* | List                                              | Note |
* | :------------------------------------------------ | :--- |
* | `Avanza.HIGHEST_RATED_FUNDS`                      |      |
* | `Avanza.LOWEST_FEE_INDEX_FUNDS`                   |      |
* | `Avanza.BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS` |      |
* | `Avanza.MOST_OWNED_FUNDS`                         |      |
*
* #### Channels
*
* | Channel                     | Note                                                                              |
* | :-------------------------- | :--------------------------------------------------------------------------------------- |
* | `Avanza.QUOTES`             | Minute-wise data containing current price, change, total volume traded etc.              |
* | `Avanza.ORDERDEPTHS`        | Best five offers and current total volume on each side.                                  |
* | `Avanza.TRADES`             | Updates whenever a new trade is made. Data contains volume, price, broker etc.           |
* | `Avanza.BROKERTRADESUMMARY` | Pushes data about which brokers are long/short and how big their current net volume is.  |
* | `Avanza.POSITIONS`          | Data about your own positions.                                                           |
* | `Avanza.ORDERS`             | Data about current orders.                                                               |
* | `Avanza.DEALS`              | Data about recent trades you have made.
*
* @extends EventEmitter
*
*/
class Avanza extends EventEmitter {

  constructor() {
    super()
    this._socket = new WebSocket(SOCKET_URL)
    this._authenticated = false
    this._authenticationSession = null
    this._authenticationTimeout = MAX_INACTIVE_MINUTES
    this._pushSubscriptionId = null
    this._reauthentication = null
    this._customerId = null
    this._securityToken = null

    this._socketInitialized = false
    this._socketMessageCount = 1
    this._socketClientId = null
  }

  _socketSend(data) {
    this._socket.send(JSON.stringify([data]))
    this._socketMessageCount += 1
  }

  _socketHandleMessage(data, flags) {
    let response = JSON.parse(String.fromCharCode.apply(null, flags.buffer))
    if (response.length && response[0]) {

      const message = response[0]

      if (message.error) {
        console.log(message.error)
      } else {
        switch (message.channel) {
        case '/meta/handshake':
          this._socketClientId = message.clientId
          this._socketSend({
            advice: { timeout: 0 },
            channel: '/meta/connect',
            clientId: this._socketClientId,
            connectionType: 'websocket',
            id: this._socketMessageCount
          })
          this.emit('handshake')
          break
        case '/meta/connect':
          if (message.successful) {
            this.emit('connect', message)
            this._socketSend({
              channel: '/meta/connect',
              clientId: this._socketClientId,
              connectionType: 'websocket',
              id: this._socketMessageCount
            })
          }
          break
        default:
          const channel = message.channel.match(/([A-Za-z]+)/g)
          if (typeof message.data !== 'undefined') {
            this.emit(channel, message.data)
          } else {
            this.emit(channel, message)
          }
        }
      }
    }
  }

  _authenticateSocket() {
    if (!this._socketInitialized) {

      this._socketInitialized = true
      this._socket.on('message', (data, flags) => this._socketHandleMessage(data, flags))

      if (this._socket.readyState === this._socket.OPEN) {
        this._socketSend({
          advice: {
            timeout: 60000,
            interval: 0
          },
          channel: '/meta/handshake',
          ext: { subscriptionId: this._pushSubscriptionId },
          id: this._socketMessageCounter,
          minimumVersion: '1.0',
          supportedConnectionTypes: ['websocket', 'long-polling', 'callback-polling'],
          version: '1.0'
        })
      } else {
        this._socket.on('open', () => this._authenticateSocket())
      }
    }
  }

  /**
  * Authenticate the client.
  *
  * @param {Object} credentials
  * @param {String} credentials.username
  * @param {String} credentials.password
  */
  authenticate(credentials) {
    if (!credentials) {
      return Promise.reject('Missing credentials.')
    }
    if (!credentials.username) {
      return Promise.reject('Missing crendentials.username.')
    }
    if (!credentials.password) {
      return Promise.reject('Missing crendentials.password.')
    }

    return new Promise((resolve, reject) => {
      const data = {
        'maxInactiveMinutes': MAX_INACTIVE_MINUTES,
        'password': credentials.password,
        'username': credentials.username
      }
      request({
        method: 'POST',
        path: constants.paths.AUTHENTICATION_PATH,
        data
      }).then(response => {
        this._authenticated = true
        this._securityToken = response.headers['x-securitytoken']
        this._authenticationSession = response.body.authenticationSession
        this._pushSubscriptionId = response.body.pushSubscriptionId
        this._customerId = response.body.customerId

        // Re-authenticate after timeout minus one minute
        clearInterval(this._reauthentication)
        this._reauthentication = setTimeout(() => {
          this.authenticate(credentials)
        }, this._authenticationTimeout - (60 * 1000))

        resolve({
          securityToken: this._securityToken,
          authenticationSession: this._authenticationSession,
          pushSubscriptionId: this._pushSubscriptionId,
          customerId: this._customerId
        })
      })
    })
  }

  /**
  * Get all `positions` held by this user.
  */
  getPositions() {
    return this.call('GET', constants.paths.POSITIONS_PATH)
  }

  /**
  * Get an overview of the users holdings at Avanza Bank.
  */
  getOverview() {
    return this.call('GET', constants.paths.OVERVIEW_PATH)
  }

  /**
  * Get an overview of the users holdings for a specific account at Avanza Bank.
  * @param {String} accountId A valid account ID.
  * @returns {String} hejhej
  * @returns {String} kiss
  *
  */
  getAccountOverview(accountId) {
    const path = constants.paths.ACCOUNT_OVERVIEW_PATH.replace('{0}', accountId)
    return this.call('GET', path)
  }

  /**
  * Get recent deals and orders.
  */
  getDealsAndOrders() {
    return this.call('GET', constants.paths.DEALS_AND_ORDERS_PATH)
  }

  /**
  * Get all transactions of an account.
  *
  * @param {String} accountId A valid account ID.
  * @param {Object} [options] Configuring which transactions to fetch.
  * @param {String} [options.from] On the form YYYY-MM-DD.
  * @param {String} [options.to] On the form YYYY-MM-DD.
  * @param {Number} [options.maxAmount] Only fetch transactions of at most this value.
  * @param {Number} [options.minAmount] Only fetch transactions of at least this value.
  * @param {String|Array} [options.orderbookId] Only fetch transactions involving this/these orderbooks.
  */
  getTransactions(accountId, options) {
    const path = constants.paths.TRANSACTIONS_PATH.replace('{0}', accountId)

    if (options && Array.isArray(options.orderbookId)) {
      options.orderbookId = options.orderbookId.join(',')
    }

    const query = querystring.stringify(options)
    return this.call('GET', query ? `${path}?${query}` : path)
  }

  /**
  * Get all watchlists created by this user. Note that the second table was
  * created from a specific watchlist, and so the response from the API will be
  * different for you.
  */
  getWatchlists() {
    return this.call('GET', constants.paths.WATCHLISTS_PATH)
  }

  /**
  * Add an instrument to the watchlist.
  *
  * @param {String} instrumentId The ID of the instrument to add.
  * @param {String} watchlistId  The ID of the watchlist to add the instrument to.
  */
  addToWatchlist(instrumentId, watchlistId) {
    const path = constants.paths.WATCHLISTS_ADD_PATH
    .replace('{0}', watchlistId)
    .replace('{1}', instrumentId)
    return this.call('GET', path)
  }

  /**
  * Get information about a stock.
  *
  * @param {String} instrumentId The ID of the stock to fetch information about.
  */
  getStock(instrumentId) {
    const path = constants.paths.STOCK_PATH.replace('{0}', instrumentId)
    return this.call('GET', path)
  }

  /**
  * Get information about a fund.
  *
  * @param {String} instrumentId The ID of the func to fetch information about.
  */
  getFund(instrumentId) {
    const path = constants.paths.FUND_PATH.replace('{0}', instrumentId)
    return this.call('GET', path)
  }

  /**
  * Get orderbook information.
  *
  * @param {String} orderbookId Likely the same as the instrumentId.
  * @param {String} instrumentType The type of the instrument. See [Instrument Types](#instrument-types).
  */
  getOrderbook(orderbookId, instrumentType) {
    const path = constants.paths.ORDERBOOK_PATH.replace('{0}', instrumentType.toLowerCase())
    return this.call('GET', path + '?' + querystring.stringify({ orderbookId }))
  }

  /**
  * Get information about multiple orderbooks.
  *
  * @param {Array} orderbookIds A list of orderbook IDs.
  */
  getOrderbooks(orderbookIds) {
    const ids = orderbookIds.join(',')
    const path = constants.paths.ORDERBOOK_LIST_PATH.replace('{0}', ids)
    return this.call('GET', path + '?' + querystring.stringify({ sort: 'name' }))
  }

  /**
  * Get an array of OHLC price data for a period of time.
  *
  * @param {String} orderbookId The orderbook to fetch price data about.
  * @param {Period} period The period from which to fetch data. See [Periods](#periods).
  */
  getChartdata(orderbookId, period) {
    period = period.toLowerCase()
    const path = constants.paths.CHARTDATA_PATH.replace('{0}', orderbookId)
    return this.call('GET', path + '?' + querystring.stringify({ timePeriod: period }))
  }

  /**
  * List all inspiration lists.
  */
  getInspirationLists() {
    return this.call('GET', constants.paths.INSPIRATION_LIST_PATH.replace('{0}', ''))
  }

  /**
  * Get information about a single inspiration list.
  *
  * @param {String} list List type. See [Lists](#lists)
  */
  getInspirationList(type) {
    return this.call('GET', constants.paths.INSPIRATION_LIST_PATH.replace('{0}', type))
  }

  /**
  * Subscribe to real-time data.
  *
  * @param {String} channel The channel on which to listen. See [Channels](#channels).
  * @param {String|Array} ids One or many IDs to subscribe to.
  * @param {Function} callback
  */
  subscribe(channel, ids, callback) {
    if (typeof this._pushSubscriptionId === 'undefined') {
      throw new Error('Expected to be authenticated before subscribing.')
    }

    if (!this._socketInitialized) {
      this.once('connect', () => this.subscribe(channel, ids, callback))
      this._authenticateSocket()
      return
    }

    if (Array.isArray(ids)) {
      ids = ids.join(',')
    }

    this._socketSend({
      channel: '/meta/subscribe',
      clientId: this._socketClientId,
      id: this._socketMessageCount,
      subscription: `/${channel}/${ids}`
    })
  }

  /**
  * Place a limit order.
  *
  * @param {Object} options Order options.
  * @param {String} options.accountId ID of the account to trade on.
  * @param {String} options.orderbookId ID of the instrument to trade.
  * @param {String} options.orderType One of "BUY" or "SELL".
  * @param {Number} options.price The price limit of the order.
  * @param {String} options.validUntil A date on the form YYYY-MM-DD. Cancels the order if this date is passed.
  * @param {Number} options.volume How many securities to order.
  */
  placeOrder(options) {
    return this.call('POST', constants.paths.ORDER_PATH, options)
  }

  /**
  * Check the state of an order.
  *
  * @param {String} accountId ID of the account on which this order was placed.
  * @param {String} requestId Request ID received when the order was placed.
  */
  checkOrder(accountId, requestId) {
    return this.call('GET', constants.paths.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      requestId: requestId
    }))
  }

  /**
  * Delete and cancel an order.
  *
  * @param {String} accountId ID of the account on which this order was placed.
  * @param {String} orderId Order ID received when the order was placed.
  */
  deleteOrder(accountId, orderId) {
    const path = constants.paths.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      orderId: orderId
    })
    return this.call('DELETE', path)
  }

  /**
  * Free text search for an instrument.
  *
  * @param {String} query Search query.
  * @param {String} [type] An instrument type.
  */
  search(query, type) {
    let path
    if (type) {
      path = constants.paths.SEARCH_PATH.replace('{0}', type.toUpperCase()) + '?' + querystring.stringify({
        limit: 100,
        query: query
      })
    } else {
      path = constants.paths.SEARCH_PATH.replace('/{0}', '') + '?' + querystring.stringify({
        query
      })
    }
    return this.call('GET', path)
  }

  /**
  * Make a call to the API.
  *
  * @param {String} [method='GET'] HTTP method to use.
  * @param {String} [path=''] The URL to send the request to.
  * @param {Object} [data={}] JSON data to send with the request.
  * @return {Promise}
  */
  call(method = 'GET', path = '', data = {}) {
    const authenticationSession = this._authenticationSession
    const securityToken = this._securityToken
    return new Promise((resolve, reject) => {
      if (!this._authenticated) {
        reject('Expected to be authenticated before calling.')
      } else {
        request({
          method,
          path,
          data,
          headers: {
            'X-AuthenticationSession': authenticationSession,
            'X-SecurityToken': securityToken
          }
        })
        .then(response => resolve(response.body))
        .catch(e => reject(e))
      }
    })
  }
}

// Expose public constants
Object.keys(constants.public).forEach(constant => {
  Object.defineProperty(Avanza, constant, {
    value: constant
  })
})

/**
* Execute a request.
*
* @private
* @param {Object} options Request options.
* @return {Promise}
*/
function request(options) {
  if (!options) {
    return Promise.reject('Missing options.')
  }
  const data = JSON.stringify(options.data)
  return new Promise((resolve, reject) => {
    const request = https.request({
      host: BASE_URL,
      port: 443,
      method: options.method,
      path: options.path,
      headers: Object.assign({
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        'Content-Length': data.length
      }, options.headers)
    }, response => {
      let body = []
      response.on('data', chunk => body.push(chunk))
      response.on('end', () => {
        const res = {
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          headers: response.headers,
          body: JSON.parse(body.join(''))
        }
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(res)
        } else {
          resolve(res)
        }
      })
    })
    if (data) {
      request.write(data)
    }
    request.on('error', e => reject(e))
    request.end()
  })
}

module.exports = Avanza
