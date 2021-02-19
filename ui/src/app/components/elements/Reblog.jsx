import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import * as transactionActions from 'app/redux/TransactionReducer';
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';

const { string, func } = PropTypes;

export default class Reblog extends React.Component {
    static propTypes = {
        account: string,
        author: string,
        parent_author: string,
        permlink: string,
        reblog: func
    };
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Reblog');
        this.state = { active: false, loading: false };
    }

    componentWillMount() {
        const { account } = this.props;
        if (account) {
            this.setState({ active: this.isReblogged(account) });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.account) {
            this.setState({ active: this.isReblogged(nextProps.account) });
        }
    }

    reblog = e => {
        e.preventDefault();
        if (this.state.active) return;
        this.setState({ loading: true });
        const {
            reblog,
            account,
            author,
            parent_author,
            permlink,
            bandwidth_kbytes_fee,
            operation_flat_fee
        } = this.props;
        reblog(
            account,
            author,
            permlink,
            operation_flat_fee,
            bandwidth_kbytes_fee,
            () => {
                this.setState({ active: true, loading: false });
                this.setReblogged(account);
            },
            () => {
                this.setState({ active: false, loading: false });
            }
        );
    };

    isReblogged(account) {
        const { author, permlink } = this.props;
        return getRebloggedList(account).includes(author + '/' + permlink);
    }

    setReblogged(account) {
        const { author, permlink } = this.props;
        clearRebloggedCache();
        let posts = getRebloggedList(account);
        posts.push(author + '/' + permlink);
        if (posts.length > 200) posts.shift(1);

        localStorage.setItem('reblogged_' + account, JSON.stringify(posts));
    }

    render() {
        if (this.props.author == this.props.account || this.props.parent_author)
            return null;

        const state = this.state.active ? 'active' : 'inactive';
        const loading = this.state.loading ? ' loading' : '';
        return (
            <span
                className={'Reblog__button Reblog__button-' + state + loading}
            >
                <a href="#" onClick={this.reblog} title={tt('g.reblog')}>
                    <Icon name="reblog" />
                </a>
            </span>
        );
    }
}
module.exports = connect(
    (state, ownProps) => {
        const account =
            state.user.getIn(['current', 'username']) ||
            state.offchain.get('account');
        return {
            ...ownProps,
            account,
            operation_flat_fee: state.global.getIn([
                'props',
                'operation_flat_fee'
            ]),
            bandwidth_kbytes_fee: state.global.getIn([
                'props',
                'bandwidth_kbytes_fee'
            ])
        };
    },
    dispatch => ({
        reblog: (
            account,
            author,
            permlink,
            operationFlatFee,
            bandwidthKbytesFee,
            successCallback,
            errorCallback
        ) => {
            const json = ['reblog', { account, author, permlink }];
            const operation = {
                id: 'follow',
                required_posting_auths: [account],
                json: JSON.stringify(json),
                __config: { title: tt('g.resteem_this_post') }
            };
            let size = JSON.stringify(operation).replace(/[\[\]\,\"]/g, '')
                .length;
            let bw_fee = Math.max(
                0.001,
                (size / 1024 * bandwidthKbytesFee).toFixed(3)
            );
            let fee = (operationFlatFee + bw_fee).toFixed(3);
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    confirm: tt('g.operation_cost', { fee }),
                    operation,
                    successCallback,
                    errorCallback
                })
            );
        }
    })
)(Reblog);

let lastAccount;
let cachedPosts;

function getRebloggedList(account) {
    if (!process.env.BROWSER) return [];

    if (lastAccount === account) return cachedPosts;

    lastAccount = account;
    const posts = localStorage.getItem('reblogged_' + account);
    try {
        cachedPosts = JSON.parse(posts) || [];
    } catch (e) {
        cachedPosts = [];
    }
    return cachedPosts;
}

function clearRebloggedCache() {
    lastAccount = null;
}
