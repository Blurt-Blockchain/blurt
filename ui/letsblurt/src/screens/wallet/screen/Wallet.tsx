//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {FlatList, Animated, StyleSheet, ScrollView, View} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {TabView, SceneMap} from 'react-native-tab-view';
import {argonTheme} from '~/constants';
import {WalletStatsView, WalletKeyView} from '~/components';
import {KeyTypes} from '~/contexts/types';
import {WalletData} from '~/contexts/types';

interface Props {
  walletData: WalletData;
  price: number;
  handlePressClaim: () => void;
  claiming: boolean;
  handlePressTransfer: (index: number) => void;
  onRefresh: () => void;
}
const WalletScreen = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  const [index, setIndex] = React.useState(0);
  // TODO: use intl
  const [routes] = React.useState([
    {key: 'stats', title: intl.formatMessage({id: 'Wallet.balances'})},
    {key: 'keys', title: intl.formatMessage({id: 'Wallet.keys'})},
  ]);

  const WalletStats = () => (
    <WalletStatsView
      walletData={props.walletData}
      isUser
      handlePressClaim={props.handlePressClaim}
      claiming={props.claiming}
      price={props.price}
      onRefresh={props.onRefresh}
      handlePressTransfer={props.handlePressTransfer}
    />
  );

  const WalletKeys = () => {
    return (
      <ScrollView>
        <Block style={{margin: 5}}>
          <Text h6>{intl.formatMessage({id: 'Wallet.keys_header'})}</Text>
          <Text>{intl.formatMessage({id: 'Wallet.keys_guide'})}</Text>

          <WalletKeyView type="posting" />
          <WalletKeyView type="active" />
          <WalletKeyView type="owner" />
          <WalletKeyView type="memo" />
          <Block
            card
            middle
            style={{
              shadowColor: argonTheme.COLORS.FACEBOOK,
              marginHorizontal: 5,
              marginVertical: 10,
              padding: 20,
            }}>
            <Text h6 color="red">
              {intl.formatMessage({id: 'Wallet.danger_zone'})}
            </Text>
            <Text> {intl.formatMessage({id: 'Wallet.danger_msg'})}</Text>
            <Button disabled size="large" color={argonTheme.COLORS.MUTED}>
              {intl.formatMessage({id: 'Wallet.change_master'})}
            </Button>
          </Block>
        </Block>
      </ScrollView>
    );
  };

  const renderScene = SceneMap({
    stats: WalletStats,
    keys: WalletKeys,
  });

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      tabBarPosition="top"
    />
  );
};

export {WalletScreen};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'green',
  },
  notification: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE / 2,
    paddingBottom: theme.SIZES.BASE * 1.5,
  },
  rows: {
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE * 1.25,
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
