//// react
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
//// react native
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
//// ui, styles
//// contexts
import {UIContext} from '~/contexts';
import {PostData} from '~/contexts/types';
//// etc
import {PostsFeedView} from './PostsFeedView';

//// props
interface Props {
  posts: PostData[];
  reloading: boolean;
  noFetchMore: boolean;
  fetchPosts: (appending?: boolean) => void;
}
//// component
const PostsFeed = (props: Props): JSX.Element => {
  //// props
  const {posts, fetchPosts} = props;
  //// context
  const {setSearchParam} = useContext(UIContext);
  //// state
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSearchFAB, setShowSearchFAB] = useState(false);
  const [query, setQuery] = useState('');
  //// ref
  const searchRef = useRef(null);

  //////// effects
  //// event: mount
  useFocusEffect(
    useCallback(() => {
      // show feed posts
      // setPostsType(PostsTypes.FEED);
    }, []),
  );
  //// event: posts loaded
  useEffect(() => {
    if (props.posts) setShowSearchFAB(true);
  }, [props.posts]);

  //// handle press search icon
  const _handlePressFAB = () => {
    // show search action sheet
    searchRef.current?.setModalVisible(true);
  };

  //// handle query change
  const _handleQueryChange = (_query: string) => {
    // set query
    setQuery(_query);
  };

  //// handle refresh event
  const _refreshPosts = async () => {
    console.log('PostsFeed] refresh event');
    // hide the FAB
    setShowSearchFAB(false);
    // fetch posts
    await fetchPosts(false);
    // show the FAB
    setShowSearchFAB(true);
  };

  //// fetch more posts
  const _fetchMorePosts = async () => {
    console.log('[Feed] fetchMorePosts, noFetchMore', props.noFetchMore);
    if (props.noFetchMore) return;
    // set loading more flag
    setLoadingMore(true);
    // fetch posts with appending
    await fetchPosts(true);
    // clear loading more flag
    setLoadingMore(false);
  };

  //// submit query
  const _submitQuery = (query: string) => {
    console.log('handle submit search');
    // set search param in the context
    setSearchParam(query);
    // navigate to search screen
    navigate({name: 'SearchFeed'});
  };

  return (
    <PostsFeedView
      posts={posts}
      query={query}
      searchRef={searchRef}
      showSearchFAB={showSearchFAB}
      reloading={props.reloading}
      loadingMore={loadingMore}
      handlePressFAB={_handlePressFAB}
      handleQueryChange={_handleQueryChange}
      handleSubmitSearch={_submitQuery}
      refreshPosts={_refreshPosts}
      fetchMorePosts={_fetchMorePosts}
    />
  );
};

export {PostsFeed};
