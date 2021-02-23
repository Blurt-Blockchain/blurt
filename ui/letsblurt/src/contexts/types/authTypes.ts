import * as Keychain from 'react-native-keychain';

//// action types
export enum AuthActionTypes {
  RESOLVE_AUTH,
  CHANGE_CREDENTIALS,
  LOGOUT,
  SET_CREDENTIALS,
  ADD,
}

export enum KeyTypes {
  MEMO,
  POSTING,
  ACTIVE,
  OWNER,
  MASTER,
}

export const KeyTypeStrings = ['memo', 'posting', 'active', 'owner', 'master'];

// keychain credentials, username/password pair
export type Credentials = {
  username: string;
  password: string;
  type?: KeyTypes;
};

// auth state
export interface AuthState {
  authResolved: boolean;
  loggedIn: boolean;
  currentCredentials: Credentials;
  credentialsList: any[];
}

// auth context type
export interface AuthContextType {
  // auth state
  authState: AuthState;
  //// action creators
  ////
  setAuthResolved: (resolved: boolean) => void;
  // get credentials from keychain
  getCredentials: (username: string) => void;
  // login with token. @toto what to do?
  // process login
  processLogin: (
    credentials: Credentials,
    addingAccount: boolean,
    storeCredentials?: boolean,
  ) => void;
  // process logout
  processLogout: () => void;
  // change account
  changeAccount: (account: string) => void;
}

interface ResolveAuthAction {
  type: AuthActionTypes.RESOLVE_AUTH;
  payload: boolean;
}

interface ChangeCredentialsAction {
  type: AuthActionTypes.CHANGE_CREDENTIALS;
  payload: Credentials;
}

interface LogoutAction {
  type: AuthActionTypes.LOGOUT;
  payload: string;
}

interface SetCredentialsAction {
  type: AuthActionTypes.SET_CREDENTIALS;
  payload: {
    currentCredientials: Credentials;
    credentialsList: any[];
  };
}

interface AddAction {
  type: AuthActionTypes.ADD;
  payload: Credentials;
}

export type AuthAction =
  | ResolveAuthAction
  | ChangeCredentialsAction
  | LogoutAction
  | SetCredentialsAction
  | AddAction;
