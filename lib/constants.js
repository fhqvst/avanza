/**
 * General settings
 */
const constants = {}
constants.BASE_URL =              'www.avanza.se'
constants.PORT =                  443
constants.USER_AGENT =            'Avanza/se.avanza.iphone (2.12.0 - (#64) iOS 10.0.2)'
constants.CONTENT_TYPE =          'application/json'
constants.MAX_INACTIVE_MINUTES =  '1440'

/**
 * Paths
 */
constants.SOCKET_URL =            'wss://www.avanza.se/_push/cometd'
constants.POSITIONS_PATH =        '/_mobile/account/positions'
constants.OVERVIEW_PATH =         '/_mobile/account/overview'
constants.ACCOUNT_OVERVIEW_PATH = '/_mobile/account/{0}/overview'
constants.DEALS_AND_ORDERS_PATH = '/_mobile/account/dealsandorders'
constants.WATCHLISTS_PATH =       '/_mobile/usercontent/watchlist'
constants.WATCHLISTS_ADD_PATH =   '/_api/usercontent/watchlist/{0}/orderbooks/{1}'
constants.STOCK_PATH =            '/_mobile/market/stock/{0}'
constants.FUND_PATH =             '/_mobile/market/fund/{0}'
constants.ORDERBOOK_PATH =        '/_mobile/order/{0}'
constants.ORDERBOOK_LIST_PATH =   '/_mobile/market/orderbooklist/{0}'
constants.CHARTDATA_PATH =        '/_mobile/chart/orderbook/{0}'
constants.ORDER_PATH =            '/_api/order'
constants.SEARCH_PATH =           '/_mobile/market/search/{0}'
constants.AUTHENTICATION_PATH =   '/_api/authentication/sessions/username'
constants.INSPIRATION_LIST_PATH = '/_mobile/marketing/inspirationlist/{0}'
constants.TRANSACTIONS_PATH =     '/_mobile/account/transactions/{0}'

/**
 * Search
 */
constants.STOCK =               'stock'
constants.FUND =                'fund'
constants.BOND =                'bond'
constants.OPTION =              'option'
constants.FUTURE_FORWARD =      'future_forward'
constants.CERTIFICATE =         'certificate'
constants.WARRANT =             'warrant'
constants.ETF =                 'exchange_traded_fund'
constants.INDEX =               'index'
constants.PREMIUM_BOND =        'premium_bond'
constants.SUBSCRIPTION_OPTION = 'subscription_option'
constants.EQUITY_LINKED_BOND =  'equity_linked_bond'
constants.CONVERTIBLE =         'convertible'

/**
 * Chartdata
 */
constants.TODAY =         'today'
constants.ONE_MONTH =     'one_month'
constants.THREE_MONTHS =  'three_months'
constants.ONE_WEEK =      'one_week'
constants.THIS_YEAR =     'this_year'
constants.ONE_YEAR =      'one_year'
constants.FIVE_YEARS =    'five_years'

/**
 * Marketing
 */
constants.HIGHEST_RATED_FUNDS = 'HIGHEST_RATED_FUNDS'
constants.LOWEST_FEE_INDEX_FUNDS = 'LOWEST_FEE_INDEX_FUNDS'
constants.BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS = 'BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS'
constants.MOST_OWNED_FUNDS = 'MOST_OWNED_FUNDS'

module.exports = constants
