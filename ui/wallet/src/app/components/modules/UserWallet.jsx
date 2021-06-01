/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import { List } from 'immutable';
import SavingsWithdrawHistory from 'app/components/elements/SavingsWithdrawHistory';
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import {
    numberWithCommas,
    vestingBlurt,
    delegatedBlurt,
    powerdownBlurt,
    pricePerBlurt,
} from 'app/utils/StateFunctions';
import WalletSubMenu from 'app/components/elements/WalletSubMenu';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip';
import { FormattedHTMLMessage } from 'app/Translator';
import {
    LIQUID_TOKEN,
    LIQUID_TOKEN_UPPERCASE,
    LIQUID_TICKER,
    DEBT_TOKENS,
    VESTING_TOKEN,
} from 'app/client_config';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as globalActions from 'app/redux/GlobalReducer';
import DropdownMenu from 'app/components/elements/DropdownMenu';

const assetPrecision = 1000;

class UserWallet extends React.Component {
    constructor() {
        super();
        this.state = {
            claimInProgress: false,
        };
        this.onShowDepositBlurt = (e) => {
            if (e && e.preventDefault) e.preventDefault();
            const name = this.props.currentUser.get('username');
            const new_window = window.open();
            new_window.opener = null;
            new_window.location =
                'https://blocktrades.us/?input_coin_type=eth&output_coin_type=blurt&receive_address=' +
                name;
        };
        this.onShowWithdrawBlurt = (e) => {
            e.preventDefault();
            const new_window = window.open();
            new_window.opener = null;
            new_window.location =
                'https://blocktrades.us/unregistered_trade/blurt/eth';
        };
        this.onShowDepositPower = (currentUserName, e) => {
            e.preventDefault();
            const new_window = window.open();
            new_window.opener = null;
            new_window.location =
                'https://blocktrades.us/?input_coin_type=eth&output_coin_type=blurt_power&receive_address=' +
                currentUserName;
        };

        this.shouldComponentUpdate = shouldComponentUpdate(this, 'UserWallet');
    }

    handleClaimRewards = (account) => {
        this.setState({ claimInProgress: true }); // disable the claim button
        this.props.claimRewards(account);
    };

    getCurrentApr = (gprops) => {
        // The inflation was set to 10.0% at block 0
        const initialInflationRate = 10;
        const initialBlock = 0;

        // It decreases by 0.01% every 250k blocks
        const decreaseRate = 250000;
        const decreasePercentPerIncrement = 0.01;

        // How many increments have happened since block 0?
        const headBlock = gprops.head_block_number;
        const deltaBlocks = headBlock - initialBlock;
        const decreaseIncrements = deltaBlocks / decreaseRate;

        // Current inflation rate
        let currentInflationRate =
            initialInflationRate -
            decreaseIncrements * decreasePercentPerIncrement;

        // Cannot go lower than 0.95%
        if (currentInflationRate < 0.95) {
            currentInflationRate = 0.95;
        }

        // Now lets calculate the "APR"
        const vestingRewardPercent = gprops.vesting_reward_percent / 10000;
        const currentSupply = gprops.current_supply.split(' ').shift();
        const totalVestingFunds = gprops.total_vesting_fund_blurt
            .split(' ')
            .shift();
        return (
            (currentSupply * currentInflationRate * vestingRewardPercent) /
            totalVestingFunds
        );
    };

    render() {
        const { onShowDepositBlurt, onShowWithdrawBlurt, onShowDepositPower } =
            this;
        const {
            convertToBlurt,
            price_per_blurt,
            savings_withdraws,
            account,
            currentUser,
            open_orders,
        } = this.props;
        const gprops = this.props.gprops.toJS();

        // do not render if account is not loaded or available
        if (!account) return null;

        // do not render if state appears to contain only lite account info
        if (!account.has('vesting_shares')) return null;

        let vesting_blurt = vestingBlurt(account.toJS(), gprops);
        let delegated_blurt = delegatedBlurt(account.toJS(), gprops);
        let powerdown_blurt = powerdownBlurt(account.toJS(), gprops);

        let isMyAccount =
            currentUser && currentUser.get('username') === account.get('name');

        const disabledWarning = false;
        // isMyAccount = false; // false to hide wallet transactions

        const showTransfer = (asset, transferType, e) => {
            e.preventDefault();
            this.props.showTransfer({
                to: isMyAccount ? null : account.get('name'),
                asset,
                transferType,
            });
        };

        const savings_balance = account.get('savings_balance');

        const powerDown = (cancel, e) => {
            e.preventDefault();
            const name = account.get('name');
            if (cancel) {
                const vesting_shares = cancel
                    ? '0.000000 VESTS'
                    : account.get('vesting_shares');
                this.setState({ toggleDivestError: null });
                const errorCallback = (e2) => {
                    this.setState({ toggleDivestError: e2.toString() });
                };
                const successCallback = () => {
                    this.setState({ toggleDivestError: null });
                };
                this.props.withdrawVesting({
                    account: name,
                    vesting_shares,
                    errorCallback,
                    successCallback,
                });
            } else {
                const to_withdraw = account.get('to_withdraw');
                const withdrawn = account.get('withdrawn');
                const vesting_shares = account.get('vesting_shares');
                const delegated_vesting_shares = account.get(
                    'delegated_vesting_shares'
                );
                this.props.showPowerdown({
                    account: name,
                    to_withdraw,
                    withdrawn,
                    vesting_shares,
                    delegated_vesting_shares,
                });
            }
        };

        // Sum savings withrawals
        // let savings_pending = 0,
        // if (savings_withdraws) {
        //     savings_withdraws.forEach((withdraw) => {
        //         const [amount, asset] = withdraw.get('amount').split(' ');
        //         if (asset === 'BLURT') savings_pending += parseFloat(amount);
        //     });
        // }

        // Sum conversions
        const currentTime = new Date().getTime();
        const conversions = account
            .get('other_history', List())
            .reduce((out, item) => {
                if (item.getIn([1, 'op', 0], '') !== 'convert') return out;

                const timestamp = new Date(
                    item.getIn([1, 'timestamp'])
                ).getTime();
                const finishTime = timestamp + 86400000 * 3.5; // add 3.5day conversion delay
                if (finishTime < currentTime) return out;

                return out.concat([
                    <div key={item.get(0)}>
                        <Tooltip
                            t={tt('userwallet_jsx.conversion_complete_tip', {
                                date: new Date(finishTime).toLocaleString(),
                            })}
                        >
                            <span>
                                (+
                                {tt('userwallet_jsx.in_conversion', {
                                    amount: numberWithCommas(
                                        '$' + amount.toFixed(3)
                                    ),
                                })}
                                )
                            </span>
                        </Tooltip>
                    </div>,
                ]);
            }, []);

        const balance_blurt = parseFloat(account.get('balance').split(' ')[0]);
        const saving_balance_blurt = parseFloat(savings_balance.split(' ')[0]);
        const divesting =
            parseFloat(account.get('vesting_withdraw_rate').split(' ')[0]) >
            0.0;
        const blurtOrders =
            !open_orders || !isMyAccount
                ? 0
                : open_orders.reduce((o, order) => {
                      if (order.sell_price.base.indexOf('BLURT') !== -1) {
                          o += order.for_sale;
                      }
                      return o;
                  }, 0) / assetPrecision;

        // set displayed estimated value

        const total_blurt =
            vesting_blurt + balance_blurt + saving_balance_blurt + blurtOrders;
        let total_value =
            '$' + numberWithCommas((total_blurt * price_per_blurt).toFixed(2));

        // format spacing on estimated value based on account state
        let estimate_output = <p>{total_value}</p>;
        if (isMyAccount) {
            estimate_output = <p>{total_value}&nbsp; &nbsp; &nbsp;</p>;
        }
        let conversion = <p></p>;
        if (price_per_blurt) {
            conversion = <p>(1 BLURT = ${price_per_blurt})</p>;
        }

        /// transfer log
        let idx = 0;
        const transfer_log = account
            .get('transfer_history')
            .map((item) => {
                const data = item.getIn([1, 'op', 1]);
                const type = item.getIn([1, 'op', 0]);

                // Filter out rewards
                if (
                    type === 'curation_reward' ||
                    type === 'author_reward' ||
                    type === 'comment_benefactor_reward'
                ) {
                    return null;
                }

                if (data.vesting_payout === '0.000000 VESTS') return null;
                return (
                    <TransferHistoryRow
                        key={idx++}
                        op={item.toJS()}
                        context={account.get('name')}
                    />
                );
            })
            .filter((el) => !!el)
            .reverse();

        let blurt_menu = [
            {
                value: tt('userwallet_jsx.transfer'),
                link: '#',
                onClick: showTransfer.bind(
                    this,
                    'BLURT',
                    'Transfer to Account'
                ),
            },
            {
                value: tt('userwallet_jsx.transfer_to_savings'),
                link: '#',
                onClick: showTransfer.bind(
                    this,
                    'BLURT',
                    'Transfer to Savings'
                ),
            },
            {
                value: tt('userwallet_jsx.power_up'),
                link: '#',
                onClick: showTransfer.bind(
                    this,
                    'VESTS',
                    'Transfer to Account'
                ),
            },
        ];
        let power_menu = [
            {
                value: tt('userwallet_jsx.power_down'),
                link: '#',
                onClick: powerDown.bind(this, false),
            },
            {
                value: tt('userwallet_jsx.delegate'),
                link: '#',
                onClick: showTransfer.bind(
                    this,
                    'DELEGATE_VESTS',
                    'Delegate to Account'
                ),
            },
        ];

        if (divesting) {
            power_menu.push({
                value: 'Cancel Power Down',
                link: '#',
                onClick: powerDown.bind(this, true),
            });
        }

        const blurt_balance_str = numberWithCommas(balance_blurt.toFixed(3));
        const blurt_orders_balance_str = numberWithCommas(
            blurtOrders.toFixed(3)
        );
        const power_balance_str = numberWithCommas(vesting_blurt.toFixed(3));
        const received_power_balance_str =
            (delegated_blurt < 0 ? '+' : '') +
            numberWithCommas((-delegated_blurt).toFixed(3));
        const powerdown_balance_str = numberWithCommas(
            powerdown_blurt.toFixed(3)
        );
        const savings_balance_str = numberWithCommas(
            saving_balance_blurt.toFixed(3) + ' BLURT'
        );

        const savings_menu = [
            {
                value: tt('userwallet_jsx.withdraw_LIQUID_TOKEN', {
                    LIQUID_TOKEN_UPPERCASE,
                }),
                link: '#',
                onClick: showTransfer.bind(this, 'BLURT', 'Savings Withdraw'),
            },
        ];

        const reward_blurt =
            parseFloat(account.get('reward_blurt_balance').split(' ')[0]) > 0
                ? account.get('reward_blurt_balance')
                : null;
        const reward_hp =
            parseFloat(account.get('reward_vesting_blurt').split(' ')[0]) > 0
                ? account.get('reward_vesting_blurt').replace('BLURT', 'BP')
                : null;
        let rewards = [];
        if (reward_blurt) rewards.push(reward_blurt);
        if (reward_hp) rewards.push(reward_hp);

        let rewards_str;
        switch (rewards.length) {
            case 3:
                rewards_str = `${rewards[0]}, ${rewards[1]} and ${rewards[2]}`;
                break;
            case 2:
                rewards_str = `${rewards[0]} and ${rewards[1]}`;
                break;
            case 1:
                rewards_str = `${rewards[0]}`;
                break;
        }

        let claimbox;
        if (currentUser && rewards_str && isMyAccount) {
            claimbox = (
                <div className="row">
                    <div className="columns small-12">
                        <div className="UserWallet__claimbox">
                            <span className="UserWallet__claimbox-text">
                                Your current rewards: {rewards_str}
                            </span>
                            <button
                                disabled={this.state.claimInProgress}
                                className="button"
                                onClick={(e) => {
                                    this.handleClaimRewards(account);
                                }}
                            >
                                {tt('userwallet_jsx.redeem_rewards')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        let hpApr;
        try {
            // TODO: occasionally fails. grops not loaded yet?
            console.log(gprops);
            hpApr = this.getCurrentApr(gprops);
        } catch (e) {}

        return (
            <div className="UserWallet">
                {claimbox}
                <div className="row">
                    <div className="columns small-10 medium-12 medium-expand">
                        <WalletSubMenu
                            accountname={account.get('name')}
                            isMyAccount={isMyAccount}
                        />
                    </div>
                </div>
                <div className="UserWallet__balance row">
                    <div className="column small-12 medium-8">
                        BLURT
                        <FormattedHTMLMessage
                            className="secondary"
                            id="tips_js.liquid_token"
                            params={{ LIQUID_TOKEN, VESTING_TOKEN }}
                        />
                    </div>
                    <div className="column small-12 medium-4">
                        {isMyAccount ? (
                            <DropdownMenu
                                className="Wallet_dropdown"
                                items={blurt_menu}
                                el="li"
                                selected={blurt_balance_str + ' BLURT'}
                            />
                        ) : (
                            blurt_balance_str + ' BLURT'
                        )}
                        {blurtOrders ? (
                            <div
                                style={{
                                    paddingRight: isMyAccount
                                        ? '0.85rem'
                                        : null,
                                }}
                            >
                                <Link to="/market">
                                    <Tooltip t={tt('market_jsx.open_orders')}>
                                        (+{blurt_orders_balance_str} BLURT)
                                    </Tooltip>
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="UserWallet__balance row zebra">
                    <div className="column small-12 medium-8">
                        BLURT POWER
                        <FormattedHTMLMessage
                            className="secondary"
                            id="tips_js.influence_token"
                        />
                        {delegated_blurt != 0 ? (
                            <span className="secondary">
                                {tt(
                                    'tips_js.part_of_your_blurt_power_is_currently_delegated',
                                    { user_name: account.get('name') }
                                )}
                            </span>
                        ) : null}
                        {hpApr && (
                            <FormattedHTMLMessage
                                className="secondary"
                                id="tips_js.blurt_power_apr"
                                params={{ value: hpApr.toFixed(2) }}
                            />
                        )}{' '}
                    </div>
                    <div className="column small-12 medium-4">
                        {isMyAccount ? (
                            <DropdownMenu
                                className="Wallet_dropdown"
                                items={power_menu}
                                el="li"
                                selected={power_balance_str + ' BLURT'}
                            />
                        ) : (
                            power_balance_str + ' BLURT'
                        )}
                        {delegated_blurt != 0 ? (
                            <div
                                style={{
                                    paddingRight: isMyAccount
                                        ? '0.85rem'
                                        : null,
                                }}
                            >
                                <Tooltip t="BLURT POWER delegated to/from this account">
                                    ({received_power_balance_str} BLURT)
                                </Tooltip>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="UserWallet__balance row">
                    <div className="column small-12 medium-8">
                        {tt('userwallet_jsx.savings')}
                        <div className="secondary">
                            <span>
                                {tt(
                                    'transfer_jsx.balance_subject_to_3_day_withdraw_waiting_period'
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="column small-12 medium-4">
                        {isMyAccount ? (
                            <DropdownMenu
                                className="Wallet_dropdown"
                                items={savings_menu}
                                el="li"
                                selected={savings_balance_str}
                            />
                        ) : (
                            savings_balance_str
                        )}
                    </div>
                </div>
                <div className="UserWallet__balance row zebra">
                    <div className="column small-12 medium-8">
                        {tt('userwallet_jsx.estimated_account_value')}
                        <div className="secondary">
                            {tt('tips_js.estimated_value', { LIQUID_TOKEN })}
                        </div>
                    </div>
                    <div className="column small-12 medium-4">
                        {estimate_output} {conversion}
                    </div>
                </div>
                <div className="UserWallet__balance row">
                    <div className="column small-12">
                        {powerdown_blurt != 0 && (
                            <span>
                                {tt(
                                    'userwallet_jsx.next_power_down_is_scheduled_to_happen'
                                )}{' '}
                                <TimeAgoWrapper
                                    date={account.get(
                                        'next_vesting_withdrawal'
                                    )}
                                />{' '}
                                {'(~' + powerdown_balance_str + ' BLURT)'}.
                            </span>
                        )}
                    </div>
                </div>
                {disabledWarning && (
                    <div className="row">
                        <div className="column small-12">
                            <div className="callout warning">
                                {tt(
                                    'userwallet_jsx.transfers_are_temporary_disabled'
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="row">
                    <div className="column small-12">
                        <hr />
                    </div>
                </div>

                {isMyAccount && <SavingsWithdrawHistory />}

                <div className="row">
                    <div className="column small-12">
                        {/** history */}
                        <h4>{tt('userwallet_jsx.history')}</h4>
                        <div className="secondary">
                            <span>
                                {tt(
                                    'transfer_jsx.beware_of_spam_and_phishing_links'
                                )}
                            </span>
                            &nbsp;
                            <span>
                                {tt(
                                    'transfer_jsx.transactions_make_take_a_few_minutes'
                                )}
                            </span>
                        </div>
                        <table>
                            <tbody>{transfer_log}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const price_per_blurt = pricePerBlurt(state);
        const savings_withdraws = state.user.get('savings_withdraws');
        const gprops = state.global.get('props');
        return {
            ...ownProps,
            open_orders: state.market.get('open_orders'),
            price_per_blurt,
            savings_withdraws,
            gprops,
        };
    },
    // mapDispatchToProps
    (dispatch) => ({
        claimRewards: (account) => {
            const username = account.get('name');
            const successCallback = () => {
                dispatch(
                    globalActions.getState({ url: `@${username}/transfers` })
                );
            };

            const operation = {
                account: username,
                reward_blurt: account.get('reward_blurt_balance'),
                //reward_sbd: account.get('reward_sbd_balance'),
                reward_vests: account.get('reward_vesting_balance'),
            };

            dispatch(
                transactionActions.broadcastOperation({
                    type: 'claim_reward_balance',
                    operation,
                    successCallback,
                })
            );
        },
        convertToBlurt: (e) => {
            //post 2018-01-31 if no calls to this function exist may be safe to remove. Investigate use of ConvertToBlurt.jsx
            e.preventDefault();
            const name = 'convertToBlurt';
            dispatch(globalActions.showDialog({ name }));
        },
    })
)(UserWallet);
