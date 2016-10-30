'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * General settings
 */
var BASE_URL = exports.BASE_URL = 'www.avanza.se';
var PORT = exports.PORT = 443;
var USER_AGENT = exports.USER_AGENT = 'Avanza/se.avanza.iphone (2.6.2 - (#165); iOS 9.3.1)';
var MAX_INACTIVE_MINUTES = exports.MAX_INACTIVE_MINUTES = '1440';

/**
 * Paths
 */
var SOCKET_URL = exports.SOCKET_URL = 'wss://www.avanza.se/_push/cometd';
var POSITIONS_PATH = exports.POSITIONS_PATH = '/_mobile/account/positions';
var OVERVIEW_PATH = exports.OVERVIEW_PATH = '/_mobile/account/overview';
var ACCOUNT_OVERVIEW_PATH = exports.ACCOUNT_OVERVIEW_PATH = '/_mobile/account/{0}/overview';
var DEALS_AND_ORDERS_PATH = exports.DEALS_AND_ORDERS_PATH = '/_mobile/account/dealsandorders';
var WATCHLISTS_PATH = exports.WATCHLISTS_PATH = '/_mobile/usercontent/watchlist';
var WATCHLISTS_ADD_PATH = exports.WATCHLISTS_ADD_PATH = '/_api/usercontent/watchlist/{0}/orderbooks/{1}';
var STOCK_PATH = exports.STOCK_PATH = '/_mobile/market/stock/{0}';
var FUND_PATH = exports.FUND_PATH = '/_mobile/market/fund/{0}';
var ORDERBOOK_PATH = exports.ORDERBOOK_PATH = '/_mobile/order/{0}';
var ORDERBOOK_LIST_PATH = exports.ORDERBOOK_LIST_PATH = '/_mobile/market/orderbooklist/{0}';
var CHARTDATA_PATH = exports.CHARTDATA_PATH = '/_mobile/chart/orderbook/{0}';
var ORDER_PATH = exports.ORDER_PATH = '/_api/order';
var SEARCH_PATH = exports.SEARCH_PATH = '/_mobile/market/search/{0}';
var AUTHENTICATION_PATH = exports.AUTHENTICATION_PATH = '/_api/authentication/sessions/username';
var NOTIFICATION_DELETE_PATH = exports.NOTIFICATION_DELETE_PATH = '/ab/larm/kurslarm/delete/{0}';
var NOTIFICATION_CREATE_PATH = exports.NOTIFICATION_CREATE_PATH = '/ab/larm/kurslarm/save';

/**
 * Search
 */
var STOCK = exports.STOCK = 'stock';
var FUND = exports.FUND = 'fund';
var BOND = exports.BOND = 'bond';
var OPTION = exports.OPTION = 'option';
var FUTURE_FORWARD = exports.FUTURE_FORWARD = 'future_forward';
var CERTIFICATE = exports.CERTIFICATE = 'certificate';
var WARRANT = exports.WARRANT = 'warrant';
var ETF = exports.ETF = 'exchange_traded_fund';
var INDEX = exports.INDEX = 'index';
var PREMIUM_BOND = exports.PREMIUM_BOND = 'premium_bond';
var SUBSCRIPTION_OPTION = exports.SUBSCRIPTION_OPTION = 'subscription_option';
var EQUITY_LINKED_BOND = exports.EQUITY_LINKED_BOND = 'equity_linked_bond';
var CONVERTIBLE = exports.CONVERTIBLE = 'convertible';

/**
 * Chartdata
 */
var TODAY = exports.TODAY = 'today';
var ONE_MONTH = exports.ONE_MONTH = 'one_month';
var THREE_MONTHS = exports.THREE_MONTHS = 'three_months';
var ONE_WEEK = exports.ONE_WEEK = 'one_week';
var THIS_YEAR = exports.THIS_YEAR = 'this_year';
var ONE_YEAR = exports.ONE_YEAR = 'one_year';
var FIVE_YEARS = exports.FIVE_YEARS = 'five_years';

/**
 * Notifications
 */
var PUSH_NOTIFICATION = exports.PUSH_NOTIFICATION = 'PUSH_NOTIFICATION';
var EMAIL = exports.EMAIL = 'EMAIL';
var SMS = exports.SMS = 'SMS';
var ABOVE_OR_EQUAL = exports.ABOVE_OR_EQUAL = 'ABOVE';
var BELOW_OR_EQUAL = exports.BELOW_OR_EQUAL = 'BELOW';