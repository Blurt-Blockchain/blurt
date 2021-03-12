/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React, {useEffect, useState, useContext} from 'react';
import {LogBox} from 'react-native';
import {IntlProvider} from 'react-intl';
// code push
import codePush from 'react-native-code-push';
// app screen
import {AppContainer} from './screens/application';
// locales
import {flattenMessages} from './utils/flattenMessages';
import messages from './locales';
//
import AsyncStorage from '@react-native-community/async-storage';
import * as RNLocalize from 'react-native-localize';
// contants
import {SUPPORTED_LOCALES} from '~/locales';

// contexts
import {
  AuthProvider,
  PostsProvider,
  UIProvider,
  UserProvider,
  SettingsProvider,
} from './contexts';

LogBox.ignoreLogs(['Require cycles:', 'Require cycle:', 'VirtualizedLists']);

//export default () => {
const App = () => {
  // const language = await AsyncStorage.getItem('language');
  const [locale, setLocale] = useState('en-US');
  //
  useEffect(() => {
    // check update
    _codePushSync();
    // get locale
    _getLocale();
  }, []);

  //// code push
  const _codePushSync = () => {
    codePush.sync({
      updateDialog: {
        title: 'New Update',
        optionalUpdateMessage: 'Install the update now?',
        optionalIgnoreButtonLabel: 'Later',
        optionalInstallButtonLabel: 'Update',
      },
      installMode: codePush.InstallMode.IMMEDIATE,
    });
  };

  //// get locale
  const _getLocale = async () => {
    // detect default language
    let _locale = RNLocalize.getLocales()[0].languageTag;
    // check if there is a preferred language stored in the storage
    const _languages = await AsyncStorage.getItem('languages');
    if (_languages) {
      const languages = JSON.parse(_languages);
      _locale = languages.locale;
    } else {
      // check if the preferred language is supported by tha app
      if (!SUPPORTED_LOCALES.find((locale) => locale.locale === _locale)) {
        console.log(
          'the preferred language is not supported. preferred langage',
          _locale,
        );
      } else {
        // store the locale and translation in the storage
        const _languages = {
          locale: _locale,
          translation: _locale.split('-')[0].toUpperCase(),
        };
        AsyncStorage.setItem('languages', JSON.stringify(_languages));
      }
    }
    console.log('[App] locale', _locale);
    setLocale(_locale);
  };

  return (
    <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
      <UIProvider>
        <SettingsProvider>
          <UserProvider>
            <PostsProvider>
              <AuthProvider>
                <AppContainer />
              </AuthProvider>
            </PostsProvider>
          </UserProvider>
        </SettingsProvider>
      </UIProvider>
    </IntlProvider>
  );
};

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
};
export default codePush(codePushOptions)(App);
