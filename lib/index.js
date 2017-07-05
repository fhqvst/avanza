const EventEmitter = require('events')
const https = require('https')
const querystring = require('querystring')
const WebSocket = require('ws')
const constants = require('./constants')

class Avanza extends EventEmitter {
  constructor() {
    super()
    this._socket = new WebSocket(constants.SOCKET_URL)
    this._authenticated = false
    this._authenticationSession = null
    this._pushSubscriptionId = null
    this._customerId = null
    this._securityToken = null
  }

  getPositions() {
    return call('GET', constants.POSITIONS_PATH)
  }

  getOverview() {
    return call('GET', constants.OVERVIEW_PATH)
  }

  getAccountOverview(accountId) {
    const path = constants.ACCOUNT_OVERVIEW_PATH.replace('{0}', accountId)
    return call('GET', path)
  }

  getDealsAndOrders() {
    return call('GET', constants.DEALS_AND_ORDERS_PATH)
  }

  getTransactions(accountId, options) {
    const path = constants.TRANSACTIONS_PATH.replace('{0}', accountId)
    return call('GET', path + '?' + querystring.stringify(options))
  }

  getWatchlists() {
    return call('GET', constants.WATCHLISTS_PATH)
  }

  addToWatchlist(instrumentId, watchlistId) {
    const path = constants.WATCHLISTS_ADD_PATH
      .replace('{0}', watchlistId)
      .replace('{1}', instrumentId)
    return call('GET', path)
  }

  getStock(instrumentId) {
    const path = constants.STOCK_PATH.replace('{0}', instrumentId)
    return call('GET', path)
  }

  getOrderbook(orderbookId, type) {
    const path = constants.ORDERBOOK_PATH.replace('{0}', type.toLowerCase())
    return call('GET', path + '?' + querystring.stringify({ orderbookId }))
  }

  getOrderbooks(orderbookIds) {
    const ids = orderbookIds.join(',')
    const path = constants.ORDERBOOK_LIST_PATH.replace('{0}', ids)
    return call('GET', path + '?' + querystring.stringify({ sort: 'name' }))
  }

  getChartdata(orderbookId, period) {
    const path = constants.CHARTDATA_PATH.replace('{0}', id)
    return call('GET', path + '?' + querystring.stringify({ timePeriod: period }))
  }

  placeOrder(options) {
    return call('POST', constants.order_PATH, options)
  }

  checkOrder(accountId, requestId) {
    return call('GET', constants.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      requestId: requestId
    }))
  }

  deleteOrder(accountId, orderId) {
    const path = constants.ORDER_PATH + '?' + querystring.stringify({
      accountId: accountId,
      orderId: orderId
    })
    return call('DELETE', path)
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
    return call('GET', path)
  }

  getInspirationList(type) {
    return call('GET', constants.INSPIRATION_LIST_PATH.replace('{0}', type))
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

    const that = this
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
        that._authenticated = true
        that._securityToken = response.headers['x-securitytoken']
        that._authenticationSession = response.body.authenticationSession
        that._pushSubscriptionId = response.body.pushSubscriptionId
        that._customerId = response.body.customerId

        resolve({
          securityToken: that._securityToken,
          authenticationSession: that._authenticationSession,
          pushSubscriptionId: that._pushSubscriptionId,
          customerId: that._customerId
        })
      })
    })
  }

  call(method = 'GET', path = '', data = {}) {
    const authenticationSession = this.authenticationSession
    const securityToken = this.securityToken

    return new Promise((resolve, reject) => {
      if (!isAuthenticated()) {
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
          console.log(response.body)
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
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(`The request returned an error: ${response.statusCode} ${response.statusMessage}`)
      } else {
        let body = []
        response.on('data', chunk => body.push(chunk))
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            headers: response.headers,
            body: JSON.parse(body.join(''))
          })
        })
      }
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
