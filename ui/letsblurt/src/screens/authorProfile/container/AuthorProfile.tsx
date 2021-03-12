//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block} from 'galio-framework';
//// contexts
import {
  PostsContext,
  AuthContext,
  UIContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// blockchain
import {fetchUserProfile, fetchPostsSummary} from '~/providers/blurt/dblurtApi';
//// etc
import {AuthorProfileScreen} from '../screen/AuthorProfile';
import {get, has} from 'lodash';
const {width, height} = Dimensions.get('screen');
import {argonTheme} from '~/constants';

//// props
interface Props {
  posts: PostData[];
}
//// component
const AuthorProfile = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  const {fetchPosts} = useContext(PostsContext);
  const {uiState} = useContext(UIContext);
  const {getWalletData} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [profileFetched, setProfileFetched] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  //////// effects
  //// author set event
  useEffect(() => {
    console.log(
      '[AuthorProfileContainer] selected author',
      uiState.selectedAuthor,
    );
    // clear profile, blogs
    setBlogs(null);
    setProfileData(null);
    // start to fetch author profile
    setProfileFetched(false);
    _getAuthorProfile(uiState.selectedAuthor);
  }, [uiState.selectedAuthor]);
  //// profile fetched event
  useEffect(() => {
    // start to fetch wallet data
    if (profileFetched) _getAuthorWallet(uiState.selectedAuthor);
  }, [profileFetched]);

  //////// functions
  ////
  const _getAuthorProfile = async (author: string) => {
    const _profileData = await fetchUserProfile(author);
    console.log('[_getAuthorProfile] profile data', _profileData);
    // set profile data
    setProfileData(_profileData);
    // build summaries of blogs
    if (_profileData) {
      const startRef = {author: null, permlink: null};
      const {fetchedPosts} = await fetchPosts(
        PostsTypes.AUTHOR,
        0,
        0,
        authState.loggedIn ? authState.currentCredentials.username : null,
        false,
        false,
        author,
      );

      console.log('[_getAuthorProfile] blog summarys', fetchedPosts);
      setBlogs(fetchedPosts);
      setProfileFetched(true);
    }
  };

  ////
  const _getAuthorWallet = async (author: string) => {
    const walletData = await getWalletData(author);
    console.log('[_getAuthorWallet] wallet Data', walletData);
    setWalletStats(walletData);
  };

  //// refresh user's blogs
  const _refreshPosts = async () => {
    setRefreshing(true);
    // clear blogs
    setBlogs(null);
    await _getAuthorProfile(uiState.selectedAuthor);
    setRefreshing(false);
  };

  const _refreshWallet = async () => {};

  return profileData ? (
    <AuthorProfileScreen
      profileData={profileData}
      blogs={blogs}
      walletData={walletStats}
      refreshing={refreshing}
      refreshPosts={_refreshPosts}
      refreshWallet={_refreshWallet}
    />
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
    </View>
  );
};

export {AuthorProfile};
