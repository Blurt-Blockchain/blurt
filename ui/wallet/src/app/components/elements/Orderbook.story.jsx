import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import Orderbook from './Orderbook';

const selectOptions = ['error', 'default'];

const mockOrder = {
    getHBDAmount: () => 999,
    getStringHBD: () => 'nine hundred and ninety nine',
    getStringBlurt: () => 'two hundred blurt',
    getStringPrice: () => '55',
    equals: () => 55,
};

const mockOrder2 = {
    getHBDAmount: () => 111,
    getStringHBD: () => 'one hundred and eleven',
    getStringBlurt: () => 'one blurt',
    getStringPrice: () => '55',
    equals: () => 55,
};

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('Orderbook', () => (
        <Orderbook
            side={'bids'}
            orders={[mockOrder, mockOrder2]}
            onClick={(price) => {
                setFormPrice(price);
            }}
        />
    ));
