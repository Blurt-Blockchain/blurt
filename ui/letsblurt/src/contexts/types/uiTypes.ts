import {PostsTypes} from './postTypes';

//// action types
export enum UIActionTypes {
  SET_TOAST,
  SET_AUTHOR_PARAM,
  SET_AUTHORS_PARAM,
  SET_EDIT_MODE,
  SET_SEARCH_PARAM,
  SET_TRANSLATE_LANGUAGES,
  SET_LANGUAGE_PARAM,
  SET_AVAILABLE_VOICES,
  SET_TTS_STATE,
}

//// TTS states
export enum TTSStates {
  NON_INIT,
  INIT,
  STARTED,
  FINISHED,
  CANCELED,
}

// ui state
export interface UIState {
  // toast message
  toastMessage: string;
  // author param
  // authorParam: string;
  selectedAuthor: string;
  authorList: string[];
  // search text param
  searchText: string;
  // edit mode
  editMode: boolean;
  // supported translated languages;
  translateLanguages: string[];
  selectedLanguage: string;
  // available voices for tts
  availableVoices: string[];
  ttsState: TTSStates;
}

//// actions
// set toast message
interface SetToastAction {
  type: UIActionTypes.SET_TOAST;
  payload: string;
}
// set author to use it as a navigation param
interface SetAuthorParamAction {
  type: UIActionTypes.SET_AUTHOR_PARAM;
  payload: string;
}
//
interface SetEditModeAction {
  type: UIActionTypes.SET_EDIT_MODE;
  payload: boolean;
}
//
interface SetSearchParamAction {
  type: UIActionTypes.SET_SEARCH_PARAM;
  payload: string;
}
//
interface SetAuthorsParamAction {
  type: UIActionTypes.SET_AUTHORS_PARAM;
  payload: string[];
}
//
interface SetTranslateLanguagesAction {
  type: UIActionTypes.SET_TRANSLATE_LANGUAGES;
  payload: string[];
}
//
interface SetLanguageParamAction {
  type: UIActionTypes.SET_LANGUAGE_PARAM;
  payload: string;
}
//
interface SetAvailableVoicesAction {
  type: UIActionTypes.SET_AVAILABLE_VOICES;
  payload: string[];
}
//
interface SetTTSStateAction {
  type: UIActionTypes.SET_TTS_STATE;
  payload: TTSStates;
}
// ui context type
export interface UIContextType {
  // ui state
  uiState: UIState;
  //// action creators
  // set toast message
  setToastMessage: (message: string) => void;
  // set author to use it as a param betwen navigation
  setAuthorParam: (author: string) => void;
  // set author list
  setAuthorListParam: (authors: string[]) => void;
  //
  setEditMode: (edit: boolean) => void;
  // set search param
  setSearchParam: (text: string) => void;
  //
  setTranslateLanguages: (languages: string[]) => void;
  //
  setLanguageParam: (language: string) => void;
  //
  initTTS: (locale: string) => void;
  //
  speakBody: (markdown: string, stop?: boolean) => void;
  //
  setTTSRate: (rate: number) => void;
  //
  setTTSPitch: (pitch: number) => void;
  //
  setTTSLanguageIndex: (index: number) => void;
  // pause tts
  pauseTTS: () => void;
  // resuem tts
  resumeTTS: () => void;
  // stop tts
  stopTTS: () => void;
}

export type UIAction =
  | SetToastAction
  | SetAuthorParamAction
  | SetAuthorsParamAction
  | SetEditModeAction
  | SetSearchParamAction
  | SetTranslateLanguagesAction
  | SetLanguageParamAction
  | SetAvailableVoicesAction
  | SetTTSStateAction;
