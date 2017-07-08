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
    this._reauthentication = null
    this._pushSubscriptionId = null
    this._customerId = null
    this._securityToken = null
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
   * @param  {String} accountId A valid account ID.
   * @param  {Object} [options] Configuring which transactions to fetch.
   */
  getTransactions(accountId, options) {
    const path = constants.TRANSACTIONS_PATH.replace('{0}', accountId)
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

  getOrderbook(orderbookId, type) {
    const path = constants.ORDERBOOK_PATH.replace('{0}', type.toLowerCase())
    return this.call('GET', path + '?' + querystring.stringify({ orderbookId }))
  }

  getOrderbooks(orderbookIds) {
    const ids = orderbookIds.join(',')
    const path = constants.ORDERBOOK_LIST_PATH.replace('{0}', ids)
    return this.call('GET', path + '?' + querystring.stringify({ sort: 'name' }))
  }

  getChartdata(id, period) {
    const path = constants.CHARTDATA_PATH.replace('{0}', id)
    return this.call('GET', path + '?' + querystring.stringify({ timePeriod: period }))
  }

  placeOrder(options) {
    return this.call('POST', constants.order_PATH, options)
  }

  checkOrder(accountId, requestId) {
    return this.call('GET', constants.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      requestId: requestId
    }))
  }

  deleteOrder(accountId, orderId) {
    const path = constants.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      orderId: orderId
    })
    return this.call('DELETE', path)
  }

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

  getInspirationList(type) {
    return this.call('GET', constants.INSPIRATION_LIST_PATH.replace('{0}', type))
  }

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
