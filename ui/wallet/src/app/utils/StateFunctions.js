import assert from 'assert';
import constants from 'app/redux/constants';
import { parsePayoutAmount, repLog10 } from 'app/utils/ParsersAndFormatters';
import { Long } from 'bytebuffer';
import { VEST_TICKER, LIQUID_TICKER } from 'app/client_config';
import { fromJS } from 'immutable';
import { formatter } from '@blurtfoundation/blurtjs';

export const numberWithCommas = (x) => x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function vestsToHpf(state, vesting_shares) {
    const { global } = state;
    let vests = vesting_shares;
    if (typeof vesting_shares === 'string') {
        vests = assetFloat(vesting_shares, VEST_TICKER);
    }
    const total_vests = assetFloat(
        global.getIn(['props', 'total_vesting_shares']),
        VEST_TICKER
    );
    const total_vest_blurt = assetFloat(
        global.getIn(['props', 'total_vesting_fund_blurt']),
        LIQUID_TICKER
    );
    return total_vest_blurt * (vests / total_vests);
}

export function vestsToHp(state, vesting_shares) {
    return vestsToHpf(state, vesting_shares).toFixed(3);
}

export function spToVestsf(state, blurt_power) {
    const { global } = state;
    let power = blurt_power;
    if (typeof power === 'string') {
        power = assetFloat(power, LIQUID_TICKER);
    }
    const total_vests = assetFloat(
        global.getIn(['props', 'total_vesting_shares']),
        VEST_TICKER
    );
    const total_vest_blurt = assetFloat(
        global.getIn(['props', 'total_vesting_fund_blurt']),
        LIQUID_TICKER
    );
    return (blurt_power / total_vest_blurt) * total_vests;
}

export function spToVests(state, vesting_shares) {
    return spToVestsf(state, vesting_shares).toFixed(6);
}

export function vestingBlurt(account, gprops) {
    const vests = parseFloat(account.vesting_shares.split(' ')[0]);
    const total_vests = parseFloat(gprops.total_vesting_shares.split(' ')[0]);
    const total_vest_blurt = parseFloat(
        gprops.total_vesting_fund_blurt.split(' ')[0]
    );
    const vesting_blurtf = total_vest_blurt * (vests / total_vests);
    return vesting_blurtf;
}

// How much BLURT this account has delegated out (minus received).
export function delegatedBlurt(account, gprops) {
    const delegated_vests = parseFloat(
        account.delegated_vesting_shares.split(' ')[0]
    );
    const received_vests = parseFloat(
        account.received_vesting_shares.split(' ')[0]
    );
    const vests = delegated_vests - received_vests;
    const total_vests = parseFloat(gprops.total_vesting_shares.split(' ')[0]);
    const total_vest_blurt = parseFloat(
        gprops.total_vesting_fund_blurt.split(' ')[0]
    );
    const vesting_blurtf = total_vest_blurt * (vests / total_vests);
    return vesting_blurtf;
}

// How much BLURT this account is powering down.
export function powerdownBlurt(account, gprops) {
    const withdraw_rate_vests = parseFloat(
        account.vesting_withdraw_rate.split(' ')[0]
    );
    const remaining_vests =
        (parseFloat(account.to_withdraw) - parseFloat(account.withdrawn)) /
        1000000;
    const vests = Math.min(withdraw_rate_vests, remaining_vests);
    const total_vests = parseFloat(gprops.total_vesting_shares.split(' ')[0]);
    const total_vest_blurt = parseFloat(
        gprops.total_vesting_fund_blurt.split(' ')[0]
    );
    const powerdown_blurtf = total_vest_blurt * (vests / total_vests);
    return powerdown_blurtf;
}

export function assetFloat(str, asset) {
    try {
        assert.equal(typeof str, 'string');
        assert.equal(typeof asset, 'string');
        assert(
            new RegExp(`^\\d+(\\.\\d+)? ${asset}$`).test(str),
            'Asset should be formatted like 99.99 ' + asset + ': ' + str
        );
        return parseFloat(str.split(' ')[0]);
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

export function isFetchingOrRecentlyUpdated(global_status, order, category) {
    const status = global_status
        ? global_status.getIn([category || '', order])
        : null;
    if (!status) return false;
    if (status.fetching) return true;
    if (status.last_fetch) {
        const res =
            new Date() - status.last_fetch <
            constants.FETCH_DATA_EXPIRE_SEC * 1000;
        return res;
    }
    return false;
}

export function contentStats(content) {
    if (!content) return {};
    if (!(content instanceof Map)) content = fromJS(content);

    let net_rshares_adj = Long.ZERO;
    let neg_rshares = Long.ZERO;
    let total_votes = 0;
    let up_votes = 0;

    // TODO: breaks if content has no active_votes attribute.

    content.get('active_votes').forEach((v) => {
        const sign = Math.sign(v.get('percent'));
        if (sign === 0) return;
        total_votes += 1;
        if (sign > 0) up_votes += 1;

        const rshares = String(v.get('rshares'));

        // For flag weight: count total neg rshares
        if (sign < 0) {
            neg_rshares = neg_rshares.add(rshares);
        }

        // For graying: sum up total rshares from voters with non-neg reputation.
        if (String(v.get('reputation')).substring(0, 1) !== '-') {
            // And also ignore tiny downvotes (9 digits or less)
            if (!(rshares.substring(0, 1) === '-' && rshares.length < 11)) {
                net_rshares_adj = net_rshares_adj.add(rshares);
            }
        }
    });

    // take negative rshares, divide by 2, truncate 10 digits (plus neg sign), count digits.
    // creates a cheap log10, stake-based flag weight. 1 = approx $400 of downvoting stake; 2 = $4,000; etc
    const flagWeight = Math.max(String(neg_rshares.div(2)).length - 11, 0);

    // post must have non-trivial negative rshares to be grayed out. (more than 10 digits)
    const grayThreshold = -9999999999;
    const meetsGrayThreshold = net_rshares_adj.compare(grayThreshold) < 0;

    // to be eligible for deletion, a comment must have non-positive rshares and no replies
    const hasPositiveRshares = Long.fromString(
        String(content.get('net_rshares'))
    ).gt(Long.ZERO);
    const allowDelete = !hasPositiveRshares && content.get('children') === 0;
    const hasPendingPayout =
        parsePayoutAmount(content.get('pending_payout_value')) >= 0.02;
    const authorRepLog10 = repLog10(content.get('author_reputation'));

    const gray =
        !hasPendingPayout && (authorRepLog10 < 1 || meetsGrayThreshold);
    const hide = !hasPendingPayout && authorRepLog10 < 0; // rephide

    // Combine tags+category to check nsfw status
    const json = content.get('json_metadata');
    let tags = [];
    try {
        tags = (json && JSON.parse(json).tags) || [];
        if (typeof tags == 'string') {
            tags = [tags];
        }
        if (!Array.isArray(tags)) {
            tags = [];
        }
    } catch (e) {
        tags = [];
    }
    tags.push(content.get('category'));
    tags = filterTags(tags);
    const isNsfw = tags.filter((tag) => tag && tag.match(/^nsfw$/i)).length > 0;

    return {
        hide,
        gray,
        authorRepLog10,
        allowDelete,
        isNsfw,
        flagWeight,
        total_votes,
        up_votes,
        hasPendingPayout,
    };
}

export function filterTags(tags) {
    return tags
        .filter((tag) => typeof tag === 'string')
        .filter((value, index, self) => value && self.indexOf(value) === index);
}

export function pricePerBlurt(state) {
    let price = state.global.get('blurt_price');
    return price;
}
