import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import Callout from 'app/components/elements/Callout';
import Icon from 'app/components/elements/Icon';
import Userpic from 'app/components/elements/Userpic';
import tt from 'counterpart';

const notificationsIcon = (type) => {
    const types = {
        reply: 'chatbox',
        reply_post: 'chatbox',
        reply_comment: 'chatbox',
        follow: 'voters',
        set_label: 'pencil2',
        set_role: 'pencil2',
        error: 'cog',
        reblog: 'reblog',
        mention: 'chatboxes',
        transfer: 'transfer',
        witness_vote: 'witness',
    };

    let icon = 'chain';
    if (type in types) {
        icon = types[type];
    } else {
        console.error('no icon for type: ', type);
    }

    return <Icon size="0_8x" name={icon} />;
};

const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {' '}
            {parts.map((part, i) => (
                <span
                    key={i}
                    style={
                        part.toLowerCase() === highlight.toLowerCase()
                            ? { fontWeight: 'bold' }
                            : {}
                    }
                >
                    {part}
                </span>
            ))}{' '}
        </span>
    );
};

const pic = (author) => {
    return (
        <a href={'/@' + author}>
            <Userpic account={author} />
        </a>
    );
};

class NotificationsList extends React.Component {
    static propTypes = {
        username: PropTypes.string.isRequired,
        markAsRead: PropTypes.func.isRequired,
    };

    static defaultProps = {
        notifications: [],
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { username, getAccountNotifications } = this.props;
        if (username) {
            getAccountNotifications(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountNotifications } = this.props;
        if (prevProps.username !== username) {
            getAccountNotifications(username);
        }
    }

    onClickMarkAsRead = (e) => {
        e.preventDefault();
        const { username, markAsRead } = this.props;
        markAsRead(username);
    };

    render() {
        const { notifications, isOwnAccount, accountName } = this.props;
        const renderItem = (item, index) => {
            let lastRead = localStorage.getItem('last_timestamp');
            const unRead = lastRead <= item.timestamp;
            let key = `${index}${item.timestamp}`;
            if (item.type === 'mention') {
                let type = item.type;
                let account = item.author;
                let timestamp = item.timestamp;
                let permlink = item.permlink;
                return (
                    <div key={key} className="notification__item flex-body">
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.mention', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'transfer') {
                let type = item.type;
                let account = item.from;
                let timestamp = item.timestamp;
                let amount = item.amount;
                return (
                    <div key={key} className="notification__item flex-body">
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a
                                    href={`https://blurtwallet.com/@${accountName}/transfers`}
                                >
                                    {highlightText(
                                        `${tt(
                                            'notificationsList_jsx.transfer',
                                            { account, amount }
                                        )}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'reply') {
                let type = item.type;
                let account = item.author;
                let timestamp = item.timestamp;
                let permlink = item.permlink;
                return (
                    <div key={key} className="notification__item flex-body">
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.reply', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'reblog') {
                let type = item.type;
                let account = item.account;
                let timestamp = item.timestamp;
                let permlink = item.permlink;
                return (
                    <div key={key} className="notification__item flex-body">
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${accountName}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.reblog', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'follow') {
                let type = item.type;
                let account = item.follower;
                let timestamp = item.timestamp;
                return (
                    <div key={key} className="notification__item flex-body">
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.follow', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'witness_vote') {
                let type = item.type;
                let account = item.account;
                let timestamp = item.timestamp;
                return (
                    <div key={key} className="notification__item flex-body">
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}`}>
                                    {highlightText(
                                        `${tt(
                                            'notificationsList_jsx.witness_vote',
                                            {
                                                account,
                                            }
                                        )}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            }
        };

        return (
            <div className="">
                {isOwnAccount}
                {notifications && notifications.length > 0 && (
                    <center>
                        <br />
                        <a href="#" onClick={this.onClickMarkAsRead}>
                            <strong>
                                {tt('notificationsList_jsx.mark_all_as_read')}
                            </strong>
                        </a>
                        <br />
                    </center>
                )}

                {notifications && notifications.length > 0 && (
                    <div style={{ lineHeight: '1rem' }}>
                        {notifications.map((item) => renderItem(item))}
                    </div>
                )}
                {!notifications && process.env.BROWSER && (
                    <Callout>
                        Welcome! You don't have any notifications yet.
                    </Callout>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const accountName = props.username;
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountName;
        const notifications = state.global
            .getIn(['notifications', accountName, 'notifications'], List())
            .toJS();
        return {
            ...props,
            isOwnAccount,
            accountName,
            notifications,
        };
    },
    (dispatch) => ({
        getAccountNotifications: (username) => {
            const query = {
                account: username,
            };
            return dispatch(
                fetchDataSagaActions.getAccountNotifications(query)
            );
        },
        markAsRead: (username) => {
            const query = {
                account: username,
            };
            if (typeof localStorage != 'undefined') {
                localStorage.setItem(
                    'last_timestamp',
                    Math.floor(Date.now() / 1000)
                );
            }

            return dispatch(
                fetchDataSagaActions.getAccountNotifications(query)
            );
        },
    })
)(NotificationsList);
