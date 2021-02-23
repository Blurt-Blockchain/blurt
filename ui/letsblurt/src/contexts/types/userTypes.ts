import {PostRef} from './postTypes';
import {BlockchainGlobalProps} from '~/providers/blurt/dblurtApi';

//// action types
export enum UserActionTypes {
  FOLLOW,
  UNFOLLOW,
  ADD_BOOKMARK,
  REMOVE_BOOKMARK,
  ADD_FAVORITE,
  REMOVE_FAVORITE,
  SET_VOTE_AMOUNT,
  SET_GLOBAL_PROPS,
  SET_WALLET_DATA,
  SET_PROFILE_DATA,
  SET_PRICE,
  SET_FOLLOWINGS,
  SET_FOLLOWERS,
}

// profile data type
export interface ProfileData {
  profile: {
    metadata: any;
    name: string;
    voteAmount: string;
    votePower: string;
    balance: string; // blurt or steem
    power: string; // blurt power or steem power
    sbd?: string; // sbd
    stats: {
      post_count: number;
      following: number;
      followers: number;
    };
  };
  blogRefs?: string[];
  blogs?: any;
  // bookmarks
  bookmarks?: any;
}

//// wallet data
export interface WalletData {
  blurt: string;
  power: string;
  savings: string;
  rewardBlurt: string;
  rewardVests: string;
  voteAmount?: string;
  votePower?: string;
  transactions: any[];
}

//// user state
export interface UserState {
  profileData: ProfileData;
  globalProps: BlockchainGlobalProps;
  walletData: WalletData;
  // price in usd
  price?: number;
  followings: string[];
  followers: string[];
}

//// actions
// follow an author
interface FollowAction {
  type: UserActionTypes.FOLLOW;
  payload: string;
}
// unfollow an author
interface UnFollowAction {
  type: UserActionTypes.UNFOLLOW;
  payload: string;
}
// add a bookmark
interface AddBookmarkAction {
  type: UserActionTypes.ADD_BOOKMARK;
  payload: PostRef;
}
// remove a bookmark
interface RemoveBookmarkAction {
  type: UserActionTypes.REMOVE_BOOKMARK;
  payload: PostRef;
}
// add an author to fovorites
interface AddFavoriteAction {
  type: UserActionTypes.ADD_FAVORITE;
  payload: string;
}
// remove an author from favorite
interface RemoveFavoriteAction {
  type: UserActionTypes.REMOVE_FAVORITE;
  payload: string;
}
// set vote amount
interface SetVoteAmountAction {
  type: UserActionTypes.SET_VOTE_AMOUNT;
  payload: string;
}
// set steem global props
interface SetGlobalPropsAction {
  type: UserActionTypes.SET_GLOBAL_PROPS;
  payload: BlockchainGlobalProps;
}
// set wallet data
interface SetWalletDataAction {
  type: UserActionTypes.SET_WALLET_DATA;
  payload: WalletData;
}
// set profile data
interface SetProfileDataAction {
  type: UserActionTypes.SET_PROFILE_DATA;
  payload: ProfileData;
}
// set price
interface SetPriceAction {
  type: UserActionTypes.SET_PRICE;
  payload: number;
}
// set following
interface SetFollowingsAction {
  type: UserActionTypes.SET_FOLLOWINGS;
  payload: string[];
}
// set followers
interface SetFollowersAction {
  type: UserActionTypes.SET_FOLLOWERS;
  payload: string[];
}
// user context type
export interface UserContextType {
  // ui state
  userState: UserState;
  //// action creators
  // fetch blockchain global props
  fetchBlockchainGlobalProps: (username?: string) => void;
  // update vote amount
  updateVoteAmount: (username: string) => void;
  // get wallet data
  getWalletData: (username: string) => Promise<WalletData>;
  // get user profile data
  getUserProfileData: (usernmae: string) => Promise<any>;
  // get user notifications
  getNotifications: (username: string) => Promise<any[]>;
  // get price
  getPrice: () => Promise<number>;
  // update follow state
  updateFollowState: (
    follower: string,
    password: string,
    following: string,
    action: string,
  ) => Promise<any>;
  // get followings of the follower
  getFollowings: (follower: string) => Promise<string[]>;
  // get followers of the user
  getFollowers: (username: string) => Promise<string[]>;
}

export type UserAction =
  | SetVoteAmountAction
  | SetGlobalPropsAction
  | FollowAction
  | UnFollowAction
  | AddBookmarkAction
  | RemoveBookmarkAction
  | AddFavoriteAction
  | RemoveFavoriteAction
  | SetWalletDataAction
  | SetProfileDataAction
  | SetPriceAction
  | SetFollowingsAction
  | SetFollowersAction;
