import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Icon from './Icon';

class Blacklist extends Component {
    render() {
        const { blacklist, author } = this.props; //redux
        const blacklisted = blacklist.get(author);
        if (blacklisted !== undefined) {
            let description = `@${blacklisted.reported_by}: ${
                blacklisted.reason
            }\nIf you believe this is in error, please contact us in #appeals discord.blurt.world`;
            return (
                <span title={description}>
                    <Icon name="alert" />
                </span>
            );
        } else {
            return null;
        }
    }
}

export default connect((state, ownProps) => {
    const blacklist =
        state.global.getIn(['blacklist']) == undefined
            ? undefined
            : state.global.getIn(['blacklist']);
    return {
        blacklist
    };
})(Blacklist);
