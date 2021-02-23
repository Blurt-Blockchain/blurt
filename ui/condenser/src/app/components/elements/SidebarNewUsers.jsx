import React from 'react';
import tt from 'counterpart';
import { SIGNUP_URL } from 'shared/constants';

const SidebarNewUsers = () => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">Explore Blurt?</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list">
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href="/welcome">
                        Quick start guide
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href="https://blocks.blurtwallet.com"
                    >
                        Block Explorer
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href="https://blurtwallet.com/~witnesses"
                    >
                        Vote for Witnesses
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href="https://blurtwallet.com/proposals"
                    >
                        Blurt Proposals
                    </a>
                </li>
                {/*<li className="c-sidebar__list-item">*/}
                {/*    <a className="c-sidebar__link" href="https://steem.io">*/}
                {/*        The blockchain*/}
                {/*    </a>*/}
                {/*</li>*/}
                {/*<li className="c-sidebar__list-item">*/}
                {/*    <a className="c-sidebar__link" href="/faq.html">*/}
                {/*        FAQs*/}
                {/*    </a>*/}
                {/*</li>*/}
                {/*<li className="c-sidebar__list-item">*/}
                {/*    <a className="c-sidebar__link" href={SIGNUP_URL}>*/}
                {/*        Sign up*/}
                {/*    </a>*/}
                {/*</li>*/}
                {/*<li className="c-sidebar__list-item">*/}
                {/*    <a className="c-sidebar__link" href="/@steemitblog">*/}
                {/*        {tt('g.read_offical_blog')}*/}
                {/*    </a>*/}
                {/*</li>*/}
            </ul>
        </div>
    </div>
);

export default SidebarNewUsers;
