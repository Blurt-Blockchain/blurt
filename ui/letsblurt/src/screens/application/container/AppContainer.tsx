//// react
import React, {useContext, useEffect} from 'react';
//// react native
import {Platform, BackHandler, Alert, Linking, AppState} from 'react-native';
//// language
import {useIntl} from 'react-intl';
// notification
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
// navigation
import {navigate} from '~/navigation/service';

//import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';

import {ApplicationScreen} from '../screen/Application';

// firebase messaging types
type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

// push notification message listener
type FBRemoteMsgListner = (message: RemoteMessage) => any;
//let fbMessageListener: FBRemoteMsgListner;
//let fbMessageOpenedListener: FBRemoteMsgListner;
// message open handler in foreground

// push operation types
import {SettingUITypes} from '~/screens/settings';

interface Props {}

export const AppContainer = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext)!;
  const {setPostRef} = useContext(PostsContext);
  const {uiState, setToastMessage, setAuthorParam} = useContext(UIContext);

  useEffect(() => {
    // setup push notification listener
    //    _setupNotificationListeners();
    console.log('_setupNotificationListeners');
    // request permission
    (async () => await messaging().requestPermission())();
    console.log('_setupNotificationListeners, got permission');
    // clear app badge number
    PushNotification.setApplicationIconBadgeNumber(0);
    // cancel all local notifications
    PushNotification.cancelAllLocalNotifications();
    // set foreground notification listener
    const fgMsgListener = messaging().onMessage((message: RemoteMessage) => {
      console.log('fgMsgListener, message', message);
      _handleRemoteMessages(message, false);
    });
    // set notification open listener
    messaging().setBackgroundMessageHandler(async (message: RemoteMessage) => {
      console.log('bgMsgListener, message', message);
      // handle message
      _handleRemoteMessages(message, true);
    });
    return () => {
      if (__DEV__) console.log('unsubscribe notification listener');
      fgMsgListener();
    };
  }, []);

  // handle push notification messages
  const _handleRemoteMessages = (
    message: RemoteMessage,
    background: boolean,
  ): void => {
    console.log('_handleRemoteMessages. message', message);

    // get notification data
    const msgData = message.data;
    // sanity check
    if (!msgData) {
      console.log('remote messgage data is undefined');
      return;
    }
    // get message tyep
    //    const msgType = msgData.type;
    // @test
    // TODO: handle the foreground message. show modal
    console.log('remote message data', msgData);
    const {operation, author, permlink} = msgData;
    let route = null;
    switch (operation) {
      // navigate to the post details
      case SettingUITypes.BENEFICIARY:
      case SettingUITypes.MENTION:
      case SettingUITypes.REBLOG:
      case SettingUITypes.REPLY:
      case SettingUITypes.VOTE:
        //// navigate
        // set route name
        route = 'PostDetails';
        // set post ref to the context
        setPostRef({author, permlink});
        break;
      case SettingUITypes.FOLLOW:
        //// navigate to the author profile
        // set route name
        route = 'AuthorProfile';
        // set author to the context
        setAuthorParam(author);
        // navigate
        break;
      case SettingUITypes.TRANSFER:
        //// navigate to the wallet
        // set route name
        route = 'Wallet';
        break;
      default:
        break;
    }
    // navigate if the app is in background
    if (background) {
      navigate({name: route});
    } else {
      // handle foreground message
      Alert.alert(
        intl.formatMessage({id: 'App.push_title'}),
        intl.formatMessage({id: 'App.push_body'}),
        [
          {text: intl.formatMessage({id: 'no'}), style: 'cancel'},
          {
            text: intl.formatMessage({id: 'yes'}),
            onPress: () => navigate({name: route}),
          },
        ],
        {cancelable: true},
      );
    }
  };

  // clear toast message
  const _clearMessage = () => {
    setToastMessage('');
  };

  return (
    <ApplicationScreen
      toastMessage={uiState.toastMessage}
      clearMessage={_clearMessage}
    />
  );
};
