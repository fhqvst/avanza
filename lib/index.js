const EventEmitter = require('events')
const https = require('https')
const querystring = require('querystring')
const WebSocket = require('ws')
const constants = require('./constants')

/**
* An Avanza API wrapper.
*
* @extends EventEmitter
*/
class Avanza extends EventEmitter {

  constructor() {
    super()
    this._socket = new WebSocket(constants.SOCKET_URL)
    this._authenticated = false
    this._authenticationSession = null
    this._authenticationTimeout = 60 * 60 * 24 /* 1440 minutes */
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
        'maxInactiveMinutes': constants.MAX_INACTIVE_MINUTES,
        'password': credentials.password,
        'username': credentials.username
      }
      request({
        method: 'POST',
        path: constants.AUTHENTICATION_PATH,
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
    return this.call('GET', constants.POSITIONS_PATH)
  }

  /**
  * Get an overview of the users holdings at Avanza Bank.
  */
  getOverview() {
    return this.call('GET', constants.OVERVIEW_PATH)
  }

  /**
  * Get an overview of the users holdings for a specific account at Avanza Bank.
  */
  getAccountOverview(accountId) {
    const path = constants.ACCOUNT_OVERVIEW_PATH.replace('{0}', accountId)
    return this.call('GET', path)
  }

  /**
  * Get recent deals and orders.
  */
  getDealsAndOrders() {
    return this.call('GET', constants.DEALS_AND_ORDERS_PATH)
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
    const path = constants.TRANSACTIONS_PATH.replace('{0}', accountId)

    if (options && Array.isArray(options.orderbookId)) {
      options.orderbookId = options.orderbookId.join(',')
    }

    const query = querystring.stringify(options)
    return this.call('GET', query ? `${path}?${query}` : path)
  }

  /**
  * Get all watchlists created by this user.
  */
  getWatchlists() {
    return this.call('GET', constants.WATCHLISTS_PATH)
  }

  /**
  * Add an instrument to the watchlist.
  *
  * @param {String} instrumentId The ID of the instrument to add.
  * @param {String} watchlistId  The ID of the watchlist to add the instrument to.
  */
  addToWatchlist(instrumentId, watchlistId) {
    const path = constants.WATCHLISTS_ADD_PATH
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
    const path = constants.STOCK_PATH.replace('{0}', instrumentId)
    return this.call('GET', path)
  }

  /**
  * Get information about a fund.
  *
  * @param {String} instrumentId The ID of the func to fetch information about.
  */
  getFund(instrumentId) {
    const path = constants.FUND_PATH.replace('{0}', instrumentId)
    return this.call('GET', path)
  }

  /**
  * Get orderbook information.
  *
  * @param {String} orderbookId Likely the same as the instrumentId.
  * @param {String} type The type of the instrument.
  */
  getOrderbook(orderbookId, type) {
    const path = constants.ORDERBOOK_PATH.replace('{0}', type.toLowerCase())
    return this.call('GET', path + '?' + querystring.stringify({ orderbookId }))
  }

  /**
  * Get information about multiple orderbooks.
  *
  * @param {Array} orderbookIds A list of orderbook IDs.
  */
  getOrderbooks(orderbookIds) {
    const ids = orderbookIds.join(',')
    const path = constants.ORDERBOOK_LIST_PATH.replace('{0}', ids)
    return this.call('GET', path + '?' + querystring.stringify({ sort: 'name' }))
  }

  /**
  * Get an array of OHLC price data for a period of time.
  *
  * @param {String} orderbookId The orderbook to fetch price data about.
  * @param {Period} period One of: 'today', 'one_week', 'one_month',
  *                        'three_months', 'this_year', 'one_year', 'five_years'
  */
  getChartdata(orderbookId, period) {
    period = period.toLowerCase()
    const path = constants.CHARTDATA_PATH.replace('{0}', orderbookId)
    return this.call('GET', path + '?' + querystring.stringify({ timePeriod: period }))
  }

  /**
  * Get an inspiration list.
  *
  * @param {String} type Instrument type.
  */
  getInspirationList(type) {
    return this.call('GET', constants.INSPIRATION_LIST_PATH.replace('{0}', type))
  }

  /**
  * Subscribe to real-time data.
  *
  * | Channel              | Description                                                                              |
  * | :------------------- | :--------------------------------------------------------------------------------------- |
  * | `quotes`             | Minute-wise data containing current price, change, total volume traded etc.              |
  * | `orderdepths`        | Best five offers and current total volume on each side.                                  |
  * | `trades`             | Updates whenever a new trade is made. Data contains volume, price, broker etc.           |
  * | `brokertradesummary` | Pushes data about which brokers are long/short and how big their current net volume is.  |
  * | `positions`          | Data about your own positions.                                                           |
  * | `orders`             | Data about current orders.                                                               |
  * | `deals`              | Data about recent trades you have made.                                                  |
  *
  * @param {String} channel The channel on which to listen.
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
    return this.call('POST', constants.ORDER_PATH, options)
  }

  /**
  * Check the state of an order.
  *
  * @param {String} accountId ID of the account on which this order was placed.
  * @param {String} requestId Request ID received when the order was placed.
  */
  checkOrder(accountId, requestId) {
    return this.call('GET', constants.ORDER_PATH + '?' + querystring.stringify({
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
    const path = constants.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      orderId: orderId
    })
    return this.call('DELETE', path)
  }

  /**
  * Free text search for an instrument.
  *
  * @param {String} query Search query.
  * @param {String} type Instrument type.
  */
  search(query, type) {
    let path
    if (type) {
      path = constants.SEARCH_PATH.replace('{0}', type.toUpperCase()) + '?' + querystring.stringify({
        limit: 100,
        query: query
      })
    } else {
      path = constants.SEARCH_PATH.replace('/{0}', '') + '?' + querystring.stringify({
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
        }).then(response => {
          resolve(response.body)
        }).catch(e => {
          reject(e)
        })
      }
    })
  }

}

/**
* Execute a request.
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
      host: constants.BASE_URL,
      port: constants.PORT,
      method: options.method,
      path: options.path,
      headers: Object.assign({
        'Accept': '*/*',
        'Content-Type': constants.CONTENT_TYPE,
        'User-Agent': constants.USER_AGENT,
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
    request.on('error', e => {
      reject(e)
    })
    request.end()
  })
}

module.exports = Avanza
