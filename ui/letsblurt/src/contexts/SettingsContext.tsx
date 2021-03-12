//// react
import React, {useReducer, createContext, useContext} from 'react';
//// language
import {useIntl} from 'react-intl';
//// storage
import AsyncStorage from '@react-native-community/async-storage';

import {
  SettingsActionTypes,
  INITIAL_SETTINGS,
  SettingsState,
  SettingsContextType,
  SettingsAction,
  StorageSchema,
  DNDTimeTypes,
  BlockchainTypes,
  SecurityTypes,
  LanguageTypes,
  UITypes,
} from './types';
import {SettingsScreen} from '~/screens/settings/screen/Settings';
import {UIContext} from '~/contexts';

//// initial settings state
const initialState = INITIAL_SETTINGS;

// create settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction) => {
  switch (action.type) {
    case SettingsActionTypes.GET_ALL_SETTINGS:
      return action.payload;
    case SettingsActionTypes.FINALIZE_SETTINGS_TO_STORAGE:
      return {...state, existInStorage: true};
    case SettingsActionTypes.SET_SCHEMA:
      return {...state, [action.payload.schema]: action.payload.data};
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};
const SettingsProvider = ({children}: Props) => {
  // useReducer hook
  const [settingsState, dispatch] = useReducer(settingsReducer, initialState);
  console.log('[SettingsProvider] state', settingsState);
  //// language
  const intl = useIntl();
  //// contexts
  const {setToastMessage} = useContext(UIContext);

  //////// action creators

  //// get a single item from storage
  const getItemFromStorage = async (key: string) => {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    setToastMessage(intl.formatMessage({id: 'storage_error'}));
    return null;
  };

  //// update setting schema
  const updateSettingSchema = async (schema: StorageSchema, data: any) => {
    if (data) {
      console.log('[updateSettingSchema] schema, data', schema, data);
      // dispatch action
      dispatch({
        type: SettingsActionTypes.SET_SCHEMA,
        payload: {
          schema: schema,
          data: data,
        },
      });
      await _setItemToStorage(schema, data);
      return true;
    }
    return false;
  };

  //// get all settings from storage
  const getAllSettingsFromStorage = async () => {
    const pushPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.PUSH_NOTIFICATIONS)),
    );
    const dndPromise = new Promise((resolve, reject) => {
      resolve(getItemFromStorage(StorageSchema.DND_TIMES));
    });
    const blockchainPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.BLOCKCHAINS)),
    );
    const securityPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.SECURITIES)),
    );
    const languagePromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.LANGUAGES)),
    );
    const uiPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.UI)),
    );

    const promises = [
      pushPromise,
      dndPromise,
      blockchainPromise,
      securityPromise,
      languagePromise,
      uiPromise,
    ];

    let settings = null;
    Promise.all(promises)
      .then((results) => {
        console.log('get all settings. results', results);
        //// build structure
        // use default states
        const _settings: SettingsState = {
          pushNotifications: settingsState.pushNotifications,
          dndTimes: settingsState.dndTimes,
          blockchains: settingsState.blockchains,
          securities: settingsState.securities,
          languages: settingsState.languages,
          ui: settingsState.ui,
        };
        results.forEach((item, index) => {
          switch (index) {
            case 0:
              // use storage value if exists
              if (item) _settings.pushNotifications = item as string[];
              // if not exist, store the state to storage
              else
                updateSettingSchema(
                  StorageSchema.PUSH_NOTIFICATIONS,
                  settingsState.pushNotifications,
                );
              break;
            case 1:
              if (item) _settings.dndTimes = item as DNDTimeTypes;
              else
                updateSettingSchema(
                  StorageSchema.DND_TIMES,
                  settingsState.dndTimes,
                );
              break;
            case 2:
              if (item) _settings.blockchains = item as BlockchainTypes;
              else
                updateSettingSchema(
                  StorageSchema.BLOCKCHAINS,
                  settingsState.blockchains,
                );
              break;
            case 3:
              if (item) _settings.securities = item as SecurityTypes;
              else
                updateSettingSchema(
                  StorageSchema.SECURITIES,
                  settingsState.securities,
                );
              break;
            case 4:
              if (item) _settings.languages = item as LanguageTypes;
              else
                updateSettingSchema(
                  StorageSchema.LANGUAGES,
                  settingsState.languages,
                );
              break;
            case 5:
              if (item) _settings.ui = item as UITypes;
              else updateSettingSchema(StorageSchema.UI, settingsState.ui);
              break;
          }
        });
        // dispatch actions
        console.log('[getAllSettingsFromStorage] _settings', _settings);
        dispatch({
          type: SettingsActionTypes.GET_ALL_SETTINGS,
          payload: _settings,
        });
      })
      .catch((error) => {
        console.log('failed to get all settings from storage', error);
        setToastMessage(intl.formatMessage({id: 'storage_error'}));
      });
    return settings;
  };

  //// set state to storage: not used
  const setAllStatesToStorage = async () => {
    const pushPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(
          StorageSchema.PUSH_NOTIFICATIONS,
          settingsState.pushNotifications,
        ),
      ),
    );
    const dndPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.DND_TIMES, settingsState.dndTimes),
      ),
    );
    const blockchainPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.BLOCKCHAINS, settingsState.blockchains),
      ),
    );
    const securityPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.SECURITIES, settingsState.securities),
      ),
    );
    const languagePromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.LANGUAGES, settingsState.languages),
      ),
    );
    const uiPromise = new Promise((resolve, reject) =>
      resolve(_setItemToStorage(StorageSchema.UI, settingsState.ui)),
    );
    // augment the promises
    const promises = [
      pushPromise,
      dndPromise,
      blockchainPromise,
      securityPromise,
      languagePromise,
      uiPromise,
    ];
    // resolve all the promises
    Promise.all(promises)
      .then((results) => {
        console.log('set settings to storage. results', results);
        let success = true;
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            success = false;
            break;
          }
        }
        // dispatch actions
        if (success) {
          // dispatch finalize action
          dispatch({
            type: SettingsActionTypes.FINALIZE_SETTINGS_TO_STORAGE,
          });
        }
      })
      .catch((error) =>
        console.log('failed to get all settings from storage', error),
      );
  };

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        getAllSettingsFromStorage,
        getItemFromStorage,
        updateSettingSchema,
        setAllStatesToStorage,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

////// storage helper functions
//// set a single item or schema to storage
const _setItemToStorage = async (key: string, data: any) => {
  if (data) {
    console.log('_setItemToStorage. key, data', key, data);
    // stringify the data
    const dataString = JSON.stringify(data);
    await AsyncStorage.setItem(key, dataString);
    return true;
  }
  return false;
};

export {SettingsContext, SettingsProvider};
