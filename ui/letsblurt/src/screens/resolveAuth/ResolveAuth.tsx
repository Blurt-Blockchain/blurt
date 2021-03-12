//// react
import React, {useEffect, useContext, useState} from 'react';
//// react native
import {Platform} from 'react-native';
// config
import Config from 'react-native-config';
//
import axios from 'axios';
//// firebase
import {firebase} from '@react-native-firebase/functions';
import AsyncStorage from '@react-native-community/async-storage';
import {
  AuthContext,
  UserContext,
  PostsContext,
  UIContext,
  SettingsContext,
} from '~/contexts';
//// constant
import {TRANSLATION_LANGUAGES} from '~/constants';

import {navigate} from '~/navigation/service';

export const LOGIN_TOKEN = 'loginToken';

export const ResolveAuth = (props) => {
  //// props
  //// contexts
  const {authState, setAuthResolved, getCredentials} = useContext(AuthContext)!;
  const {
    fetchBlockchainGlobalProps,
    getFollowings,
    getUserProfileData,
  } = useContext(UserContext);
  const {getTagList} = useContext(PostsContext);
  const {setToastMessage, setTranslateLanguages, initTTS} = useContext(
    UIContext,
  );
  const {settingsState, getAllSettingsFromStorage} = useContext(
    SettingsContext,
  );
  // state
  const [fetched, setFetched] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    _resolveEntry();
  }, []);

  useEffect(() => {
    if (fetched) {
      // get blurt global props and get user's vote amount
      //      fetchBlockchainGlobalProps(username);
      setAuthResolved(true);
      // TODO is this not necessary, why?
      navigate({name: 'Drawer'});
    }
  }, [fetched]);

  //// resolve auth
  const _resolveEntry = async () => {
    // get settings from storage
    await getAllSettingsFromStorage();
    // fetch global props
    fetchBlockchainGlobalProps();

    // get user login token from storage
    let username = await AsyncStorage.getItem(LOGIN_TOKEN);
    // get supported translation languages
    const languages = TRANSLATION_LANGUAGES;
    // const languages = await _getSupportedLanguages();

    // set languages
    setTranslateLanguages(languages);
    // initialize tts
    initTTS(settingsState.languages.locale);
    // set category to feed if username exists
    if (username) {
      console.log('[resolveAuth] username', username);
      try {
        // get user profile
        const profileData = await getUserProfileData(username);
        console.log('[resolveAuth] profile data', profileData);
        // get followings
        const followings = await getFollowings(username);
        // why this???
        if (!followings) navigate({name: 'Drawer'});
        // fetch tags
        await getTagList(username);
      } catch (error) {
        console.log('failed to fetch initial info (followings, tags)', error);
        setToastMessage('The server is down, Choose another in the settings');
        navigate({name: 'Drawer'});
      }
      console.log('[resolveAuth] after get tag list');
      // set username
      setUsername(username);
      // retrieve all credentials
      await getCredentials(username);
      console.log('[resolveAuth] after set credentials');

      // set fetched flag
      setFetched(true);
    } else {
      // fetch tags
      await getTagList();
      // @test
      //navigate({name: 'Drawer'});
      navigate({name: 'Welcome'});
    }
  };

  //// use proxy function to get supported translation languages
  const _getSupportedLanguages = async () => {
    try {
      const result = await firebase
        .functions()
        .httpsCallable('getTranslationLanguagesRequest')();

      console.log('resolveAuth supported language. result', result);
      return result.data.map((language) => language.language.toUpperCase());
    } catch (error) {
      console.log('failed to get translate languages', error);
      return null;
    }
  };

  return null;
};
