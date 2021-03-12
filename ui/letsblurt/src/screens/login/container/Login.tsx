import React, {useState, useEffect, useContext} from 'react';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
// firebase
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// blockchain api
import {verifyPassoword} from '~/providers/blurt/dblurtApi';
import {navigate} from '~/navigation/service';
import {LoginScreen} from '../screen/Login';
//// contexts
import {
  AuthContext,
  PostsContext,
  UIContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
import {INITIAL_SETTINGS, StorageSchema} from '~/contexts/types';

import {LOGIN_TOKEN} from '~/screens';
import {OTP} from '~/components';

import AsyncStorage from '@react-native-community/async-storage';

interface Props {
  route: any;
}

const Login = (props: Props): JSX.Element => {
  //// props
  const {route} = props;
  const addingAccount = route.params?.addingAccount;
  //// language
  const intl = useIntl();
  //// contexts
  const {processLogin} = useContext(AuthContext);
  const {setToastMessage} = useContext(UIContext);
  const {updateVoteAmount, getFollowings} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  const {getTagList} = useContext(PostsContext);
  //// states
  const [username, setUsername] = useState('');
  const [password, setPasword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordType, setPasswordType] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  //// effects
  // event: logged in
  useEffect(() => {
    if (loggedIn) {
      // navigate to feed
      console.log('[Feed] logged in event');
      // reset logged in
      setLoggedIn(false);
      // navigate to the Feed screen
      navigate({name: 'Feed'});
    }
  }, [loggedIn]);

  //// handle username change
  const _handleUsernameChange = (value: string): void => {
    // set username
    setUsername(value);
    // clear message
    setMessage('');
  };

  //// handle password change
  const _handlePasswordChange = (value: string): void => {
    // set password
    setPasword(value);
    // clear message
    setMessage('');
  };

  //// start to process login
  const _processLogin = async () => {
    // set loading
    setLoading(true);
    // verify the private key
    const {account, keyType} = await verifyPassoword(username, password);
    if (!account) {
      setToastMessage(intl.formatMessage({id: 'Login.login_error'}));
      setLoading(false);
      return;
    }

    //// firebase login and update doc
    // sign in to firebase anonymously to use firebase firestore
    await auth()
      .signInAnonymously()
      .then((result) => console.log('signed in firebase', result))
      .catch((error) => console.log('failed to sign in firebase', error));
    // create or update user db
    _updateUserDB(username);

    //// fetch user data
    // update followings which is required in fetching feed
    await getFollowings(username);
    // fetch tags
    await getTagList(username);

    // update user vote amount
    await updateVoteAmount(username);

    //// process login action
    processLogin(
      {username, password, type: keyType},
      addingAccount,
      settingsState.securities.useAutoLogin,
    );
    ////
    // show login toast message
    setToastMessage(
      intl.formatMessage({id: 'Login.logged_in'}, {what: username}),
    );

    //// clear up
    // trigger navigation
    setLoggedIn(true);
    // clear loading
    setLoading(false);
    setUsername('');
    setPasword('');
    setMessage('');
  };

  //// update user data on firestore
  const _updateUserDB = async (_username: string) => {
    //// get device's push token
    // request permission
    messaging()
      .getToken()
      .then(async (pushToken) => {
        //// save the push token to user db
        // create user document with username
        // check if the user document exists
        const userRef = firestore().collection('users').doc(_username);
        userRef
          .get()
          .then(async (doc) => {
            // create a new document
            if (!doc.exists) {
              console.log('user doc does not exist');
              // get perferred language
              const _languages = await AsyncStorage.getItem(
                StorageSchema.LANGUAGES,
              );
              const languages = JSON.parse(_languages);
              // create a user doc
              userRef
                .set({
                  pushToken,
                  username: _username,
                  createdAt: new Date(),
                  lastLoginAt: new Date(),
                  dndTimes: null,
                  pushNotifications: INITIAL_SETTINGS.pushNotifications,
                  locale: languages.locale,
                })
                .then(() => console.log('created user document'))
                .catch((error) =>
                  console.log('failed to create a user document', error),
                );
            } else {
              console.log('user doc exists, username', _username);
              // update push token
              userRef.update({pushToken, lastLoginAt: new Date()});
            }
            // save the username to async storage for auto login
            AsyncStorage.setItem(LOGIN_TOKEN, _username);
          })
          .catch((error) => {
            console.log('failed to get user document', error);
          });
      })
      .catch((error) => console.log('failed to get push token', error));
  };

  //// render
  return (
    <LoginScreen
      username={username}
      password={password}
      message={message}
      loading={loading}
      handleUsernameChange={_handleUsernameChange}
      handlePasswordChange={_handlePasswordChange}
      processLogin={_processLogin}
    />
  );
};

export {Login};
