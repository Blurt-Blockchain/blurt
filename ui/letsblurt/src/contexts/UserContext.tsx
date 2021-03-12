import React, {useReducer, createContext, useContext} from 'react';
//// language
import {useIntl} from 'react-intl';
import {
  fetchGlobalProps,
  getAccount,
  fetchWalletData,
  fetchUserProfile,
  BlockchainGlobalProps,
  parseToken,
  vestsToRshares,
  fetchNotifications,
  fetchPrice,
  updateFollow,
  fetchFollowings,
  fetchFollowers,
} from '../providers/blurt/dblurtApi';
import {estimateVoteAmount} from '~/utils/estimateVoteAmount';
import {parseBlurtTransaction} from '~/utils/parseTransaction';

import {
  PostRef,
  UserState,
  UserContextType,
  UserActionTypes,
  UserAction,
} from './types';
import {UIContext} from './UIContext';

// initial state
const initialState = {
  profileData: {
    profile: {
      metadata: {},
      name: '',
      voteAmount: '0',
      votePower: '',
      balance: '',
      power: '',
      sbd: '',
      stats: {
        post_count: 0,
        following: 0,
        followers: 0,
      },
    },
    blogRefs: [],
    blogs: [],
  },
  globalProps: {
    steemPerMVests: 0,
    base: 0,
    quote: 0,
    fundRecentClaims: 0,
    fundRewardBalance: 0,
    sbdPrintRate: 0,
    dynamicProps: {},
    chainProps: {},
  },
  walletData: {
    blurt: '0',
    power: '0',
    savings: '0',
    rewardBlurt: '0',
    rewardVests: '0',
    voteAmount: '0',
    votePower: '0',
    transactions: [],
  },
  price: 0,
  followings: [],
  followers: [],
  phoneNumber: '',
};

// create user context
const UserContext = createContext<UserContextType | undefined>(undefined);

// user reducer
const userReducer = (state: UserState, action: UserAction) => {
  switch (action.type) {
    case UserActionTypes.SET_GLOBAL_PROPS:
      console.log('[UserContext|userReducer] set global props', state, action);
      return {...state, globalProps: action.payload};
    case UserActionTypes.SET_VOTE_AMOUNT:
      return {
        ...state,
        profileData: {
          ...state.profileData,
          profile: {...state.profileData.profile, voteAmount: action.payload},
        },
      };
    case UserActionTypes.FOLLOW:
      return state;
    case UserActionTypes.SET_WALLET_DATA:
      return {...state, walletData: action.payload};
    case UserActionTypes.SET_PRICE:
      return {...state, price: action.payload};
    case UserActionTypes.SET_FOLLOWINGS:
      return {...state, followings: action.payload};
    case UserActionTypes.SET_FOLLOWERS:
      return {...state, followers: action.payload};
    case UserActionTypes.SET_PROFILE_DATA:
      return {...state, profileData: action.payload};
    default:
      return state;
  }
};

// provider props
type Props = {
  children: React.ReactNode;
};
// user provider
const UserProvider = ({children}: Props) => {
  // useReducer hook
  const [userState, dispatch] = useReducer(userReducer, initialState);
  console.log('[user provider] state', userState);
  //// language
  const intl = useIntl();
  //// toast message function from UI contexts
  const {setToastMessage} = useContext(UIContext);

  const testState = userState;
  //////// action creator
  //// set steem global props
  const fetchBlockchainGlobalProps = async (username: string = null) => {
    //// fetch global properties
    const globalProps = await fetchGlobalProps();
    console.log('[fetchBlockchainGlobalProps]', globalProps);
    if (globalProps) {
      // dispatch action
      dispatch({
        type: UserActionTypes.SET_GLOBAL_PROPS,
        payload: globalProps,
      });
    } else {
      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      return null;
    }

    //// estimate vote amount
    // check sanity
    if (!username) return;
    // get account
    const account = await getAccount(username);
    if (account) {
      const amount = await estimateVoteAmount(account, globalProps);
      console.log('[updateVoteAmount] amount', amount);
      dispatch({
        type: UserActionTypes.SET_VOTE_AMOUNT,
        payload: amount,
      });
    }
  };

  //// update vote amount
  const updateVoteAmount = async (username: string) => {
    console.log(
      '[updateVoteAmount] username',
      username,
      'global props',
      testState,
    );
    // estimate vote amount
    const account = await getAccount(username);
    if (account) {
      const amount = await estimateVoteAmount(account, userState.globalProps);
      console.log('[updateVoteAmount] amount', amount);
      dispatch({
        type: UserActionTypes.SET_VOTE_AMOUNT,
        payload: amount,
      });
    }
  };

  //// fetch user wallet data
  const getWalletData = async (username: string) => {
    console.log('[getWalletData] username', username);
    // fetch user wallet data
    const walletData = await fetchWalletData(username);
    if (walletData) {
      console.log('[getWalletData] wallet data', walletData);
      // parse transaction
      const parsedTransactions = walletData.transactions
        .map((transaction) => {
          return parseBlurtTransaction(transaction);
        })
        .reverse();
      walletData.transactions = parsedTransactions;
      console.log(
        '[getWalletData] wallet transaction',
        walletData.transactions,
      );
      // dispatch action
      dispatch({
        type: UserActionTypes.SET_WALLET_DATA,
        payload: walletData,
      });
      return walletData;
    } else {
      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      console.log('[getWalletData] walletData not fetched', walletData);
      return null;
    }
  };

  const getUserProfileData = async (username: string) => {
    // check sanity
    if (!username) return null;
    const profileData = await fetchUserProfile(username);
    console.log('[getUserProfile] profile data fetched', profileData);
    // dispatch action
    if (profileData) {
      dispatch({
        type: UserActionTypes.SET_PROFILE_DATA,
        payload: profileData,
      });
    } else {
      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      return null;
    }
    return profileData;
  };

  const getNotifications = async (username: string) => {
    if (!username) return [];
    const notifications = await fetchNotifications(username);

    console.log('[getNotifications] notifications', notifications);
    if (notifications) {
      return notifications;
    } else {
      //      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      setToastMessage(intl.formatMessage({id: 'Notifications.maintenance'}));
      return [];
    }
  };

  const getPrice = async () => {
    const {price_usd} = await fetchPrice();
    console.log('[getPrice] price', price_usd);
    if (price_usd) {
      dispatch({
        type: UserActionTypes.SET_PRICE,
        payload: price_usd,
      });
      return price_usd;
    } else {
      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      return null;
    }
  };

  //////// follow
  //// follow, unfollow
  const updateFollowState = async (
    follower: string,
    password: string,
    following: string,
    action: string,
  ) => {
    const {chainProps} = userState.globalProps;
    const op_fee = parseFloat(chainProps.operation_flat_fee.split(' ')[0]);
    const bw_fee = parseFloat(chainProps.bandwidth_kbytes_fee.split(' ')[0]);

    const result = await updateFollow(
      follower,
      password,
      following,
      action,
      op_fee,
      bw_fee,
    );
    console.log('[updateFollowState] transaction result', result);
    if (result) return result;
    setToastMessage(intl.formatMessage({id: 'update_error'}));
    return null;
  };

  //// get followings
  const getFollowings = async (follower: string) => {
    const startFollowing: string = '';
    const followingType: string = 'blog';
    const limit: number = 1000;
    const result = await fetchFollowings(
      follower,
      startFollowing,
      followingType,
      limit,
    );
    if (result) {
      // get the followings
      const followings = result.map((item) => {
        return item.following;
      });
      // dispatch action
      dispatch({
        type: UserActionTypes.SET_FOLLOWINGS,
        payload: followings,
      });
      return followings;
    } else {
      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      return [];
    }
  };

  //// get followings
  const getFollowers = async (username: string) => {
    const startFollowing: string = '';
    const followingType: string = 'blog';
    const limit: number = 1000;
    const result = await fetchFollowers(
      username,
      startFollowing,
      followingType,
      limit,
    );
    if (!result) {
      setToastMessage(intl.formatMessage({id: 'fetch_error'}));
      return [];
    }
    // get the followers
    const followers = result.map((item) => {
      return item.follower;
    });
    // dispatch action
    dispatch({
      type: UserActionTypes.SET_FOLLOWERS,
      payload: followers,
    });
    return followers;
  };

  return (
    <UserContext.Provider
      value={{
        userState,
        fetchBlockchainGlobalProps,
        updateVoteAmount,
        getWalletData,
        getUserProfileData,
        getNotifications,
        getPrice,
        updateFollowState,
        getFollowings,
        getFollowers,
      }}>
      {children}
    </UserContext.Provider>
  );
};

//// helper functions

export {UserContext, UserProvider};
