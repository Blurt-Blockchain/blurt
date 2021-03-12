// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME = 'Blurt';
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN = 'Blurt';
export const APP_NAME_UPPERCASE = 'BLURT';
export const APP_ICON = 'blurt';
// FIXME figure out best way to do this on both client and server from env
// vars. client should read $STM_Config, server should read config package.
export const APP_URL = 'https://blurt.blog';
export const APP_DOMAIN = 'blurt.blog';
export const LIQUID_TOKEN = 'Blurt';
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const LIQUID_TOKEN_UPPERCASE = 'BLURT';
export const VESTING_TOKEN = 'BLURT POWER';
export const INVEST_TOKEN_UPPERCASE = 'BLURT POWER';
export const INVEST_TOKEN_SHORT = 'BP';
export const DEBT_TOKEN = 'BLURT DOLLAR';
export const DEBT_TOKENS = 'BLURT DOLLARS';
export const CURRENCY_SIGN = '$';
export const WIKI_URL = ''; // https://wiki.golos.io/
export const LANDING_PAGE_URL = 'https://blurt.io/';
export const TERMS_OF_SERVICE_URL = 'https://' + APP_DOMAIN + '/tos.html';
export const PRIVACY_POLICY_URL = 'https://' + APP_DOMAIN + '/privacy.html';
export const WHITEPAPER_URL = 'https://blurt.io/blurt-whitepaper.pdf';

// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = 'BLURT';
export const VEST_TICKER = 'VESTS';
export const DEBT_TICKER = 'HBD';
export const DEBT_TOKEN_SHORT = 'HBD';

// application settings
export const DEFAULT_LANGUAGE = 'en'; // used on application internationalization bootstrap
export const DEFAULT_CURRENCY = 'USD';
export const ALLOWED_CURRENCIES = ['USD'];
export const FRACTION_DIGITS = 2; // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3; // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = '@blurtblocks';
export const SHARE_IMAGE =
    'https://' + APP_DOMAIN + '/images/blurt-blog-share.png';
export const TWITTER_SHARE_IMAGE =
    'https://' + APP_DOMAIN + '/images/blurt-blog-twshare.png';
export const SITE_DESCRIPTION =
    'Blurt.blog is a social media platform where everyone gets paid for ' +
    'creating and curating content. It leverages a robust digital points system, called Blurt, that ' +
    'supports real value for digital rewards through market price discovery and liquidity';

// various
export const SUPPORT_EMAIL = 'support@' + APP_DOMAIN;
