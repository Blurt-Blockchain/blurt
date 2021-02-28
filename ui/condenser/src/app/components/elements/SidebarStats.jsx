import React from 'react';

const SidebarStats = ({ operationFlatFee, bandwidthKbytesFee }) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">Transaction Fees</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list-small">
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>Operation Flat Fee</div>
                        <span>{operationFlatFee} BLURT</span>
                    </div>
                </li>
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>Bandwidth Fee</div>
                        <span>{bandwidthKbytesFee} BLURT</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
);

export default SidebarStats;
