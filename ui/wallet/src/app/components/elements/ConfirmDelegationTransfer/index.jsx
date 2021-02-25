import React from 'react';
import PropTypes from 'prop-types';

const ConfirmDelegationTransfer = ({ operation, amount, fee }) => {
    const info = Object.keys(operation).map((k, i) => {
        if (k === 'vesting_shares') {
            return (
                <div key={`transaction-group-${i}`} className="input-group">
                    <span
                        key={`transaction-label-${i}`}
                        className="input-group-label"
                    >
                        BLURT
                    </span>
                    <input
                        className="input-group-field"
                        type="text"
                        required
                        value={amount}
                        disabled={true}
                        key={`transaction-input-${i}`}
                    />
                </div>
            );
        }
        return (
            <div key={`transaction-group-${i}`} className="input-group">
                <span
                    key={`transaction-label-${i}`}
                    className="input-group-label"
                >
                    {k}
                </span>
                <input
                    className="input-group-field"
                    type="text"
                    required
                    value={operation[k]}
                    disabled={true}
                    key={`transaction-input-${i}`}
                />
            </div>
        );
    });
    return (
        <div className="info">
            {info}
            <span>Transaction Fee: {fee} BLURT</span>
        </div>
    );
};

ConfirmDelegationTransfer.propTypes = {
    operation: PropTypes.shape({
        delegator: PropTypes.string,
        delegatee: PropTypes.string,
        vesting_shares: PropTypes.string,
    }).isRequired,
};

export default ConfirmDelegationTransfer;
