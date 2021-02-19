import config from 'config';
import * as blurtjs from '@blurtfoundation/blurtjs';

const path = require('path');
const ROOT = path.join(__dirname, '../..');

// Tell `require` calls to look into `/app` also
// it will avoid `../../../../../` require strings

// use Object.assign to bypass transform-inline-environment-variables-babel-plugin (process.env.NODE_PATH= will not work)
Object.assign(process.env, { NODE_PATH: path.resolve(__dirname, '..') });

require('module').Module._initPaths();

// Load Intl polyfill
// require('utils/intl-polyfill')(require('./config/init').locales);
const alternativeApiEndpoints = config
    .get('alternative_api_endpoints')
    .split(' ');

global.$STM_Config = {
    fb_app: config.get('facebook_app_id'),
    blurtd_connection_client: config.get('blurtd_connection_client'),
    blurtd_connection_server: config.get('blurtd_connection_server'),
    blurtd_use_appbase: config.get('blurtd_use_appbase'),
    chain_id: config.get('chain_id'),
    address_prefix: config.get('address_prefix'),
    img_proxy_prefix: config.get('img_proxy_prefix'),
    ipfs_prefix: config.get('ipfs_prefix'),
    read_only_mode: config.get('read_only_mode'),
    upload_image: config.get('upload_image'),
    site_domain: config.get('site_domain'),
    google_analytics_id: config.get('google_analytics_id'),
    wallet_url: config.get('wallet_url'),
    failover_threshold: config.get('failover_threshold'),
    alternative_api_endpoints: alternativeApiEndpoints
};

const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const WebpackIsomorphicToolsConfig = require('../../webpack/webpack-isotools-config');

global.webpackIsomorphicTools = new WebpackIsomorphicTools(
    WebpackIsomorphicToolsConfig
);

global.webpackIsomorphicTools.server(ROOT, () => {
    blurtjs.api.setOptions({
        url: config.blurtd_connection_server,
        retry: {
            retries: 10,
            factor: 5,
            minTimeout: 50, // start at 50ms
            maxTimeout: 60 * 1000,
            randomize: true
        },
        useAppbaseApi: !!config.blurtd_use_appbase,
        alternative_api_endpoints: alternativeApiEndpoints,
        failover_threshold: config.get('failover_threshold')
    });
    blurtjs.config.set('address_prefix', config.get('address_prefix'));
    blurtjs.config.set('chain_id', config.get('chain_id'));

    // const CliWalletClient = require('shared/api_client/CliWalletClient').default;
    // if (process.env.NODE_ENV === 'production') connect_promises.push(CliWalletClient.instance().connect_promise());
    try {
        require('./server');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
