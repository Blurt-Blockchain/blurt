import * as blurtjs from '@blurtfoundation/blurtjs';

blurtjs.config.set('address_prefix', 'BLT');

let chain_id = '';
for (let i = 0; i < 32; i++) chain_id += '00';

module.exports = {
    address_prefix: 'BLT',
    expire_in_secs: 15,
    chain_id
};
