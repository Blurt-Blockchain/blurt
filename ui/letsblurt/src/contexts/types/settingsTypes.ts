import {
  BLURT_MAINNETS,
  BLURT_CHAIN_ID,
  BLURT_CHAIN_PREFIX,
  BLURT_IMAGE_SERVERS,
} from '~/constants/blockchain';

//// storage schema
export enum StorageSchema {
  PUSH_NOTIFICATIONS = 'pushNotifications', // push notifications
  DND_TIMES = 'dndTimes', // {start time, end time}
  BLOCKCHAINS = 'blockchains', // rpc server, image server,  blockchain prefix, blockchain id
  SECURITIES = 'securities', // otp, auto login,
  LANGUAGES = 'languages', // menu language (locale, e.g. en-US), translation language (e.g. EN)
  UI = 'ui', // dark theme, font size,
  DRAFT = 'draft', // title, body, tag, beneficiaries
  TEMPLATE = 'template', // posting template, beneficiaries, powerup, ...
}

//// blockchain types
export type BlockchainTypes = {
  rpc: string;
  image?: string;
};

//// securiteies types
export type SecurityTypes = {
  useOTP: boolean;
  useAutoLogin: boolean;
};

//// dnd times types
export type DNDTimeTypes = {
  startTime: number; // timestamp
  endTime: number; //timestamp
};

//// language types
export type LanguageTypes = {
  locale: string;
  translation: string;
};

//// ui types
export type UITypes = {
  nsfw: boolean;
};

// settings state
export interface SettingsState {
  [StorageSchema.PUSH_NOTIFICATIONS]: string[];
  [StorageSchema.BLOCKCHAINS]: BlockchainTypes;
  [StorageSchema.SECURITIES]: SecurityTypes;
  [StorageSchema.DND_TIMES]: DNDTimeTypes;
  [StorageSchema.LANGUAGES]: LanguageTypes;
  [StorageSchema.UI]: UITypes;
}

// initial post data
export const INITIAL_SETTINGS: SettingsState = {
  [StorageSchema.PUSH_NOTIFICATIONS]: [
    'transfer',
    'beneficiary',
    'reply',
    'mention',
    'follow',
  ],
  [StorageSchema.BLOCKCHAINS]: {
    rpc: BLURT_MAINNETS[0],
    image: BLURT_IMAGE_SERVERS[0],
  },
  [StorageSchema.SECURITIES]: {
    useOTP: false,
    useAutoLogin: true,
  },
  [StorageSchema.LANGUAGES]: {
    locale: 'en-US',
    translation: 'EN',
  },
  [StorageSchema.DND_TIMES]: {
    startTime: new Date(2021, 12, 12, 1, 0, 0).getTime(),
    endTime: new Date(2021, 12, 12, 8, 0, 0).getTime(),
  },
  [StorageSchema.UI]: {
    nsfw: false,
  },
};

//// settings action types
export enum SettingsActionTypes {
  GET_ALL_SETTINGS,
  FINALIZE_SETTINGS_TO_STORAGE,
  SET_SCHEMA,
  SET_BLOCKCHAINS,
  SET_SECURITIES,
  SET_LANGUAGES,
  SET_DND_TIMES,
  SET_UI,
  SET_STORAGE,
}

//// actions
// get all settings from storage
interface GetAllSettingsAction {
  type: SettingsActionTypes.GET_ALL_SETTINGS;
  payload: SettingsState;
}
// finalize settings to storage
interface FinalizeSettingsToStorageAction {
  type: SettingsActionTypes.FINALIZE_SETTINGS_TO_STORAGE;
}

// set schema
interface SetSchemaAction {
  type: SettingsActionTypes.SET_SCHEMA;
  payload: {
    schema: StorageSchema;
    data: any;
  };
}

// settings context type
export interface SettingsContextType {
  // settings state
  settingsState: SettingsState;
  //// action creators
  // get all settings from storage
  getAllSettingsFromStorage: () => Promise<SettingsState>;
  //
  getItemFromStorage: (key: string) => Promise<any>;
  // update a single item in schema
  updateSettingSchema: (schema: StorageSchema, data: any) => void;
  // set all state to storage
  setAllStatesToStorage: () => void;
}

export type SettingsAction =
  | GetAllSettingsAction
  | FinalizeSettingsToStorageAction
  | SetSchemaAction;
