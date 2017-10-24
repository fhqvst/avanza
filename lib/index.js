const EventEmitter = require('events')
const https = require('https')
const querystring = require('querystring')
const WebSocket = require('ws')
const constants = require('./constants')

const VERSION = '1.0.0'
const BASE_URL = 'www.avanza.se'
const USER_AGENT = process.env.AVANZA_USER_AGENT || `Avanza API client/${VERSION}`
const MAX_INACTIVE_MINUTES = 60 * 60 * 24
const SOCKET_URL = 'wss://www.avanza.se/_push/cometd'

/**
 * Simple debug utility function
 *
 * @private
 * @param {String} message The message to log
 */
function debug(...message) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(...message)
  }
}

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
    const req = https.request({
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
    }, (response) => {
      const body = []
      response.on('data', chunk => body.push(chunk))
      response.on('end', () => {
        let parsedBody = body.join('')

        try {
          parsedBody = JSON.parse(parsedBody)
        } catch (e) {
          debug('Received non-JSON data from API.', body)
        }

        const res = {
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          headers: response.headers,
          body: parsedBody
        }
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(res)
        } else {
          resolve(res)
        }
      })
    })
    if (data) {
      req.write(data)
    }
    req.on('error', e => reject(e))
    req.end()
  })
}

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
* Note that for all channels where a _sequence_ of account IDs are expected
* (`<accountId1>,<accountId2>,...`), you must supply all of your account IDs,
* regardless of whether or not you want data for that account.
*
* | Channel                     | Note                                                                                                                |
* | :-------------------------- | :------------------------------------------------------------------------------------------------------------------ |
* | `Avanza.QUOTES`             | Minute-wise data containing current price, change, total volume traded etc. Expects an **orderbookId**.             |
* | `Avanza.ORDERDEPTHS`        | Best five offers and current total volume on each side. Expects an **orderbookId**.                                 |
* | `Avanza.TRADES`             | Updates whenever a new trade is made. Data contains volume, price, broker etc. Expects an **orderbookId**.          |
* | `Avanza.BROKERTRADESUMMARY` | Pushes data about which brokers are long/short and how big their current net volume is. Expects an **orderbookId**. |
* | `Avanza.POSITIONS`          | Your positions in an instrument. Expects a string of `<orderbookId>_<accountId1>,<accountId2,<accountId3>,...`.     |
* | `Avanza.ORDERS`             | Your current orders. Expects a string of `_<accountId1>,<accountId2,<accountId3>,...`.                              |
* | `Avanza.DEALS`              | Recent trades you have made. Expects a string of `_<accountId1>,<accountId2,<accountId3>,...`.                      |
* | `Avanza.ACCOUNTS`           | N/A. Expects a string of `_<accountId>`.                                                                            |
*
* #### Transaction Types
*
* | Transaction type          | Note |
* | :------------------------ | :--- |
* | `Avanza.OPTIONS`          |      |
* | `Avanza.FOREX`            |      |
* | `Avanza.DEPOSIT_WITHDRAW` |      |
* | `Avanza.BUY_SELL`         |      |
* | `Avanza.DIVIDEND`         |      |
* | `Avanza.INTEREST`         |      |
* | `Avanza.FOREIGN_TAX`      |      |
*
* #### Order Types
*
* | Order type    | Note |
* | :------------ | :--- |
* | `Avanza.BUY`  |      |
* | `Avanza.SELL` |      |
*
* @extends EventEmitter
*
*/
class Avanza extends EventEmitter {

  constructor() {
    super()
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
    this._socketInit()
  }

  _socketInit() {
    this._socket = new WebSocket(SOCKET_URL)
    this._socketAuthenticating = false
    this._socket.on('open', () => this._authenticateSocket())
    this._socket.on('message', (data, flags) => this._socketHandleMessage(data, flags))
    this._socket.on('close', () => this._socketInit())
  }

  _socketSend(data) {
    this._socket.send(JSON.stringify([data]))
    this._socketMessageCount += 1
  }

  _socketHandleMessage(data, flags) {
    const response = JSON.parse(String.fromCharCode.apply(null, flags.buffer))
    if (response.length && response[0]) {
      const message = response[0]
      if (message.advice && message.advice.reconnect == 'none') {
        debug(message.error)
      } else if (message.advice && message.advice.reconnect == 'handshake') {
        this._authenticateSocket(true)
      } else if (message.channel == '/meta/disconnect') {
        // It seems Avanza send out an unsolicited /meta/disconnect *response*
        // when session expires. Hence it should be OK to re-handshake.
        this._authenticateSocket(true)
      } else if (message.error) {
        debug(message.error)
      } else if (message.channel == '/meta/handshake') {
        this._socketInitialized = true
        this._socketAuthenticating = false
        this._socketClientId = message.clientId
        this._socketSend({
          advice: { timeout: 0 },
          channel: '/meta/connect',
          clientId: this._socketClientId,
          connectionType: 'websocket',
          id: this._socketMessageCount,
        })
      } else if (message.channel == '/meta/connect') {
        this.emit('connect', message)
        this._socketSend({
          channel: '/meta/connect',
          clientId: this._socketClientId,
          connectionType: 'websocket',
          id: this._socketMessageCount
        })
      } else {
        this.emit(message.channel, message.data)
      }
    }
  }

  _authenticateSocket(rehandshake) {
    if (rehandshake) {
      this._socketInitialized = false
      this._socketAuthenticating = false
    }
    if (this._socket.readyState === this._socket.OPEN) {
      if (this._authenticated) {
        if (!this._socketInitialized) {
          if (!this._socketAuthenticating) {
            this._socketAuthenticating = true
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
          }
        } else {
          this._socketSend({
            channel: '/meta/connect',
            clientId: this._socketClientId,
            connectionType: 'websocket',
            id: this._socketMessageCount
          })
        }
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
      return Promise.reject('Missing credentials.username.')
    }
    if (!credentials.password) {
      return Promise.reject('Missing credentials.password.')
    }

    return new Promise((resolve, reject) => {
      const data = {
        maxInactiveMinutes: MAX_INACTIVE_MINUTES,
        password: credentials.password,
        username: credentials.username
      }
      request({
        method: 'POST',
        path: constants.paths.AUTHENTICATION_PATH,
        data
      }).then((response) => {
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
      }).catch(e => reject(e))
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
  * @param {String} accountOrTransactionType A valid account ID or a
  *                                          [Transaction Type](#transaction-type).
  * @param {Object} options Configuring which transactions to fetch.
  * @param {String} [options.from] On the form YYYY-MM-DD.
  * @param {String} [options.to] On the form YYYY-MM-DD.
  * @param {Number} [options.maxAmount] Only fetch transactions of at most this value.
  * @param {Number} [options.minAmount] Only fetch transactions of at least this value.
  * @param {String|Array} [options.orderbookId] Only fetch transactions involving
  *                                             this/these orderbooks.
  */
  getTransactions(accountOrTransactionType, options) {
    const path = constants.paths.TRANSACTIONS_PATH.replace('{0}', accountOrTransactionType)

    if (options && Array.isArray(options.orderbookId)) {
      options.orderbookId = options.orderbookId.join(',')
    }

    // Unsure what this is.
    // options.includeInstrumentsWithNoOrderbook = 1

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
    const path = constants.paths.WATCHLISTS_ADD_DELETE_PATH
    .replace('{0}', watchlistId)
    .replace('{1}', instrumentId)
    return this.call('PUT', path)
  }

  /**
  * Remove an instrument from the watchlist.
  *
  * @param {String} instrumentId The ID of the instrument to remove.
  * @param {String} watchlistId  The ID of the watchlist to remove the instrument from.
  */
  removeFromWatchlist(instrumentId, watchlistId) {
    const path = constants.paths.WATCHLISTS_ADD_DELETE_PATH
    .replace('{0}', watchlistId)
    .replace('{1}', instrumentId)
    return this.call('DELETE', path)
  }

  /**
  * Get instrument information.
  *
  * @param {String} instrumentId Likely the same as the instrumentId.
  * @param {String} instrumentType The type of the instrument. See
  *                                [Instrument Types](#instrument-types).
  */
  getInstrument(instrumentType, instrumentId) {
    const path = constants.paths.INSTRUMENT_PATH
      .replace('{0}', instrumentType.toLowerCase())
      .replace('{1}', instrumentId)
    return this.call('GET', path)
  }

  /**
  * Get orderbook information.
  *
  * @param {String} orderbookId Likely the same as the instrumentId.
  * @param {String} instrumentType The type of the instrument. See
  *                                [Instrument Types](#instrument-types).
  */
  getOrderbook(instrumentType, orderbookId) {
    const path = constants.paths.ORDERBOOK_PATH.replace('{0}', instrumentType.toLowerCase())
    const query = querystring.stringify({ orderbookId })
    return this.call('GET', `${path}?${query}`)
  }

  /**
  * Get information about multiple orderbooks.
  *
  * @param {Array} orderbookIds A list of orderbook IDs.
  */
  getOrderbooks(orderbookIds) {
    const ids = orderbookIds.join(',')
    const path = constants.paths.ORDERBOOK_LIST_PATH.replace('{0}', ids)
    const query = querystring.stringify({ sort: 'name' })
    return this.call('GET', `${path}?${query}`)
  }

  /**
  * Get an array of prices over a period of time.
  *
  * @param {String} orderbookId The orderbook to fetch price data about.
  * @param {Period} period The period from which to fetch data. See [Periods](#periods).
  */
  getChartdata(orderbookId, period) {
    period = period.toLowerCase()
    const path = constants.paths.CHARTDATA_PATH.replace('{0}', orderbookId)
    const query = querystring.stringify({ timePeriod: period })
    return this.call('GET', `${path}?${query}`)
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

    if (!this._socketInitialized || this._socket.readyState != this._socket.OPEN) {
      this.once('connect', () => this.subscribe(channel, ids, callback))
      this._authenticateSocket()
      return
    }

    if (Array.isArray(ids)) {
      if (
        channel === Avanza.ORDERS ||
        channel === Avanza.DEALS ||
        channel === Avanza.POSITIONS
      ) {
        ids = ids.join(',')
      } else {
        throw new Error(`Channel ${channel} does not support multiple ids as input.`)
      }
    }

    const subscriptionString = `/${channel}/${ids}`
    this.on(subscriptionString, data => callback(data))

    this._socketSend({
      channel: '/meta/subscribe',
      clientId: this._socketClientId,
      id: this._socketMessageCount,
      subscription: subscriptionString
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
  * @param {String} options.validUntil A date on the form YYYY-MM-DD. Cancels
  *                                    the order if this date is passed.
  * @param {Number} options.volume How many securities to order.
  * @return {Object} Properties are `messages`, `requestId`, `status`, `orderId`.
  */
  placeOrder(options) {
    return this.call('POST', constants.paths.ORDER_PLACE_DELETE_PATH, options)
  }

  /**
   * Get information about an order.
   *
   * It is quite hard to automatically generate tables of what this endpoint
   * returns since orders are merely temporary entities.
   *
   * The returned object however looks very much like that from
   * [getOrderbook()](#getorderbook) with an extra property `order` which
   * contains information you already have (such as order price or volume).
   *
   * @param {String} instrumentType Instrument type of the pertaining instrument.
   *                                See [Instrument Types](#instrument-types).
   * @param {String} accountId ID of the account which this order was placed on.
   * @param {String} orderId ID of the order.
   */
  getOrder(instrumentType, accountId, orderId) {
    const path = constants.paths.ORDER_GET_PATH.replace('{0}', instrumentType.toLowerCase())
    const query = querystring.stringify({ accountId, orderId })
    return this.call('GET', `${path}?${query}`)
  }

  /**
   * Edit an order.
   *
   * @param {String} instrumentType Instrument type of the pertaining instrument.
   *                                See [Instrument Types](#instrument-types).
   * @param {String} orderId Order ID received when placing the order.
   * @param {Object} options Order options. See [placeOrder()](#placeorder).
   */
  editOrder(instrumentType, orderId, options) {
    options.orderCondition = 'NORMAL'
    const path = constants.paths.ORDER_EDIT_PATH
      .replace('{0}', instrumentType.toLowerCase())
      .replace('{1}', orderId)
    return this.call('PUT', path, options)
  }

  /**
  * Delete and cancel an order.
  *
  * @param {String} accountId ID of the account on which this order was placed.
  * @param {String} orderId Order ID received when the order was placed.
  */
  deleteOrder(accountId, orderId) {
    const path = constants.paths.ORDER_PLACE_DELETE_PATH
    const query = querystring.stringify({ accountId, orderId })
    return this.call('DELETE', `${path}?${query}`)
  }

  /**
  * Free text search for an instrument.
  *
  * @param {String} query Search query.
  * @param {String} [type] An instrument type.
  */
  search(searchQuery, type) {
    let path

    if (type) {
      path = constants.paths.SEARCH_PATH.replace('{0}', type.toUpperCase())
    } else {
      path = constants.paths.SEARCH_PATH.replace('/{0}', '')
    }

    const query = querystring.stringify({
      limit: 100,
      query: searchQuery
    })

    return this.call('GET', `${path}?${query}`)
  }

  /**
  * Make a call to the API. Note that this method will filter dangling question
  * marks from `path`.
  *
  * @param {String} [method='GET'] HTTP method to use.
  * @param {String} [path=''] The URL to send the request to.
  * @param {Object} [data={}] JSON data to send with the request.
  * @return {Promise}
  */
  call(method = 'GET', path = '', data = {}) {
    const authenticationSession = this._authenticationSession
    const securityToken = this._securityToken

    // Remove dangling question mark
    if (path.slice(-1) === '?') {
      path = path.slice(0, -1)
    }

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
Object.keys(constants.public).forEach((key) => {
  Object.defineProperty(Avanza, key, {
    value: constants.public[key]
  })
})

module.exports = Avanza
