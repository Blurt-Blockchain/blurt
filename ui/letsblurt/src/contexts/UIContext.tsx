import React, {useReducer, createContext} from 'react';

import TTS from 'react-native-tts';

import {UIActionTypes, UIState, UIContextType, UIAction} from './types/uiTypes';

// dblurt api
import {PostsTypes, TTSStates} from './types';

const initialState = {
  toastMessage: '',
  selectedAuthor: null,
  //  selectedTag: null,
  editMode: false,
  searchText: '',
  authorList: [],
  translateLanguages: [],
  selectedLanguage: 'en',
  availableVoices: [],
  ttsState: TTSStates.NON_INIT,
};

// create ui context
const UIContext = createContext<UIContextType | undefined>(undefined);

// ui reducer
const uiReducer = (state: UIState, action: UIAction) => {
  switch (action.type) {
    case UIActionTypes.SET_TOAST:
      return {...state, toastMessage: action.payload};
    case UIActionTypes.SET_AUTHOR_PARAM:
      return {...state, selectedAuthor: action.payload};
    case UIActionTypes.SET_AUTHORS_PARAM:
      return {...state, authorList: action.payload};
    // case UIActionTypes.SET_TAG_PARAM:
    //   return {...state, selectedTag: action.payload};
    case UIActionTypes.SET_EDIT_MODE:
      console.log('[UIContext] SET_EDIT_MODE reducer, payload', action.payload);
      return {...state, editMode: action.payload};
    case UIActionTypes.SET_SEARCH_PARAM:
      return {...state, searchText: action.payload};
    case UIActionTypes.SET_TRANSLATE_LANGUAGES:
      return {...state, translateLanguages: action.payload};
    case UIActionTypes.SET_LANGUAGE_PARAM:
      return {...state, selectedLanguage: action.payload};
    case UIActionTypes.SET_AVAILABLE_VOICES:
      return {...state, availableVoices: action.payload};
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const UIProvider = ({children}: Props) => {
  // userReducer hook
  // set auth reducer with initial state of auth state
  const [uiState, dispatch] = useReducer(uiReducer, initialState);
  console.log('[ui provider] state', uiState);

  //////// action creators

  //// set toast message
  const setToastMessage = (message: string) => {
    console.log('[setToastMessage] msg', message);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_TOAST,
      payload: message,
    });
  };

  // set author param
  const setAuthorParam = (author: string) => {
    console.log('[setAuthor] author', author);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_AUTHOR_PARAM,
      payload: author,
    });
  };

  // set author param
  const setAuthorListParam = (authors: string[]) => {
    console.log('[setAuthorList] author', authors);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_AUTHORS_PARAM,
      payload: authors,
    });
  };

  // set edit mode
  const setEditMode = (edit: boolean) => {
    console.log('[UIContext] setEditMode, edit?', edit);
    dispatch({
      type: UIActionTypes.SET_EDIT_MODE,
      payload: edit,
    });
  };

  //// set search param
  const setSearchParam = (text: string) => {
    dispatch({
      type: UIActionTypes.SET_SEARCH_PARAM,
      payload: text,
    });
  };

  //// set supported translate languages
  const setTranslateLanguages = (languages: string[]) => {
    dispatch({
      type: UIActionTypes.SET_TRANSLATE_LANGUAGES,
      payload: languages,
    });
  };

  ////
  const setLanguageParam = (language: string) => {
    dispatch({
      type: UIActionTypes.SET_LANGUAGE_PARAM,
      payload: language,
    });
  };

  //// initialize tts
  const initTTS = async (locale: string) => {
    TTS.setDefaultRate(0.5);
    TTS.setDefaultPitch(1);
    try {
      const result = await TTS.getInitStatus();
      console.log('init tts result', result);
    } catch (error) {
      console.log('failed to init TTS', error);
      return;
    }

    TTS.setDefaultLanguage(locale);

    TTS.addEventListener('tts-start', (event) => console.log('start', event));
    TTS.addEventListener('tts-progress', (event) => {});
    TTS.addEventListener('tts-finish', (event) => console.log('finish', event));
    TTS.addEventListener('tts-cancel', (event) => console.log('cancel', event));

    //// get available vocies
    const voices = await TTS.voices();
    const availableVoices = voices
      .filter((v) => !v.networkConnectionRequired && !v.notInstalled)
      .map((v) => {
        return v.language;
      });
    // set available voices
    console.log('[uiContext] available voices', availableVoices);
    dispatch({
      type: UIActionTypes.SET_AVAILABLE_VOICES,
      payload: availableVoices,
    });
  };

  ////
  const speakBody = (markdown: string, stop?: boolean) => {
    if (stop) {
      TTS.stop();
      return;
    }
    if (markdown) {
      TTS.stop();
      // TODO: handle html too
      const text = markdown
        .replace(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gim,
          '',
        )
        // .replace(/^### (.*$)/gim, '')
        // .replace(/^## (.*$)/gim, '')
        // .replace(/^# (.*$)/gim, '')
        // .replace(/^###/gim, '')
        // .replace(/^##/gim, '')
        // .replace(/^#/gim, '')
        .replace(/(<([^>]+)>)/gi, '') // Remove html tags
        .replace(/[a-zA-Z0-9_]*.(jpg|png)/gim, '')
        .replace(/%[a-zA-Z0-9]+/gim, '')
        .replace(/^#+/gim, '')
        .replace(/!\[(.*?)\]/gim, '')
        .replace(/^\> (.*$)/gim, '')
        .replace(/\*\*(.*)\*\*/gim, '')
        .replace(/\*(.*)\*/gim, '')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '')
        .replace(/\n$/gim, ' ');

      console.log('tts text', text);
      TTS.speak(text);
    }
  };

  ////
  const setTTSRate = async (rate: number) => {
    // change rate
    try {
      await TTS.setDefaultRate(rate);
    } catch (error) {
      console.log('failed to set tts rate', error);
    }
  };

  ////
  const setTTSPitch = async (pitch: number) => {
    // change pitch
    try {
      await TTS.setDefaultPitch(pitch);
    } catch (error) {
      console.log('failed to set tts pitch', error);
    }
  };

  ////
  const setTTSLanguageIndex = async (index: number) => {
    // change default language
    try {
      await TTS.setDefaultLanguage(uiState.availableVoices[index]);
    } catch (error) {
      console.log('failed to set tts language', error);
    }
  };

  ///
  const pauseTTS = () => {};

  /// resume TTS
  const resumeTTS = () => {};

  ////
  const stopTTS = () => {
    TTS.stop();
  };
  return (
    <UIContext.Provider
      value={{
        uiState,
        setToastMessage,
        setAuthorParam,
        setAuthorListParam,
        setEditMode,
        setSearchParam,
        setTranslateLanguages,
        setLanguageParam,
        initTTS,
        setTTSRate,
        setTTSPitch,
        setTTSLanguageIndex,
        speakBody,
        pauseTTS,
        resumeTTS,
        stopTTS,
      }}>
      {children}
    </UIContext.Provider>
  );
};

export {UIContext, UIProvider};
