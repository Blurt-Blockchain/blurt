import React from 'react';
import tt from 'counterpart';
import { FormattedDate } from 'react-intl';

export default class DateJoinWrapper extends React.Component {
    render() {
        const date = new Date(
            this.props.date === '1970-01-01T00:00:00'
                ? '2020-07-04T00:00:00'
                : this.props.date
        );
        return (
            <span>
                {tt('g.joined')}{' '}
                <FormattedDate value={date} year="numeric" month="long" />
            </span>
        );
    }
}
