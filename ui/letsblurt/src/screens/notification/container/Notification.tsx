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
import {fetchUserProfile, fetchWalletData} from '~/providers/blurt/dblurtApi';
//// etc
import {get, has} from 'lodash';
import {NotificationScreen} from '../screen/Notification';

interface Props {}

const Notification = (props: Props): JSX.Element => {
  //// props
  //// contexts
  const {setPostRef, setPostDetails} = useContext(PostsContext);
  const {getNotifications} = useContext(UserContext);
  const {authState} = useContext(AuthContext);
  const {setAuthorParam} = useContext(UIContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [username, setUsername] = useState('');
  const [fetching, setFetching] = useState(false);
  const [notifications, setNotifications] = useState(null);

  //////// effects
  //// focus event
  useFocusEffect(
    useCallback(() => {
      if (authState.loggedIn)
        setUsername(authState.currentCredentials.username);
      _fetchNotifications(authState.currentCredentials.username);
    }, []),
  );
  //// username change event
  useEffect(() => {
    if (authState.loggedIn) {
      setUsername(authState.currentCredentials.username);
      // fetch notifications
      _fetchNotifications(authState.currentCredentials.username);
    }
  }, [authState.currentCredentials]);
  //// fetch notifications
  const _fetchNotifications = async (username) => {
    // clear notification
    setNotifications(null);
    setFetching(true);
    const _notifications = await getNotifications(username);
    setNotifications(_notifications);
    setFetching(false);
  };

  //// handle press item
  const _handlePressItem = (author: string, permlink: string) => {
    // check if permlink exists
    if (permlink) {
      // set post ref
      setPostRef({author, permlink});
      //
      setPostDetails(null);
      // navigate to the post
      navigate({name: 'PostDetails'});
    } else {
      // set author param
      setAuthorParam(author);
      // navigate to the author profile
      navigate({name: 'AuthorProfile'});
    }
  };

  //// handle refresh list
  const _handleRefresh = async () => {
    // fetch notifications
    _fetchNotifications(username);
  };
  return (
    <NotificationScreen
      notifications={notifications}
      fetching={fetching}
      username={authState.currentCredentials.username}
      imageServer={settingsState.blockchains.image}
      handlePressItem={_handlePressItem}
      handleRefresh={_handleRefresh}
    />
  );
};

export {Notification};
