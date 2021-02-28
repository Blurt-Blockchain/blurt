import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Slider from 'react-rangeslider';
import tt from 'counterpart';
import CloseButton from 'app/components/elements/CloseButton';
import * as transactionActions from 'app/redux/TransactionReducer';
import Icon from 'app/components/elements/Icon';
import {
    DEBT_TOKEN_SHORT,
    LIQUID_TOKEN_UPPERCASE,
    INVEST_TOKEN_SHORT,
} from 'app/client_config';
import FormattedAsset from 'app/components/elements/FormattedAsset';
import { pricePerSteem } from 'app/utils/StateFunctions';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {
    formatDecimal,
    parsePayoutAmount,
} from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Dropdown from 'app/components/elements/Dropdown';

const ABOUT_FLAG = (
    <div>
        <p>
            Downvoting a post can decrease pending rewards and make it less
            visible. Common reasons:
        </p>
        <ul>
            <li>Disagreement on rewards</li>
            <li>Fraud or plagiarism</li>
            <li>Hate speech or trolling</li>
            <li>Miscategorized content or spam</li>
        </ul>
    </div>
);

const MAX_VOTES_DISPLAY = 20;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 50; //if BP is more than 50, enable the slider
// const SBD_PRINT_RATE_MAX = 10000;
const MAX_WEIGHT = 10000;

class Voting extends React.Component {
    static propTypes = {
        // HTML properties
        post: PropTypes.string.isRequired,
        showList: PropTypes.bool,

        // Redux connect properties
        vote: PropTypes.func.isRequired,
        author: PropTypes.string, // post was deleted
        permlink: PropTypes.string,
        username: PropTypes.string,
        is_comment: PropTypes.bool,
        active_votes: PropTypes.object,
        loggedin: PropTypes.bool,
        post_obj: PropTypes.object,
        current_account: PropTypes.object,
        enable_slider: PropTypes.bool,
        voting: PropTypes.bool,
        // price_per_blurt: PropTypes.number,
        // sbd_print_rate: PropTypes.number,
    };

    static defaultProps = {
        showList: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            showWeight: false,
            myVote: null,
            sliderWeight: {
                up: MAX_WEIGHT,
                down: MAX_WEIGHT,
            },
        };

        this.voteUp = (e) => {
            e && e.preventDefault();
            this.voteUpOrDown(true);
        };
        this.voteDown = (e) => {
            e && e.preventDefault();
            this.voteUpOrDown(false);
        };
        this.voteUpOrDown = (up) => {
            if (this.props.voting) return;
            this.setState({ votingUp: up });
            if (this.state.showWeight) this.setState({ showWeight: false });
            const { myVote } = this.state;
            const { author, permlink, username, is_comment } = this.props;

            let weight;
            if (myVote > 0 || myVote < 0) {
                // if there is a current vote, we're clearing it
                weight = 0;
            } else if (this.props.enable_slider) {
                // if slider is enabled, read its value
                weight = up
                    ? this.state.sliderWeight.up
                    : -this.state.sliderWeight.down;
            } else {
                // otherwise, use max power
                weight = up ? MAX_WEIGHT : -MAX_WEIGHT;
            }

            const isFlag = up ? null : true;
            this.props.vote(weight, {
                author,
                permlink,
                username,
                myVote,
                isFlag,
            });
        };

        this.handleWeightChange = (up) => (weight) => {
            let w;
            if (up) {
                w = {
                    up: weight,
                    down: this.state.sliderWeight.down,
                };
            } else {
                w = {
                    up: this.state.sliderWeight.up,
                    down: weight,
                };
            }
            this.setState({ sliderWeight: w });
        };

        this.storeSliderWeight = (up) => () => {
            const { username, is_comment } = this.props;
            const weight = up
                ? this.state.sliderWeight.up
                : this.state.sliderWeight.down;
            localStorage.setItem(
                'voteWeight' +
                    (up ? '' : 'Down') +
                    '-' +
                    username +
                    (is_comment ? '-comment' : ''),
                weight
            );
        };
        this.readSliderWeight = () => {
            const { username, enable_slider, is_comment } = this.props;
            if (enable_slider) {
                const sliderWeightUp = Number(
                    localStorage.getItem(
                        'voteWeight' +
                            '-' +
                            username +
                            (is_comment ? '-comment' : '')
                    )
                );
                const sliderWeightDown = Number(
                    localStorage.getItem(
                        'voteWeight' +
                            'Down' +
                            '-' +
                            username +
                            (is_comment ? '-comment' : '')
                    )
                );
                this.setState({
                    sliderWeight: {
                        up: sliderWeightUp ? sliderWeightUp : MAX_WEIGHT,
                        down: sliderWeightDown ? sliderWeightDown : MAX_WEIGHT,
                    },
                });
            }
        };

        this.toggleWeightUp = (e) => {
            e.preventDefault();
            this.toggleWeightUpOrDown(true);
        };

        this.toggleWeightDown = (e) => {
            e && e.preventDefault();
            this.toggleWeightUpOrDown(false);
        };

        this.toggleWeightUpOrDown = (up) => {
            this.setState({
                showWeight: !this.state.showWeight,
                showWeightDir: up ? 'up' : 'down',
            });
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Voting');
    }

    componentWillMount() {
        const { username, active_votes } = this.props;
        this._checkMyVote(username, active_votes);
    }

    componentWillReceiveProps(nextProps) {
        const { username, active_votes } = nextProps;
        this._checkMyVote(username, active_votes);
    }

    _checkMyVote(username, active_votes) {
        if (username && active_votes) {
            const vote = active_votes.find(
                (el) => el.get('voter') === username
            );
            // weight warning, the API may send a string or a number (when zero)
            if (vote)
                this.setState({
                    myVote: parseInt(vote.get('percent') || 0, 10),
                });
        }
    }

    render() {
        const {
            active_votes,
            showList,
            voting,
            enable_slider,
            is_comment,
            post_obj,
            current_account,
            operationFlatFee,
            bandwidthKbytesFee,
            // price_per_blurt,
            // sbd_print_rate,
            username,
            author,
            permlink,
            blacklist,
            rewardBalance,
            recentClaims,
        } = this.props;

        const voting_manabar = current_account
            ? current_account.get('voting_manabar')
            : 0;
        const current_mana = voting_manabar
            ? voting_manabar.get('current_mana')
            : 0;
        const last_update_time = voting_manabar
            ? voting_manabar.get('last_update_time')
            : 0;
        const vesting_shares = current_account
            ? current_account.get('vesting_shares')
            : 0.0;

        const delegated_vesting_shares = current_account
            ? current_account.get('delegated_vesting_shares')
            : 0.0;

        const vesting_withdraw_rate = current_account
            ? current_account.get('vesting_withdraw_rate')
                ? current_account.get('vesting_withdraw_rate').split(' ')[0]
                : 0.0
            : 0.0;

        const received_vesting_shares = current_account
            ? current_account.get('received_vesting_shares')
            : 0.0;

        const net_vesting_shares =
            vesting_shares -
            delegated_vesting_shares +
            received_vesting_shares -
            Number(vesting_withdraw_rate);

        let elapsed = new Date() / 1000 - last_update_time;
        let maxMana = net_vesting_shares * 1000000;
        let currentMana =
            parseFloat(current_mana) + (elapsed * maxMana) / 432000;
        if (currentMana > maxMana) {
            currentMana = maxMana;
        }
        let currentVp = (currentMana * 100) / maxMana;
        let operation = {
            voter: username,
            author,
            permlink,
            weight: 10000,
        };
        let size = JSON.stringify(operation).replace(/[\[\]\,\"]/g, '').length;
        let bw_fee = Math.max(
            0.001,
            ((size / 1024) * bandwidthKbytesFee).toFixed(3)
        );
        let fee = (operationFlatFee + bw_fee).toFixed(3);
        let rshares = currentVp * 100 * parseInt(net_vesting_shares * 1e6, 10);
        let voteValue =
            (((rshares * (rshares + 2 * 2e12)) /
                (rshares + 4 * 2e12) /
                recentClaims) *
                parseFloat(rewardBalance)) /
            1000000;
        const { votingUp, showWeight, showWeightDir, myVote } = this.state;

        const votingUpActive = voting && votingUp;
        voteValue = (voteValue * this.state.sliderWeight.up) / 10000;
        const slider = (up) => {
            const b = up
                ? this.state.sliderWeight.up
                : this.state.sliderWeight.down;
            const s = up ? '' : '-';
            return (
                <span>
                    <div id="btn_group">
                        <button
                            id="weight-10"
                            onClick={this.handleButtonWeightChange(up, 1000)}
                        >
                            {' '}
                            10%{' '}
                        </button>
                        <button
                            id="weight-25"
                            onClick={this.handleButtonWeightChange(up, 2500)}
                        >
                            {' '}
                            25%{' '}
                        </button>
                        <button
                            id="weight-50"
                            onClick={this.handleButtonWeightChange(up, 5000)}
                        >
                            {' '}
                            50%{' '}
                        </button>
                        <button
                            id="weight-75"
                            onClick={this.handleButtonWeightChange(up, 7500)}
                        >
                            {' '}
                            75%{' '}
                        </button>
                        <button
                            id="weight-100"
                            onClick={this.handleButtonWeightChange(up, 10000)}
                        >
                            {' '}
                            100%{' '}
                        </button>
                    </div>
                    {votingUpActive ? (
                        <a
                            href="#"
                            onClick={() => null}
                            className="confirm_weight"
                            title={tt('g.upvote')}
                        >
                            <Icon size="2x" name={'empty'} />
                        </a>
                    ) : (
                        <a
                            href="#"
                            onClick={this.voteUp}
                            className="confirm_weight"
                            title={tt('g.upvote')}
                        >
                            <Icon size="2x" name="chevron-up-circle" />
                        </a>
                    )}
                    <div className="weight-display">{s + b / 100}%</div>
                    <Slider
                        min={100}
                        max={MAX_WEIGHT}
                        step={100}
                        value={b}
                        onChange={this.handleWeightChange(up)}
                        onChangeComplete={this.storeSliderWeight(up)}
                        tooltip={false}
                    />
                    {currentVp ? (
                        <div className="voting-power-display">
                            {tt('voting_jsx.vote_value')}:{' '}
                            {voteValue.toFixed(2)} BLURT
                            <br />
                            {tt('voting_jsx.voting_power')}:{' '}
                            {currentVp.toFixed(1)}%
                            <br />
                            {tt('g.transaction_fee')}: {fee} BLURT
                        </div>
                    ) : (
                        ''
                    )}
                </span>
            );
        };
        this.handleButtonWeightChange = (up, weight) => (e) => {
            let w;
            if (up) {
                w = {
                    up: weight,
                    down: this.state.sliderWeight.down,
                };
            } else {
                w = {
                    up: this.state.sliderWeight.up,
                    down: weight,
                };
            }
            this.setState({ sliderWeight: w });

            const { username, is_comment } = this.props;
            localStorage.setItem(
                'voteWeight' +
                    (up ? '' : 'Down') +
                    '-' +
                    username +
                    (is_comment ? '-comment' : ''),
                weight
            );
        };

        const total_votes = post_obj.getIn(['stats', 'total_votes']);

        const cashout_time = post_obj.get('cashout_time');
        const max_payout = parsePayoutAmount(
            post_obj.get('max_accepted_payout')
        );
        const pending_payout = parsePayoutAmount(
            post_obj.get('pending_payout_value')
        );
        // const pending_payout_sp = pending_payout / price_per_steem;

        const promoted = parsePayoutAmount(post_obj.get('promoted'));
        const total_author_payout = parsePayoutAmount(
            post_obj.get('total_payout_value')
        );
        const total_curator_payout = parsePayoutAmount(
            post_obj.get('curator_payout_value')
        );

        let payout =
            pending_payout + total_author_payout + total_curator_payout;
        if (payout < 0.0) payout = 0.0;
        if (payout > max_payout) payout = max_payout;
        const payout_limit_hit = payout >= max_payout;
        // Show pending payout amount for declined payment posts
        if (max_payout === 0) payout = pending_payout;
        const up = (
            <Icon
                name={votingUpActive ? 'empty' : 'chevron-up-circle'}
                className="upvote"
            />
        );
        const classUp =
            'Voting__button Voting__button-up' +
            (myVote > 0 ? ' Voting__button--upvoted' : '') +
            (votingUpActive ? ' votingUp' : '');

        // There is an "active cashout" if: (a) there is a pending payout, OR (b) there is a valid cashout_time AND it's NOT a comment with 0 votes.
        const cashout_active =
            pending_payout > 0 ||
            (cashout_time.indexOf('1969') !== 0 &&
                !(is_comment && total_votes == 0));
        const payoutItems = [];

        const minimumAmountForPayout = 0.02;
        let warnZeroPayout = '';
        if (pending_payout > 0 && pending_payout < minimumAmountForPayout) {
            warnZeroPayout = tt('voting_jsx.must_reached_minimum_payout');
        }

        if (cashout_active) {
            const payoutDate = (
                <span>
                    {tt('voting_jsx.payout')}{' '}
                    <TimeAgoWrapper date={cashout_time} />
                </span>
            );
            payoutItems.push({
                value: tt('voting_jsx.pending_payout', {
                    value: formatDecimal(pending_payout).join(''),
                }),
            });
            if (max_payout > 0) {
                payoutItems.push({
                    value: tt('voting_jsx.breakdown') + ': ',
                });
                payoutItems.push({
                    value: tt('voting_jsx.pending_payouts_author', {
                        value: formatDecimal(pending_payout / 2).join(''),
                    }),
                });
                payoutItems.push({
                    value: tt('voting_jsx.pending_payouts_curators', {
                        value: formatDecimal(pending_payout / 2).join(''),
                    }),
                });
            }
            // add beneficiary info.
            const beneficiaries = post_obj.get('beneficiaries');
            if (beneficiaries.size > 0) {
                payoutItems.push({
                    value: 'Beneficiaries:',
                });
                beneficiaries.forEach(function (key) {
                    payoutItems.push({
                        value:
                            '- ' +
                            key.get('account') +
                            ': ' +
                            (parseFloat(key.get('weight')) / 100).toFixed(2) +
                            '%',
                        link: '/@' + key.get('account'),
                    });
                });
            }

            payoutItems.push({ value: payoutDate });
            if (warnZeroPayout !== '') {
                payoutItems.push({ value: warnZeroPayout });
            }
        }

        if (max_payout == 0) {
            payoutItems.push({ value: tt('voting_jsx.payout_declined') });
        } else if (max_payout < 1000000) {
            payoutItems.push({
                value: tt('voting_jsx.max_accepted_payout', {
                    value: formatDecimal(max_payout).join(''),
                }),
            });
        }
        if (promoted > 0) {
            payoutItems.push({
                value: tt('voting_jsx.promotion_cost', {
                    value: formatDecimal(promoted).join(''),
                }),
            });
        }
        // - payout instead of total_author_payout: total_author_payout can be zero with 100% beneficiary
        // - !cashout_active is needed to avoid the info is also shown for pending posts.
        if (!cashout_active && payout > 0) {
            payoutItems.push({
                value: tt('voting_jsx.past_payouts', {
                    value: formatDecimal(
                        total_author_payout + total_curator_payout
                    ).join(''),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_author', {
                    value: formatDecimal(total_author_payout).join(''),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_curators', {
                    value: formatDecimal(total_curator_payout).join(''),
                }),
            });
        }
        const payoutEl = (
            <DropdownMenu el="div" items={payoutItems}>
                <span style={payout_limit_hit ? { opacity: '0.5' } : {}}>
                    <FormattedAsset
                        amount={payout}
                        asset="BLURT"
                        classname={max_payout === 0 ? 'strikethrough' : ''}
                    />
                    {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
                </span>
            </DropdownMenu>
        );

        let voters_list = null;
        if (showList && total_votes > 0 && active_votes) {
            const avotes = active_votes.toJS();
            let total_rshares = 0;
            // sum of rshares
            for (let v = 0; v < avotes.length; ++v) {
                const { rshares } = avotes[v];
                total_rshares += Number(rshares);
            }
            avotes.sort((a, b) =>
                Math.abs(parseInt(a.rshares)) > Math.abs(parseInt(b.rshares))
                    ? -1
                    : 1
            );
            let voters = [];
            for (
                let v = 0;
                v < avotes.length && voters.length < MAX_VOTES_DISPLAY;
                ++v
            ) {
                const { percent, voter, rshares } = avotes[v];
                const sign = Math.sign(percent);
                if (sign === 0) continue;
                voters.push({
                    value:
                        (sign > 0 ? '+ ' : '- ') +
                        voter +
                        ': ' +
                        ((payout * rshares) / total_rshares).toFixed(3) +
                        ' BLURT (' +
                        percent / 100 +
                        '%)',
                    link: '/@' + voter,
                });
            }
            if (total_votes > voters.length) {
                voters.push({
                    value: (
                        <span>
                            &hellip;{' '}
                            {tt('voting_jsx.and_more', {
                                count: total_votes - voters.length,
                            })}
                        </span>
                    ),
                });
            }
            voters_list = (
                <DropdownMenu
                    selected={tt('voting_jsx.votes_plural', {
                        count: total_votes,
                    })}
                    className="Voting__voters_list"
                    items={voters}
                    el="div"
                />
            );
        }

        let voteUpClick = this.voteUp;
        let dropdown = null;
        let voteChevron = votingUpActive ? (
            up
        ) : (
            <a
                href="#"
                onClick={voteUpClick}
                title={myVote > 0 ? tt('g.remove_vote') : tt('g.upvote')}
                id="upvote_button"
            >
                {up}
            </a>
        );
        if (myVote <= 0 && enable_slider) {
            voteUpClick = this.toggleWeightUp;
            voteChevron = null;
            // Vote weight adjust
            dropdown = (
                <Dropdown
                    show={showWeight && showWeightDir == 'up'}
                    onHide={() => this.setState({ showWeight: false })}
                    onShow={() => {
                        this.setState({
                            showWeight: true,
                            showWeightDir: 'up',
                        });
                        this.readSliderWeight();
                    }}
                    title={up}
                >
                    <div className="Voting__adjust_weight">
                        {slider(true)}
                        <CloseButton
                            className="Voting__adjust_weight_close"
                            onClick={() => this.setState({ showWeight: false })}
                        />
                    </div>
                </Dropdown>
            );
        }
        return (
            <span className="Voting">
                <span className="Voting__inner">
                    <span className={classUp}>
                        {voteChevron}
                        {dropdown}
                    </span>

                    {payoutEl}
                </span>
                {voters_list}
            </span>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const post = state.global.getIn(['content', ownProps.post]);
        if (!post) return ownProps;
        const author = post.get('author');
        const permlink = post.get('permlink');
        const active_votes = post.get('active_votes');
        const is_comment = post.get('parent_author') !== '';

        const current_account = state.user.get('current');
        const username = current_account
            ? current_account.get('username')
            : null;
        const vesting_shares = current_account
            ? current_account.get('vesting_shares')
            : 0.0;
        const delegated_vesting_shares = current_account
            ? current_account.get('delegated_vesting_shares')
            : 0.0;
        const received_vesting_shares = current_account
            ? current_account.get('received_vesting_shares')
            : 0.0;
        const net_vesting_shares =
            vesting_shares - delegated_vesting_shares + received_vesting_shares;
        const voting = state.global.get(
            `transaction_vote_active_${author}_${permlink}`
        );
        //const price_per_blurt = pricePerSteem(state);
        // const sbd_print_rate = state.global.getIn(['props', 'sbd_print_rate']);
        const recentClaims = state.global.getIn([
            'reward_fund',
            'recent_claims',
        ]);
        const rewardBalance = state.global.getIn([
            'reward_fund',
            'reward_balance',
        ]);
        const operationFlatFee = state.global.getIn([
            'props',
            'operation_flat_fee',
        ]);
        const bandwidthKbytesFee = state.global.getIn([
            'props',
            'bandwidth_kbytes_fee',
        ]);
        const blacklist = state.global.get('blacklist');
        const enable_slider =
            net_vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD;
        return {
            post: ownProps.post,
            showList: ownProps.showList,
            author,
            permlink,
            username,
            active_votes,
            enable_slider,
            is_comment,
            post_obj: post,
            current_account,
            loggedin: username != null,
            voting,
            operationFlatFee,
            bandwidthKbytesFee,
            blacklist,
            recentClaims,
            rewardBalance,
            // price_per_blurt,
            // sbd_print_rate,
        };
    },

    // mapDispatchToProps
    (dispatch) => ({
        vote: (weight, { author, permlink, username, myVote, isFlag }) => {
            const confirm = () => {
                if (myVote == null) return null;
                if (weight === 0)
                    return isFlag
                        ? tt('voting_jsx.removing_your_vote')
                        : tt(
                              'voting_jsx.removing_your_vote_will_reset_curation_rewards_for_this_post'
                          );
                if (weight > 0)
                    return isFlag
                        ? tt('voting_jsx.changing_to_an_upvote')
                        : tt(
                              'voting_jsx.changing_to_an_upvote_will_reset_curation_rewards_for_this_post'
                          );
                // if (weight < 0)
                //     return isFlag
                //         ? tt('voting_jsx.changing_to_a_downvote')
                //         : tt(
                //               'voting_jsx.changing_to_a_downvote_will_reset_curation_rewards_for_this_post'
                //           );
                return null;
            };
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: username,
                        author,
                        permlink,
                        weight,
                        __config: {
                            title: weight < 0 ? 'Confirm Downvote' : null,
                        },
                    },
                    confirm,
                    errorCallback: (errorKey) => {
                        console.log('Transaction Error:' + errorKey);
                    },
                })
            );
        },
    })
)(Voting);
