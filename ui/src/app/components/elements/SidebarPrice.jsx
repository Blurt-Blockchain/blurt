import React from 'react';

const SidebarPrice = ({ price_info }) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">BLURT Price</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list-small">
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>Price</div>
                        <span>${price_info.get('price_usd').toFixed(3)}</span>
                    </div>
                </li>
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>High</div>
                        <span>{price_info.get('high')} BTC/BLURT</span>
                    </div>
                </li>
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>Low</div>
                        <span>{price_info.get('low')} BTC/BLURT</span>
                    </div>
                </li>
                <li className="c-sidebar__list-item">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>Change</div>
                        <span>{price_info.get('change')} %</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
);

export default SidebarPrice;
