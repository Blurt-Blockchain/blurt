//// react
import React, {useReducer, createContext, useContext} from 'react';
//// language
import {useIntl} from 'react-intl';
//// firebase
// firebase phone auth
//import auth from '@react-native-firebase/auth';
// firebase firestore (database)
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// keychain
import * as Keychain from 'react-native-keychain';
//
import {
  AuthActionTypes,
  AuthAction,
  AuthContextType,
  AuthState,
  Credentials,
} from './types/authTypes';
import AsyncStorage from '@react-native-community/async-storage';
import {LOGIN_TOKEN} from '../screens';
import {UIContext} from '~/contexts';
import {FlatList} from 'react-native';
const KEYCHAIN_SERVER = 'users';

const initialState: AuthState = {
  authResolved: false,
  loggedIn: false,
  currentCredentials: {username: '', password: ''},
  credentialsList: [],
};

// create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth reducer
const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case AuthActionTypes.RESOLVE_AUTH:
      return {...state, authResolved: action.payload};
    case AuthActionTypes.LOGOUT:
      const newCredentialsList = state.credentialsList.filter(
        (credentials: Credentials) => credentials.username !== action.payload,
      );
      // clear the current credentials and set logout
      return {
        currentCredentials: {username: '', password: ''},
        credentialsList: newCredentialsList,
        loggedIn: false,
        authResolved: false,
      };
    case AuthActionTypes.SET_CREDENTIALS:
      // change credentials
      return {
        currentCredentials: action.payload.currentCredientials,
        credentialsList: action.payload.credentialsList,
        loggedIn: true,
        authResolved: true,
      };
    case AuthActionTypes.CHANGE_CREDENTIALS:
      return {
        ...state,
        currentCredentials: action.payload,
      };
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({children}: Props) => {
  // userReducer hook
  // set auth reducer with initial state of auth state
  const [authState, dispatch] = useReducer(authReducer, initialState);
  //// language
  const intl = useIntl();
  //// contexts
  // toast message function from UI contexts
  const {setToastMessage} = useContext(UIContext);

  //// action creators
  ////
  const setAuthResolved = (resolved: boolean) => {
    dispatch({
      type: AuthActionTypes.RESOLVE_AUTH,
      payload: resolved,
    });
  };

  // get all credentials from key chains and update context state
  const getCredentials = async (username: string) => {
    // check sanity
    if (!username) {
      console.log('no username is given', username);
      return;
    }
    // get credentials and keys list
    const {credentials, keysList} = await _getCredentials(username);
    // TODO: update user logged in state
    if (credentials) {
      dispatch({
        type: AuthActionTypes.SET_CREDENTIALS,
        payload: {
          currentCredientials: credentials,
          credentialsList: keysList,
        },
      });
    } else {
      console.log('[getCredentials] failed to get key');
      setToastMessage(intl.formatMessage({id: 'key_error'}));
      return;
    }
  };

  //// process login
  const processLogin = async (
    credentials: Credentials,
    addingAccount?: boolean,
    storingCredentials?: boolean,
  ) => {
    console.log('[AuthContext] processLogin adding?', addingAccount);
    // add credentails in case of not loggedin or addingAccount
    if (authState.loggedIn && !addingAccount) return;
    // save the credentials in the keychain if the settings is on
    let keysList = [];
    if (storingCredentials) {
      const result = await _storeCredentials(credentials);
      if (!result) {
        console.log('[processLogin] failed to store key');
        setToastMessage(intl.formatMessage({id: 'key_error'}));
        return;
      }
      keysList = result;
    }
    // dispatch action: set credentials
    dispatch({
      type: AuthActionTypes.SET_CREDENTIALS,
      payload: {
        currentCredientials: credentials,
        credentialsList: keysList,
      },
    });
  };

  //// process logout
  const processLogout = async () => {
    console.log('[AuthContext] processLogout');
    const {currentCredentials} = authState;
    // check sanity
    if (!authState.loggedIn) return;
    // remove login token
    await AsyncStorage.removeItem(LOGIN_TOKEN);
    console.log('removed login token');
    // remove firebase device push token
    const result1 = await _removePushToken(currentCredentials.username);
    if (!result1) {
      console.log('[processLogout] failed to remove push token');
      setToastMessage(intl.formatMessage({id: 'key_error'}));
      return;
    }
    // remove the current credentials in the keychain
    await _removeCredentials(currentCredentials.username);
    // dispatch action: set credentials
    dispatch({
      type: AuthActionTypes.LOGOUT,
      payload: currentCredentials.username,
    });
  };

  //// change account
  const changeAccount = async (account: string) => {
    console.log('[AuthContext] changeAccount account', account);
    // get credentials
    const {credentials} = await _getCredentials(account);
    if (!credentials) {
      console.log('[AuthContext|changeAccount] error! no account');
      setToastMessage(intl.formatMessage({id: 'key_error'}));
      return null;
    }
    // dispatch action
    dispatch({
      type: AuthActionTypes.CHANGE_CREDENTIALS,
      payload: credentials,
    });
    // change account in the storage
    AsyncStorage.setItem(LOGIN_TOKEN, account);
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        setAuthResolved,
        getCredentials,
        processLogin,
        processLogout,
        changeAccount,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

//// helper functions
// get the credentials
const _getCredentials = async (username: string) => {
  try {
    // retrieve keys list
    const keychain = await Keychain.getInternetCredentials(KEYCHAIN_SERVER);
    // get credentials if exists
    if (keychain) {
      // parse keys (password and type are stored in the passworkd property)
      const keysList = JSON.parse(keychain.password);

      // get password
      const credentials = keysList.find(
        (key) => Object.keys(key)[0] === username,
      );
      if (credentials) {
        return {
          credentials: {
            username,
            password: credentials[username].password as string,
            type: credentials[username].type as number,
          },
          keysList: keysList,
        };
      }
      return {
        credentials: null,
        keysList: null,
      };
    }
    return {
      credentials: null,
      keysList: null,
    };
  } catch (error) {
    console.log('failed to retrieve credentials', error);
    return {
      credentials: null,
      keysList: null,
    };
  }
};

//// helpers: store credentials as a string
const _storeCredentials = async ({username, password, type}: Credentials) => {
  try {
    // first retrieve all the stored credentials
    const prevKeychain = await Keychain.getInternetCredentials(KEYCHAIN_SERVER);
    // set new credentials
    let credentials = {};
    credentials[username] = {password, type};
    // empty keys list
    let keysList = [];
    // if previous keys exist, append them
    if (prevKeychain) {
      // parse credentials which are stored in password
      const prevKeys = JSON.parse(prevKeychain.password);
      // append the new one
      keysList = keysList.concat(prevKeys);
      // check uniqueness
      const sameKey = prevKeys.find((key) => Object.keys(key)[0] === username);
      if (!sameKey) {
        // append the new key
        // store password and type in the key property which is username
        keysList.push(credentials);
      }
    } else {
      // append the new one first
      keysList.push(credentials);
    }

    // set new keys list
    Keychain.setInternetCredentials(
      KEYCHAIN_SERVER,
      KEYCHAIN_SERVER,
      JSON.stringify(keysList),
    );
    // return
    return keysList;
  } catch (error) {
    console.log('failed to store credentials of', username, error);
    return null;
  }
};

const _removeCredentials = async (username: string) => {
  try {
    //const result = await Keychain.resetGenericPassword({service: username});
    await Keychain.resetInternetCredentials(KEYCHAIN_SERVER);
  } catch (error) {
    console.error('failed to remove credentials', error);
  }
};

// remove push token and signout from firebase
const _removePushToken = async (username: string) => {
  // get user document
  const userRef = firestore().doc(`users/${username}`);
  // remove push token
  let removed = false;
  await userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log('[logout] doc exists');
        userRef.update({pushToken: null});
        removed = true;
        // sign out from firebase
        auth()
          .signOut()
          .then(() => {
            console.log('sign out from firebase');
          })
          .catch((error) =>
            console.log('failed to sign out from firebase', error),
          );
      }
    })
    .catch((error) =>
      console.log('[remove push token] failed to get user document', error),
    );

  return removed;
};

export {AuthContext, AuthProvider};
