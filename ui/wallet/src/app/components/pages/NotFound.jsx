import React from 'react';
import { Link } from 'react-router';
import BlurtLogo from 'app/components/elements/BlurtLogo';

class NotFound extends React.Component {
    render() {
        return (
            <div>
                <div className="Header__top header">
                    <div className="columns">
                        <div className="top-bar-left">
                            <ul className="menu">
                                <li className="Header__top-logo">
                                    <a href="/">
                                        <BlurtLogo />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="NotFound float-center">
                    <div>
                        <h4 className="NotFound__header">
                            Sorry! This page doesn't exist.
                        </h4>
                        <p>
                            Not to worry. You can head back to{' '}
                            <a style={{ fontWeight: 800 }} href="/">
                                our homepage
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: '*',
    component: NotFound,
};
