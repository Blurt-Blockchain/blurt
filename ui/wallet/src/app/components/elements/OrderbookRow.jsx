import React from 'react';
import PropTypes from 'prop-types';

export default class OrderRow extends React.Component {
    static propTypes = {
        order: PropTypes.object,
        side: PropTypes.string,
        index: PropTypes.number,
        total: PropTypes.number,
        animate: PropTypes.bool,
    };

    constructor(props) {
        super();

        this.state = {
            animate: props.animate && props.index !== 9,
            rowIndex: props.index,
        };

        this.timeout = null;
    }

    componentDidMount() {
        if (this.state.animate) {
            this._clearAnimate();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.rowIndex !== nextProps.index) {
            return this.setState({
                rowIndex: nextProps.index,
            });
        }

        if (!this.props.order.equals(nextProps.order)) {
            return this.setState({ animate: true }, this._clearAnimate);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !this.props.order.equals(nextProps.order) ||
            this.props.total !== nextProps.total ||
            this.state.animate !== nextState.animate
        );
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    _clearAnimate() {
        setTimeout(() => {
            this.setState({
                animate: false,
            });
        }, 1000);
    }

    render() {
        const { order, side, total } = this.props;
        const bid = side === 'bids';

        const totalTD = <td>{total.toFixed(3)}</td>;
        const hbd = <td>{order.getStringHBD()}</td>;
        const blurt = <td>{order.getStringBlurt()}</td>;
        const price = (
            <td>
                <strong>{order.getStringPrice()}</strong>
            </td>
        );

        return (
            <tr
                onClick={this.props.onClick.bind(this, order.price)}
                className={this.state.animate ? 'animate' : ''}
            >
                {bid ? totalTD : price}
                {bid ? hbd : blurt}
                {bid ? blurt : hbd}
                {bid ? price : totalTD}
            </tr>
        );
    }
}
