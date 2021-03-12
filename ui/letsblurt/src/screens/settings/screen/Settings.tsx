//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  Switch,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
//// language
import {useIntl} from 'react-intl';
////
import {navigate} from '~/navigation/service';
//// UIs
import {Button, Icon, Block, Input, Text, theme} from 'galio-framework';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
const {height, width} = Dimensions.get('window');
import {BLURT_MAINNETS, BLURT_IMAGE_SERVERS} from '~/constants/blockchain';
import {APP_IOS_VERSION, APP_ANDROID_VERSION} from '~/constants/app';
import {SUPPORTED_LOCALES, LOCALE} from '~/locales';
import {SettingUITypes} from '../container/Settings';

//// props
interface Props {
  translationLanguages: string[];
  renderItem: (item) => JSX.Element;
}
const SettingsScreen = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  //// effects

  // blockchains
  const blockchainItems = [
    {
      title: intl.formatMessage({id: 'Settings.rpc_server'}),
      id: SettingUITypes.RPC_SERVER,
      type: 'dropdown',
      defaultText: BLURT_MAINNETS[0],
      options: BLURT_MAINNETS,
    },
    {
      title: intl.formatMessage({id: 'Settings.image_server'}),
      id: SettingUITypes.IMAGE_SERVER,
      type: 'dropdown',
      defaultText: BLURT_IMAGE_SERVERS[0],
      options: BLURT_IMAGE_SERVERS,
    },
  ];

  // securities
  const securityItems = [
    {
      title: intl.formatMessage({id: 'Settings.auto_login'}),
      id: SettingUITypes.USE_AUTO_LOGIN,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.use_otp'}),
      id: SettingUITypes.USE_OTP,
      type: 'switch',
    },
  ];
  // push notifications
  const notificationItems = [
    {
      title: intl.formatMessage({id: 'Settings.dnd'}),
      id: SettingUITypes.DND_TIMES,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_beneficiary'}),
      id: SettingUITypes.BENEFICIARY,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_reply'}),
      id: SettingUITypes.REPLY,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_mention'}),
      id: SettingUITypes.MENTION,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_follow'}),
      id: SettingUITypes.FOLLOW,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_transfer'}),
      id: SettingUITypes.TRANSFER,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_reblog'}),
      id: SettingUITypes.REBLOG,
      type: 'switch',
    },
    // {
    //   title: intl.formatMessage({id: 'Settings.notify_vote'}),
    //   id: SettingUITypes.VOTE,
    //   type: 'switch',
    // },
  ];

  const generalItems = [
    {
      title: intl.formatMessage({id: 'Settings.locale'}),
      id: SettingUITypes.LOCALE,
      type: 'dropdown',
      defaultText: SUPPORTED_LOCALES[0].name,
      options: SUPPORTED_LOCALES.map((item) => item.name),
    },
    {
      title: intl.formatMessage({id: 'Settings.translation'}),
      id: SettingUITypes.TRANSLATION,
      type: 'dropdown',
      defaultText: 'EN',
      options: props.translationLanguages,
    },
    {
      title: intl.formatMessage({id: 'Settings.notice'}),
      id: SettingUITypes.NOTICE,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.rate_app'}),
      id: SettingUITypes.RATE_APP,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.share'}),
      id: SettingUITypes.SHARE,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.feedback'}),
      id: SettingUITypes.FEEDBACK,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.app_version'}),
      id: SettingUITypes.APP_VERSION,
      type: 'text',
      defaultText: Platform.OS =='android' ? APP_ANDROID_VERSION : APP_IOS_VERSION,
    },
    {
      title: intl.formatMessage({id: 'Settings.terms'}),
      id: SettingUITypes.TERMS,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.privacy'}),
      id: SettingUITypes.PRIVACY,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.about'}),
      id: SettingUITypes.ABOUT,
      type: 'button',
    },
  ];

  return (
    <ScrollView>
      <FlatList
        data={blockchainItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.blockchain_settings'})}
            </Text>
          </Block>
        }
      />
      <FlatList
        data={securityItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.security'})}
            </Text>
          </Block>
        }
      />
      <FlatList
        data={notificationItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.notification'})}
            </Text>
          </Block>
        }
      />
      <FlatList
        data={generalItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.general'})}
            </Text>
          </Block>
        }
      />
    </ScrollView>
  );
};

export {SettingsScreen};

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
  },
});
