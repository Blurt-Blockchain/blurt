import { api } from '@blurtfoundation/blurtjs';
import axios from 'axios';
import { Client } from '@busyorg/busyjs';

import stateCleaner from 'app/redux/stateCleaner';

export async function getStateAsync(url) {
    // strip off query string
    url = url.split('?')[0];

    // strip off leading and trailing slashes
    if (url.length > 0 && url[0] == '/') url = url.substring(1, url.length);
    if (url.length > 0 && url[url.length - 1] == '/')
        url = url.substring(0, url.length - 1);

    // blank URL defaults to `trending`
    if (url === '') url = 'hot';

    // curation and author rewards pages are alias of `transfers`
    if (url.indexOf('/curation-rewards') !== -1)
        url = url.replace('/curation-rewards', '/transfers');
    if (url.indexOf('/author-rewards') !== -1)
        url = url.replace('/author-rewards', '/transfers');

    const raw = await api.getStateAsync(url);
    let chainProperties = await getChainProperties();
    if (chainProperties) {
        raw.props.operation_flat_fee = parseFloat(
            chainProperties.operation_flat_fee
        );
        raw.props.bandwidth_kbytes_fee = parseFloat(
            chainProperties.bandwidth_kbytes_fee
        );
    }
    let rewardFund = await getRewardFund();
    if (rewardFund) {
        raw.reward_fund = rewardFund;
    }
    await axios
        .get('https://api.blurt.buzz/tags', { timeout: 3000 })
        .then(response => {
            if (response.status === 200) {
                raw.recommended_tags = response.data;
            }
        })
        .catch(error => {
            console.error(error);
        });
    await axios
        .get('https://api.blurt.buzz/blacklist', { timeout: 3000 })
        .then(response => {
            let map = new Map();
            if (response.status === 200) {
                for (let data of response.data) {
                    map.set(data.name, data);
                }
                raw.blacklist = map;
            }
        })
        .catch(error => {
            console.error(error);
        });
    await axios
        .get('https://api.blurt.buzz/price_info', { timeout: 3000 })
        .then(response => {
            if (response.status === 200) {
                raw.price_info = response.data;
            }
        })
        .catch(error => {
            console.error(error);
        });

    const cleansed = stateCleaner(raw);
    return cleansed;
}

function getChainProperties() {
    return new Promise(resolve => {
        api.getChainProperties((err, result) => {
            if (result) {
                resolve(result);
            } else {
                resolve({});
            }
        });
    });
}
function getRewardFund() {
    return new Promise(resolve => {
        api.getRewardFund('post', (err, result) => {
            if (result) {
                resolve(result);
            } else {
                resolve({});
            }
        });
    });
}
export async function callNotificationsApi(account) {
    console.log('call notifications api', account);
    return new Promise((resolve, reject) => {
        const client = new Client('wss://notifications.blurt.world');
        client.call('get_notifications', [account], (err, result) => {
            if (err !== null) reject(err);
            resolve(result);
        });
    });
}
