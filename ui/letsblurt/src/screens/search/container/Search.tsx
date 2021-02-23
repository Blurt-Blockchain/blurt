//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  Platform,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// firebase
import {firebase} from '@react-native-firebase/functions';
////
import axios, {AxiosResponse} from 'axios';
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
  SettingsContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc
import {SearchScreen} from '../screen/Search';
import {parseCatAuthorPermlink} from '~/utils/postUrlParser';
import {get, isLength} from 'lodash';

//// props
interface Props {
  posts: PostData[];
  fetchPosts: (appending?: boolean) => void;
  clearPosts: () => void;
}
//// component
const SearchFeed = (props: Props): JSX.Element => {
  //// props

  //// contexts
  const {setPostRef, setPostDetails} = useContext(PostsContext);
  const {uiState, setToastMessage} = useContext(UIContext);
  const {authState} = useContext(AuthContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [searchItems, setSearchItems] = useState([]);
  const [searchText, setSearchText] = useState(uiState.searchText);
  const [startIndex, setStartIndex] = useState(1);
  const [loadedAll, setLoadedAll] = useState(false);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  //// effects
  useEffect(() => {
    if (uiState.searchText != '') {
      // clear loaded all
      setLoadedAll(false);
      // start search
      _fetchSearch(uiState.searchText);
    }
  }, [uiState.searchText]);

  ////
  // useEffect(() => {
  //   console.log('[useEffect|searchText] searchText', searchText);
  //   if (searchText.length > 0 && startIndex < 100) {
  //     // clear loaded all
  //     setLoadedAll(false);
  //     // start search
  //     _fetchSearch(searchText);
  //   } else if (startIndex >= 100) setLoadedAll(true);
  // }, [searchText]);

  const _handleSearch = async () => {
    console.log('_handleSearch. text', searchText);
    // clear search items
    setSearchItems([]);
    // start search text
    if (searchText.length > 0 && startIndex < 100) {
      // clear loaded all
      setLoadedAll(false);
      // start search
      _fetchSearch(searchText);
    } else if (startIndex >= 100) setLoadedAll(true);

    // clear start index
    setStartIndex(1);
  };

  const _handleActive = (_active: boolean) => {
    setActive(_active);
  };

  const _handleSearchChange = (_text: string) => {
    console.log('_handleSearchChange. text', _text);
    setSearchText(_text);
  };

  const _handleLoadMore = async (text?: string) => {
    console.log('[search] _handleLoadMore. searchText', searchText);
    // // do not search if all loaded
    // if (!loadedAll) {
    //   // fetch more
    //   if (text != '') _fetchSearch(text);
    //   else _fetchSearch(searchText);
    // }
  };

  const _fetchSearch = async (text: string) => {
    // need to log in to search
    if (!authState.loggedIn) {
      console.log('you need to log in to search posts');
      return;
    }
    let response = null;
    try {
      response = await firebase.functions().httpsCallable('searchRequest')({
        query: text,
        startAt: startIndex,
        num: 10,
        sort: '',
      });
      console.log('search results', response);
    } catch (error) {
      console.log('failed to search', error);
      return;
    }

    // check response
    if (!response.data) {
      //      setToastMessage('Nothing Found');
      setLoadedAll(true);
      //      setSearchText('');
      return null;
    }

    const {items} = response.data;
    console.log('search items', items);

    if (!items) {
      return;
    }

    // filtering first
    // map
    let _items = [];
    items.forEach((item) => {
      const match = parseCatAuthorPermlink(item.link);
      console.log('match', match);
      match &&
        _items.push({
          author: match.author,
          postRef: {
            author: match.author,
            permlink: match.permlink,
          },
          title: item.title,
          createdAt: get(item.pagemap.metatags[0], 'article:published_time'),
        });
    });
    console.log('filtered items', _items);
    setSearchItems(_items);

    //    setSearchItems(searchItems.concat(_items));
    // update start index: start index + how many searched (not actual items)
    //    setStartIndex(startIndex + items.length);
    //    setSearchText('');
  };

  const _handleRefresh = async () => {
    setSearchItems([]);
    setStartIndex(1);
    setSearchText(searchText);
    // search
    _handleSearch();
  };

  const _navigateToPost = (index: number) => {
    console.log('navigateToPost. postRef', searchItems[index]);
    // navigate to the post details
    setPostRef(searchItems[index].postRef);
    //
    setPostDetails(null);
    navigate({name: 'PostDetails'});
  };

  return (
    <SearchScreen
      searchText={searchText}
      active={active}
      items={searchItems}
      loading={loading}
      imageServer={settingsState.blockchains.image}
      handleSearch={_handleSearch}
      handleSearchChange={_handleSearchChange}
      handleActive={_handleActive}
      handleRefresh={_handleRefresh}
      handleLoadMore={_handleLoadMore}
      handlePressPost={_navigateToPost}
    />
  );
};

export {SearchFeed};
