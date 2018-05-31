/* eslint-disable no-multi-spaces */

const constants = {
  paths: {},
  public: {}
}

/**
 * Paths
 */
constants.paths = {}
constants.paths.POSITIONS_PATH =             '/_mobile/account/positions'
constants.paths.OVERVIEW_PATH =              '/_mobile/account/overview'
constants.paths.ACCOUNT_OVERVIEW_PATH =      '/_mobile/account/{0}/overview'
constants.paths.DEALS_AND_ORDERS_PATH =      '/_mobile/account/dealsandorders'
constants.paths.WATCHLISTS_PATH =            '/_mobile/usercontent/watchlist'
constants.paths.WATCHLISTS_ADD_DELETE_PATH = '/_api/usercontent/watchlist/{0}/orderbooks/{1}'
constants.paths.STOCK_PATH =                 '/_mobile/market/stock/{0}'
constants.paths.FUND_PATH =                  '/_mobile/market/fund/{0}'
constants.paths.CERTIFICATE_PATH =           '/_mobile/market/certificate/{0}'
constants.paths.INSTRUMENT_PATH =            '/_mobile/market/{0}/{1}'
constants.paths.ORDERBOOK_PATH =             '/_mobile/order/{0}'
constants.paths.ORDERBOOK_LIST_PATH =        '/_mobile/market/orderbooklist/{0}'
constants.paths.CHARTDATA_PATH =             '/_mobile/chart/orderbook/{0}'
constants.paths.ORDER_PLACE_DELETE_PATH =    '/_api/order'
constants.paths.ORDER_EDIT_PATH =            '/_api/order/{0}/{1}'
constants.paths.ORDER_GET_PATH =             '/_mobile/order/{0}'
constants.paths.SEARCH_PATH =                '/_mobile/market/search/{0}'
constants.paths.AUTHENTICATION_PATH =        '/_api/authentication/sessions/usercredentials'
constants.paths.TOTP_PATH =                  '/_api/authentication/sessions/totp'
constants.paths.INSPIRATION_LIST_PATH =      '/_mobile/marketing/inspirationlist/{0}'
constants.paths.TRANSACTIONS_PATH =          '/_mobile/account/transactions/{0}'

/**
 * Search
 */
constants.public.STOCK =               'stock'
constants.public.FUND =                'fund'
constants.public.BOND =                'bond'
constants.public.OPTION =              'option'
constants.public.FUTURE_FORWARD =      'future_forward'
constants.public.CERTIFICATE =         'certificate'
constants.public.WARRANT =             'warrant'
constants.public.ETF =                 'exchange_traded_fund'
constants.public.INDEX =               'index'
constants.public.PREMIUM_BOND =        'premium_bond'
constants.public.SUBSCRIPTION_OPTION = 'subscription_option'
constants.public.EQUITY_LINKED_BOND =  'equity_linked_bond'
constants.public.CONVERTIBLE =         'convertible'

/**
 * Chartdata
 */
constants.public.TODAY =         'TODAY'
constants.public.ONE_MONTH =     'ONE_MONTH'
constants.public.THREE_MONTHS =  'THREE_MONTHS'
constants.public.ONE_WEEK =      'ONE_WEEK'
constants.public.THIS_YEAR =     'THIS_YEAR'
constants.public.ONE_YEAR =      'ONE_YEAR'
constants.public.FIVE_YEARS =    'FIVE_YEARS'

/**
 * Marketing
 */
constants.public.HIGHEST_RATED_FUNDS = 'HIGHEST_RATED_FUNDS'
constants.public.LOWEST_FEE_INDEX_FUNDS = 'LOWEST_FEE_INDEX_FUNDS'
constants.public.BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS = 'BEST_DEVELOPMENT_FUNDS_LAST_THREE_MONTHS'
constants.public.MOST_OWNED_FUNDS = 'MOST_OWNED_FUNDS'

/**
 * Transactions
 */
constants.public.OPTIONS =          'options'
constants.public.FOREX =            'forex'
constants.public.DEPOSIT_WITHDRAW = 'deposit-withdraw'
constants.public.BUY_SELL =         'buy-sell'
constants.public.DIVIDEND =         'dividend'
constants.public.INTEREST =         'interest'
constants.public.FOREIGN_TAX =      'foreign-tax'

/**
 * Channels
 */
constants.public.ACCOUNTS =           'accounts'
constants.public.QUOTES =             'quotes'
constants.public.ORDERDEPTHS =        'orderdepths'
constants.public.TRADES =             'trades'
constants.public.BROKERTRADESUMMARY = 'brokertradesummary'
constants.public.POSITIONS =          'positions'
constants.public.ORDERS =             'orders'
constants.public.DEALS =              'deals'

/**
 * Order types
 */
constants.public.BUY =  'BUY'
constants.public.SELL = 'SELL'

module.exports = constants
