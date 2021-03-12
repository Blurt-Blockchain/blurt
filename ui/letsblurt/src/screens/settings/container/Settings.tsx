//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Switch,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// UIs
import {Button, Icon, Block, Input, Text, theme} from 'galio-framework';
import {materialTheme} from '~/constants/materialTheme';
const {height, width} = Dimensions.get('window');
import {argonTheme} from '~/constants';
import {DropdownModal} from '~/components';
import ModalDropdown from 'react-native-modal-dropdown';
//// storage
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-community/async-storage';
//// contexts
import {AuthContext, SettingsContext, UIContext} from '~/contexts';
//// screens
import {SettingsScreen} from '../screen/Settings';
import {DNDTimes} from '~/components';
//// constants
import {BLURT_MAINNETS, BLURT_IMAGE_SERVERS} from '~/constants/blockchain';
import {SUPPORTED_LOCALES} from '~/locales';

//// times
import moment, {locale} from 'moment';
import {StorageSchema} from '~/contexts/types';
import {setBlockchainClient} from '~/providers/blurt/dblurtApi';
// start date and time: 1AM
const DATE1 = new Date(2021, 12, 12, 1, 0, 0);
// local time offset in hours from UTC+0
const UTC_OFFSET_IN_MINUTES = DATE1.getTimezoneOffset();

// settings types for UI statues
export enum SettingUITypes {
  // push notifications
  REPLY = 'reply',
  VOTE = 'vote',
  TRANSFER = 'transfer',
  BENEFICIARY = 'beneficiary',
  MENTION = 'mention',
  FOLLOW = 'follow',
  REBLOG = 'reblog',
  // dnd times
  DND_TIMES = 'dnd_times',
  // languages
  LOCALE = 'locale',
  TRANSLATION = 'translation',
  // blockchain
  RPC_SERVER = 'rpc_server',
  IMAGE_SERVER = 'image_server',
  // securities
  USE_OTP = 'use_otp',
  USE_AUTO_LOGIN = 'use_auto_login',
  NSFW = 'nsfw',
  // general
  NOTICE = 'notice',
  TERMS = 'terms',
  PRIVACY = 'privacy',
  RATE_APP = 'rate_app',
  APP_VERSION = 'app_version',
  SHARE = 'share',
  FEEDBACK = 'feedback',
  ABOUT = 'about',
}

interface Props {}
const SettingsContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {authState, processLogout} = useContext(AuthContext);
  const {settingsState, updateSettingSchema} = useContext(SettingsContext);
  const {uiState, setLanguageParam, setToastMessage} = useContext(UIContext);
  //// states
  const [username, setUsername] = useState(null);
  // switches
  const [switchStates, setSwitchStates] = useState({});
  // dnd
  const [showDND, setShowDND] = useState(false);
  const [showStartClock, setShowStartClock] = useState(false);
  const [showEndClock, setShowEndClock] = useState(false);
  const [startDNDTime, setStartDNDTime] = useState(
    settingsState.dndTimes.startTime,
  );
  const [endDNDTime, setEndDNDTime] = useState(
    settingsState.dndTimes.startTime,
  );
  // dropdowns: rpc server, image server,
  const [rpcServer, setRPCServer] = useState(settingsState.blockchains.rpc);
  const [imageServer, setImageServer] = useState(
    settingsState.blockchains.image,
  );
  const [locale, setLocale] = useState(settingsState.languages.locale);
  const [translation, setTranslation] = useState(
    settingsState.languages.translation,
  );

  //// effects
  // event: mount
  useEffect(() => {
    _getInitialSettings();
  }, []);

  //// get initial settings
  const _getInitialSettings = async () => {
    if (authState.loggedIn) {
      console.log('_getInitialSettings', settingsState);
      // get username
      const _username = authState.currentCredentials.username;
      setUsername(_username);

      ////// set settings states
      // destructure the settgins
      const {
        pushNotifications,
        blockchains,
        dndTimes,
        languages,
        securities,
        ui,
      } = settingsState;
      //// switch states
      let _switchStates = switchStates;
      // push notifications
      pushNotifications.forEach((item: string) => {
        _switchStates = {..._switchStates, [item]: true};
      });
      // securities: {useOTP, useAutoLogin}
      _switchStates = {
        ..._switchStates,
        [SettingUITypes.USE_OTP]: securities.useOTP,
        [SettingUITypes.USE_AUTO_LOGIN]: securities.useAutoLogin,
      };
      // ui
      _switchStates = {..._switchStates, [SettingUITypes.NSFW]: ui.nsfw};
      //// dropdown states
      // blockchain rpc server
      setRPCServer(blockchains.rpc);
      // blockchain image server
      setImageServer(blockchains.image);
      // locale
      setLocale(languages.locale);
      // translation
      setTranslation(languages.translation);
      //// dnd time states
      if (dndTimes.startTime) {
        setStartDNDTime(dndTimes.startTime);
        setEndDNDTime(dndTimes.endTime);
        console.log(
          '_getInitialSettings. startTime, endTime',
          dndTimes.startTime,
          dndTimes.endTime,
        );
        // switch
        _switchStates = {..._switchStates, [SettingUITypes.DND_TIMES]: true};
      }

      // now set switch states
      setSwitchStates(_switchStates);
    }
  };

  //// get notifications state
  const _buildNotificationsStates = (itemId: string, value: boolean) => {
    const beneficiary = switchStates[SettingUITypes.BENEFICIARY];
    const reply = switchStates[SettingUITypes.REPLY];
    const mention = switchStates[SettingUITypes.MENTION];
    const follow = switchStates[SettingUITypes.FOLLOW];
    const transfer = switchStates[SettingUITypes.TRANSFER];
    const vote = switchStates[SettingUITypes.VOTE];
    const reblog = switchStates[SettingUITypes.REBLOG];
    // delegate
    let notifications = [];
    if (beneficiary) notifications.push(SettingUITypes.BENEFICIARY);
    if (reply) notifications.push(SettingUITypes.REPLY);
    if (mention) notifications.push(SettingUITypes.MENTION);
    if (follow) notifications.push(SettingUITypes.MENTION);
    if (transfer) notifications.push(SettingUITypes.TRANSFER);
    if (vote) notifications.push(SettingUITypes.VOTE);
    if (reblog) notifications.push(SettingUITypes.REBLOG);

    // handle the event item
    if (value) {
      // update the value of the event item
      notifications = [...notifications, itemId];
    } else {
      // remove the event item
      notifications = notifications.filter(
        (notification) => notification !== itemId,
      );
    }
    console.log('[_buildNotificationsStates] notifications', notifications);
    return notifications;
  };

  //// handle switch events: push notifications, securities, dnd times, ui
  const _handleToggleSwitch = async (key: SettingUITypes, value: boolean) => {
    // check logged in
    if (!authState.loggedIn) return;

    console.log('[_handleToggleSwitch] key, value', key, value);
    // update the switch state
    setSwitchStates({...switchStates, [key]: value});
    // firebase user doc ref
    const userRef = firestore().doc(`users/${username}`);
    // securities
    let _securities = null;
    // actions
    switch (key) {
      // securities
      case SettingUITypes.USE_AUTO_LOGIN:
        // build structure
        _securities = {
          useAutoLogin: value,
          useOTP: switchStates[SettingUITypes.USE_OTP],
        };
        // update context state and storage
        updateSettingSchema(StorageSchema.SECURITIES, _securities);
        break;
      case SettingUITypes.USE_OTP:
        // build structure
        _securities = {
          useAutoLogin: switchStates[SettingUITypes.USE_AUTO_LOGIN],
          useOTP: value,
        };
        // update context state and storage
        updateSettingSchema(StorageSchema.SECURITIES, _securities);
        break;
      // dnd time
      case SettingUITypes.DND_TIMES:
        // clear dnd times in db if dnd is not set
        let _dndTimes = null;
        // update only if value is true
        if (value) {
          // convert the local time to the UTC0 time
          _dndTimes = [
            _convertTimeToUTC0(startDNDTime),
            _convertTimeToUTC0(endDNDTime),
          ];
          // update time in context state and storage
          updateSettingSchema(StorageSchema.DND_TIMES, {
            start: _dndTimes[0],
            end: _dndTimes[1],
          });
        }
        // update times in firestore
        userRef.update({
          dndTimes: _dndTimes,
        });
        break;
      // push notifications
      case SettingUITypes.BENEFICIARY:
      case SettingUITypes.REPLY:
      case SettingUITypes.MENTION:
      case SettingUITypes.FOLLOW:
      case SettingUITypes.TRANSFER:
      case SettingUITypes.VOTE:
      case SettingUITypes.REBLOG:
        // build push notification structure
        const _notifications = _buildNotificationsStates(key, value);
        // update in firestore
        if (userRef) {
          userRef.update({
            pushNotifications: _notifications,
          });
        }
        // update in context state
        updateSettingSchema(StorageSchema.PUSH_NOTIFICATIONS, _notifications);
        break;
      case SettingUITypes.NSFW:
        // build structure
        const _ui = {nsfw: value};
        // update in context state
        updateSettingSchema(StorageSchema.UI, _ui);
        break;
      default:
        break;
    }
  };

  //// handle dropdown events: rpc server, locale, translation language
  const _handleDropdownChange = async (
    uiType: SettingUITypes,
    index: number,
    value: string,
  ) => {
    // check logged in
    if (!authState.loggedIn) return;

    console.log(
      '[_handleDropdownChange] uiType, index, value',
      uiType,
      index,
      value,
    );
    // firebase user doc ref
    const userRef = firestore().doc(`users/${username}`);
    let _blockchains = null;
    let _languages = null;
    switch (uiType) {
      case SettingUITypes.RPC_SERVER:
        // check if the input value is the same as the current value
        if (rpcServer === value) return;
        // update state
        setRPCServer(value);
        // build structure
        _blockchains = {rpc: value, image: imageServer};
        // update in context state
        updateSettingSchema(StorageSchema.BLOCKCHAINS, _blockchains);
        // set blockchain client
        const clientResult = await setBlockchainClient(value);
        if (!clientResult) {
          setToastMessage(intl.formatMessage({id: 'blockchain_client_error'}));
          return;
        }
        // show guide message
        setToastMessage(intl.formatMessage({id: 'Settings.msg_restart'}));
        break;
      case SettingUITypes.IMAGE_SERVER:
        // check if the input value is the same as the current value
        if (imageServer === value) return;
        // update state
        setImageServer(value);
        // build structure
        _blockchains = {rpc: rpcServer, image: value};
        // update in context state
        updateSettingSchema(StorageSchema.BLOCKCHAINS, _blockchains);
        // show guide message
        setToastMessage(intl.formatMessage({id: 'Settings.msg_restart'}));
        break;
      case SettingUITypes.LOCALE:
        // build structure
        let _index = 0;
        const _locale = SUPPORTED_LOCALES.find((item, index) => {
          _index = index;
          return item.name === value;
        }).locale;
        _languages = {locale: _locale, translation: translation};
        // update state
        setLocale(_locale);
        // update in firestore
        if (userRef) {
          userRef.update({
            locale: _locale,
          });
        }
        // update in context state
        updateSettingSchema(StorageSchema.LANGUAGES, _languages);
        // show guide message
        setToastMessage(intl.formatMessage({id: 'Settings.msg_restart'}));
        break;
      case SettingUITypes.TRANSLATION:
        // check if the input value is the same as the current value
        if (translation === value) return;
        // update state
        setTranslation(value);
        // build structure
        _languages = {locale: locale, translation: value};
        // update in context state
        updateSettingSchema(StorageSchema.LANGUAGES, _languages);
        break;
      default:
        break;
    }
  };

  //// handle button events: terms, privacy, feedback, etc
  const _handlePressButton = async (uiType: SettingUITypes) => {
    // check logged in
    if (!authState.loggedIn) return;

    console.log('_handlePressButton. uiType', uiType);
    switch (uiType) {
      case SettingUITypes.NOTICE:
        break;
      case SettingUITypes.APP_VERSION:
        break;
      case SettingUITypes.RATE_APP:
        break;
      case SettingUITypes.TERMS:
        break;
      case SettingUITypes.PRIVACY:
        break;
      default:
        break;
    }
  };

  //// handle press text items
  const _handlePressText = async (uiType: SettingUITypes) => {
    console.log('_handlePressText. uiType', uiType);
  };

  // convert the timestamp to time
  const _convertTime = (timestamp) => {
    return moment(timestamp).format('hh:mm A');
  };

  // convert the timestamp to time in minutes based on UTC+0
  const _convertTimeToUTC0 = (timestamp) => {
    // time in 2h hour format
    const date = moment(timestamp);
    const hour = date.hour();
    const minutes = date.minutes();
    const time = hour * 60 + minutes + UTC_OFFSET_IN_MINUTES;
    return time;
  };

  // when confirming the time on the clock
  const _handleConfirmDNDTime = async (isStart: boolean, timestamp: number) => {
    console.log('[_handleConfirmDNDTime] isStart, time', isStart, timestamp);
    console.log('convert time', _convertTime(timestamp));
    let dndTimes = null;
    if (isStart) {
      // close the clock
      setShowStartClock(false);
      // set time
      setStartDNDTime(timestamp);

      //// save the time in storage
      // build structure
      dndTimes = {
        startTime: timestamp,
        endTime: endDNDTime,
      };
      // update the data to the storage
      updateSettingSchema(StorageSchema.DND_TIMES, dndTimes);
    } else {
      setShowEndClock(false);
      // set time
      setEndDNDTime(timestamp);

      //// save the time in storage
      // build structure
      dndTimes = {
        startTime: startDNDTime,
        endTime: timestamp,
      };
      // update the data to the storage
      updateSettingSchema(StorageSchema.DND_TIMES, dndTimes);
    }
    //// update db
    // firebase user doc ref
    const userRef = firestore().doc(`users/${username}`);
    console.log('[_handleConfirmDNDTime] usernmae, userRef', username, userRef);
    // check sanity
    if (!userRef) return;
    // convert the timestamp to minutes based on UTC+0
    const time1 = _convertTimeToUTC0(dndTimes.startTime);
    const time2 = _convertTimeToUTC0(dndTimes.endTime);
    // update
    userRef.update({
      dndTimes: [time1, time2],
    });
  };

  const _handleCancelDNDTime = (isStart: boolean) => {
    if (isStart) {
      setShowStartClock(false);
    } else {
      setShowEndClock(false);
    }
  };

  const _renderClockButton = (text: string, handlePressButton: () => void) => {
    return (
      <Block style={styles.rows}>
        <TouchableOpacity onPress={handlePressButton}>
          <Block row middle space="between" style={{paddingTop: 7}}>
            <Text size={14}>{text}</Text>
            <Icon
              name="angle-right"
              family="font-awesome"
              style={{paddingRight: 5}}
            />
          </Block>
        </TouchableOpacity>
      </Block>
    );
  };

  ////
  const _renderItem = ({item}) => {
    switch (item.type) {
      case 'switch':
        return (
          <Block>
            <Block row middle space="between" style={styles.rows}>
              <Text size={14}>{item.title}</Text>
              <Switch
                onValueChange={(value) => {
                  console.log('handle switch');
                  _handleToggleSwitch(item.id, value);
                }}
                ios_backgroundColor={materialTheme.COLORS.SWITCH_OFF}
                thumbColor={
                  Platform.OS === 'android'
                    ? materialTheme.COLORS.SWITCH_OFF
                    : null
                }
                trackColor={{
                  false: materialTheme.COLORS.SWITCH_OFF,
                  true: argonTheme.COLORS.ERROR,
                }}
                value={switchStates[item.id]}
              />
            </Block>
            {switchStates[SettingUITypes.DND_TIMES] && (
              <Block>
                {item.id === SettingUITypes.DND_TIMES ? (
                  <Block card>
                    {_renderClockButton(
                      intl.formatMessage(
                        {id: 'Settings.start_clock_header'},
                        {what: _convertTime(startDNDTime)},
                      ),
                      () => setShowStartClock(true),
                    )}
                    {_renderClockButton(
                      intl.formatMessage(
                        {id: 'Settings.end_clock_header'},
                        {what: _convertTime(endDNDTime)},
                      ),
                      () => setShowEndClock(true),
                    )}
                  </Block>
                ) : null}
              </Block>
            )}
          </Block>
        );
      case 'button':
        return (
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => _handlePressButton(item.id)}>
              <Block row middle space="between" style={{paddingTop: 7}}>
                <Text size={14}>{item.title}</Text>
                <Icon
                  name="angle-right"
                  family="font-awesome"
                  style={{paddingRight: 5}}
                />
              </Block>
            </TouchableOpacity>
          </Block>
        );
      case 'dropdown':
        let defaultText = item.defaultText;
        let selectedIndex = 0;
        switch (item.id) {
          case SettingUITypes.RPC_SERVER:
            defaultText = rpcServer;
            selectedIndex = item.options.indexOf(rpcServer);
            break;
          case SettingUITypes.IMAGE_SERVER:
            defaultText = imageServer;
            selectedIndex = item.options.indexOf(imageServer);
            break;
          case SettingUITypes.LOCALE:
            defaultText = SUPPORTED_LOCALES.find((item, index) => {
              selectedIndex = index;
              return item.locale === locale;
            }).name;
            break;
          case SettingUITypes.TRANSLATION:
            defaultText = translation;
            if (item.options) selectedIndex = item.options.indexOf(translation);
            break;
          default:
            break;
        }
        return (
          <Block row middle space="between" style={styles.rows}>
            <Text size={14} style={{top: 7}}>
              {item.title}
            </Text>
            <DropdownModal
              key={item.id}
              defaultText={defaultText}
              dropdownButtonStyle={styles.dropdownButtonStyle}
              selectedOptionIndex={selectedIndex}
              rowTextStyle={styles.rowTextStyle}
              style={styles.dropdown}
              dropdownStyle={styles.dropdownStyle}
              textStyle={styles.dropdownText}
              options={item.options || []}
              onSelect={(index, value) =>
                _handleDropdownChange(item.id, index, value)
              }
            />
          </Block>
        );
      case 'text':
        // TODO: get the app version from db
        defaultText = item.defaultText;
        return (
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => _handlePressText(item.id)}>
              <Block row middle space="between" style={{paddingTop: 7}}>
                <Text size={14}>{item.title}</Text>
                <Text size={14}>{defaultText}</Text>
              </Block>
            </TouchableOpacity>
          </Block>
        );
      default:
        break;
    }
  };

  return showStartClock || showEndClock ? (
    <DNDTimes
      showStartClock={showStartClock}
      showEndClock={showEndClock}
      startTime={startDNDTime}
      endTime={endDNDTime}
      confirmTime={_handleConfirmDNDTime}
      cancelTime={_handleCancelDNDTime}
    />
  ) : (
    <SettingsScreen
      translationLanguages={uiState.translateLanguages}
      renderItem={_renderItem}
    />
  );
};

export {SettingsContainer};

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
  wrapper: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#788187',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '#788187',
  },
  rowTextStyle: {
    fontSize: 12,
    color: '#788187',
    padding: 5,
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 150,
    width: 200,
    backgroundColor: argonTheme.COLORS.DEFAULT,
  },
  // dropdown container
  dropdownButtonStyle: {
    width: 180,
    marginRight: 10,
    //    borderColor: '#f5f5f5',
  },
  // modal dropdown's button style
  dropdown: {
    width: 180,
    marginLeft: 10,
  },
  textStyle: {
    color: '#357ce6',
  },
  textButton: {
    justifyContent: 'center',
  },
});

//   // TODO: get push notification and language settings from firestore
//   const userRef = firestore().doc(`users/${_username}`);
//   console.log('[Settings] userRer', userRef);
//   await userRef
//     .get()
//     .then(async (doc) => {
//       if (doc.exists) {
//         const userDoc = doc.data();
//         // set notifications states
//         userDoc.pushNotifications.forEach((item: string) => {
//           _switchStates = {..._switchStates, [item]: true};
//         });
//         // set switch states
//         setSwitchStates(_switchStates);
//         // set language (locale)
//         setLanguage(userDoc.language);
//         // store the locale in the storage
//         await AsyncStorage.setItem('locale', userDoc.language);
//         // set locale in the context
//         setLocale(userDoc.language);
//       }
//     })
//     .catch((error) => console.log('failed to get user doc', error));
