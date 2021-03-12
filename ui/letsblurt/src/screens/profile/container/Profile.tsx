import React, {useState, useContext, useEffect, useCallback} from 'react';
import {View, ActivityIndicator, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
//// language
import {useIntl} from 'react-intl';
import firestore from '@react-native-firebase/firestore';
import {get, has} from 'lodash';
import {ProfileScreen} from '../screen/Profile';
import {ProfileEditForm} from '../screen/ProfileEdit';
import {
  AuthContext,
  UserContext,
  UIContext,
  PostsContext,
  SettingsContext,
} from '~/contexts';
import {PostsTypes, PostData, PostRef, ProfileData} from '~/contexts/types';
import {
  signImage,
  broadcastProfileUpdate,
  fetchPostsSummary,
} from '~/providers/blurt/dblurtApi';
import {uploadImage} from '~/providers/blurt/imageApi';
import {argonTheme} from '~/constants';
import {Block} from 'galio-framework';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
//// components
import {SecureKey} from '~/components';
import {KeyTypes} from '~/contexts/types';

import {navigate} from '~/navigation/service';
import {updateLocale} from 'moment';

const Profile = ({navigation}): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  // contexts
  const {authState} = useContext(AuthContext)!;
  const {setPostRef} = useContext(PostsContext);
  const {
    userState,
    getUserProfileData,
    getNotifications,
    getFollowings,
    getFollowers,
  } = useContext(UserContext);
  const {uiState, setAuthorParam, setToastMessage} = useContext(UIContext);
  const {
    postsState,
    fetchPosts,
    fetchBookmarks,
    fetchFavorites,
    clearPosts,
    setPostDetails,
  } = useContext(PostsContext);
  const {settingsState} = useContext(SettingsContext);
  // states
  const [profileData, setProfileData] = useState<ProfileData>(null);
  const [profileFetched, setProfileFetched] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [blogs, setBlogs] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [postsFetching, setPostsFetching] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSecureKey, setShowSecureKey] = useState(false);
  const [profileParams, setProfileParams] = useState(null);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (authState.loggedIn && !fetching) {
  //       const {username} = authState.currentCredentials;
  //       // clear edit mode
  //       setEditMode(false);
  //       setProfileFetched(false);
  //       _getUserProfileData(username);
  //       _fetchBookmarks(username);
  //       _fetchFavorites(username);
  //     }
  //   }, []),
  // );

  //// fetch user state
  useEffect(() => {
    if (authState.loggedIn && !fetching) {
      const {username} = authState.currentCredentials;
      setProfileFetched(false);
      _getUserProfileData(username);
      _fetchBookmarks(username);
      _fetchFavorites(username);
    }
  }, [authState.currentCredentials]);

  //// edit event
  useEffect(() => {
    if (!editMode && profileData && !fetching) {
      const {username} = authState.currentCredentials;
      _getUserProfileData(username);
    }
  }, [editMode]);

  const _getUserProfileData = async (author: string) => {
    setFetching(true);
    // fetch user profile data
    const _profileData = await getUserProfileData(author);
    if (!_profileData) {
      console.log('[_getUserProfileData] profile data', profileData);
      setProfileFetched(false);
      setFetching(false);
      return;
    }
    // set profile data
    setProfileData(_profileData);
    // build summaries of blogs
    if (_profileData) {
      setAvatarUrl(_profileData.profile.metadata.profile_image);
      //      setAvatarUrl(`${settingsState.blockchains.image}/u/${author}/avatar`);
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
      setFetching(false);
    }
  };

  //// fetch bookmarks
  const _fetchBookmarks = async (username: string) => {
    const bookmarks = await fetchBookmarks(username);
    // set bookmarks
    setBookmarks(bookmarks);
  };

  //// fetch favorites
  const _fetchFavorites = async (username: string) => {
    const favorites = await fetchFavorites(username);
    // set favorites
    setFavorites(favorites);
  };

  ////
  const _handlePressAuthor = (author: string) => {
    const {username} = authState.currentCredentials;
    if (username !== author) {
      // set author param
      setAuthorParam(author);
      // navigate
      navigate({name: 'AuthorProfile'});
    } else {
      // navigate profile
      navigate({name: 'Profile'});
    }
  };

  ////
  const _handlePressEdit = () => {
    setEditMode(true);
  };

  //// clear posts
  // TODO: is this necessary?
  const _clearPosts = async () => {
    console.log('[ProfileContainer] clear posts');
    //    clearPosts(PostsTypes.FEED);
  };

  /////// edit related
  ////
  const _handleUploadedImageURL = (url: string) => {
    setAvatarUrl(url);
  };

  //// handle press bookmark
  const _handlePressBookmark = (postRef: PostRef) => {
    // set post ref
    setPostRef(postRef);
    //
    setPostDetails(null);
    // navigate to the post details
    navigate({name: 'PostDetails'});
  };

  //// update the profile
  const _handlePressUpdate = async (_params: any) => {
    if (authState.loggedIn) {
      // set updating
      setUpdating(true);
      const {username, password, type} = authState.currentCredentials;

      const params = {
        ..._params,
        profile_image: avatarUrl,
        cover_image: profileData.profile.metadata.cover_image,
      };

      console.log('after _handlePressUpdate. params', params);

      // set profile params
      setProfileParams(params);

      //// this action requires active key or above
      // check the key level
      if (type < KeyTypes.ACTIVE) {
        // show key input modal
        setShowSecureKey(true);
        return;
      }

      // broadcast the transaction
      _updateProfile(password, params);
    }
  };

  //// update the profile
  const _updateProfile = async (_password, _params) => {
    const {username} = authState.currentCredentials;
    // broadcast the update to blockchain
    const result = await broadcastProfileUpdate(username, _password, _params);
    if (result) {
      setToastMessage(intl.formatMessage({id: 'Profile.profile_updated'}));
      // update profile data
      const _profileData = {
        ...profileData,
        profile: {...profileData.profile, metadata: _params},
      };
      setProfileData(_profileData);
    } else {
      setToastMessage(intl.formatMessage({id: 'Profile.profile_update_error'}));
    }
    // reset edit mode
    setEditMode(false);
    // reset the updating flag
    setUpdating(false);
  };

  ////
  const _handleSecureKeyResult = (result: boolean, _password: string) => {
    if (result) {
      // reset secure key flag
      setShowSecureKey(false);
      // execute the update
      _updateProfile(_password, profileParams);
      return;
    }
    // // show message
    setToastMessage(
      intl.formatMessage({id: 'Transaction.need_higher_password'}),
    );
  };

  const _handlePressCancelUpdate = () => {
    setEditMode(false);
  };

  const _cancelSecureKey = () => {
    setShowSecureKey(false);
    // reset the updating flag
    setUpdating(false);
  };

  //// remove a bookmark in firestore
  const _removeBookmark = async (postRef: PostRef) => {
    const {username} = authState.currentCredentials;
    const docId = `${postRef.author}${postRef.permlink}`;
    // remove the bookmark doc
    firestore()
      .doc(`users/${username}`)
      .collection('bookmarks')
      .doc(docId)
      .delete()
      .then(() => {
        // refresh
        _fetchBookmarks(username);
        console.log('removed the bookmark successfully');
      })
      .catch((error) => console.log('failed to remove a bookmark', error));
  };

  //// remove a bookmark in firestore
  const _handleRemoveBookmark = async (postRef: PostRef, title: string) => {
    // show alert
    Alert.alert(
      intl.formatMessage({id: 'Profile.bookmark_remove_title'}),
      intl.formatMessage({id: 'Profile.bookmark_remove_body'}, {what: title}),
      [
        {text: intl.formatMessage({id: 'no'}), style: 'cancel'},
        {
          text: intl.formatMessage({id: 'yes'}),
          onPress: () => _removeBookmark(postRef),
        },
      ],
      {cancelable: true},
    );
  };

  //// remove a favorite author in firestore
  const _removeFavoriteAuthor = async (account: string) => {
    const {username} = authState.currentCredentials;
    // remove the favorite doc
    firestore()
      .doc(`users/${username}`)
      .collection('favorites')
      .doc(account)
      .delete()
      .then(() => {
        // refresh
        _fetchFavorites(username);
        console.log('removed the favorite successfully');
      })
      .catch((error) =>
        console.log('failed to remove a favorite author', error),
      );
  };

  const _handleRemoveFavorite = (account: string) => {
    // show alert
    Alert.alert(
      intl.formatMessage({id: 'Profile.favorite_remove_title'}),
      intl.formatMessage({id: 'Profile.favorite_remove_body'}, {what: account}),
      [
        {text: intl.formatMessage({id: 'no'}), style: 'cancel'},
        {
          text: intl.formatMessage({id: 'yes'}),
          onPress: () => _removeFavoriteAuthor(account),
        },
      ],
      {cancelable: true},
    );
  };

  //// refresh user's blogs
  const _refreshPosts = async () => {
    // clear blogs
    setBlogs(null);
    setRefreshing(true);
    const {username} = authState.currentCredentials;
    await _getUserProfileData(username);
    setRefreshing(false);
  };

  //// refresh bookmarks
  const _refreshBookmarks = async () => {
    setRefreshing(true);
    setBookmarks(null);
    const {username} = authState.currentCredentials;
    await _fetchBookmarks(username);
    setRefreshing(false);
  };

  //// refresh favorites
  const _refreshFavorites = async () => {
    setRefreshing(true);
    setFavorites(null);
    const {username} = authState.currentCredentials;
    await _fetchFavorites(username);
    setRefreshing(false);
  };

  return !editMode ? (
    profileData ? (
      <ProfileScreen
        profileData={profileData}
        blogs={blogs}
        bookmarks={bookmarks}
        favorites={favorites}
        imageServer={settingsState.blockchains.image}
        handlePressAuthor={_handlePressAuthor}
        refreshing={refreshing}
        refreshPosts={_refreshPosts}
        refreshBookmarks={_refreshBookmarks}
        refreshFavorites={_refreshFavorites}
        clearPosts={_clearPosts}
        handlePressEdit={_handlePressEdit}
        handlePressBookmark={_handlePressBookmark}
        removeBookmark={_handleRemoveBookmark}
        removeFavorite={_handleRemoveFavorite}
      />
    ) : (
      !profileFetched && (
        <View style={{top: 20}}>
          <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
        </View>
      )
    )
  ) : !showSecureKey ? (
    profileData && (
      <ProfileEditForm
        profileData={profileData}
        uploading={uploading}
        updating={updating}
        avatarUrl={avatarUrl}
        handlePressUpdate={_handlePressUpdate}
        handlePressCancel={_handlePressCancelUpdate}
        handleUploadedImageURL={_handleUploadedImageURL}
      />
    )
  ) : (
    <SecureKey
      showModal={true}
      username={authState.currentCredentials.username}
      requiredKeyType={KeyTypes.ACTIVE}
      handleResult={_handleSecureKeyResult}
      cancelProcess={_cancelSecureKey}
    />
  );
};

export {Profile};

/*

// tab press handling: show user's profile
  useEffect(() => {
    const unsubscribe = navigation
      .dangerouslyGetParent()
      .addListener('tabPress', (event) => {
        // prevent default behavior
        event.preventDefault();
        // clear the author in uiState
        setAuthorParam('');
        // clear posts
        clearPosts(PostsTypes.AUTHOR);
        // get username
        const username = authState.currentCredentials.username;
        console.log('username', username);
        // check sanity
        if (authState.loggedIn && username) {
          // fetch user's profile
          _fetchAuthorData(username);
        }
        // unsubscribe listening event
        return unsubscribe;
      });
  }, [navigation]);


  // handle screen focus event
  useFocusEffect(
    useCallback(() => {
      console.log(
        '[ProfileContainer] focus event. uiState author',
        uiState.selectedAuthor,
      );
      // fetch user profile, if no selected author
      if (!uiState.selectedAuthor || uiState.selectedAuthor === '') {
        // get username
        const username = authState.currentCredentials.username;
        // check sanity
        if (authState.loggedIn && username) {
          // fetch author data with username
          _fetchAuthorData(username);
        }
      } else {
        // selected author exists, let's fetch the author data
        _fetchAuthorData(uiState.selectedAuthor);
      }
    }, [uiState.selectedAuthor]),
  );

  // handling blur event: setup feed posts
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('blur', (event) => {
  //     console.log('[ProfileContainer] blur event. uiState', uiState);

  //     // clear the author in uiState
  //     setAuthor('');
  //     // setup feed posts
  //     setupFetchPosts(
  //       PostsTypes.FEED,
  //       uiState.tag,
  //       uiState.tagIndex,
  //       uiState.filterIndex,
  //       authState.currentCredentials.username,
  //     );

  //     return unsubscribe;
  //   });
  // }, [navigation]);


    const _fetchAuthorData = async (author: string) => {
    console.log('[fetchAuthorData] author', author);
    const profilePromise = new Promise((resolve, reject) =>
      //      resolve(fetchProfile(author)),
      resolve(),
    );
    const amountPromise = new Promise((resolve, reject) =>
      resolve(getVoteAmount(author, userState.globalProps)),
    );
    Promise.all([profilePromise, amountPromise]).then((results) => {
      console.log('[Profile] Promise Results', results);
      if (!results[0]) return;
      const userData: ProfileData = {
        profile: results[0],
        voteAmount: results[1],
      };
      // check if the author is the user
      userData.isUser =
        uiState.selectedAuthor === authState.currentCredentials.username;
      console.log('[fetchAuthorData] userData', userData);
      // set author data
      setAuthorData(userData);
    });
  };

  */
