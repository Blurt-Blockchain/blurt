//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
import {getCharacterLength} from '~/utils/strings';
import {substr_utf8_bytes} from '~/utils/strings';
const runes = require('runes');
import {sliceByByte} from '~/utils/strings';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants/argonTheme';
import {LIST_TITLE_LENGTH} from '~/constants/utils';
const {width, height} = Dimensions.get('screen');
//// contexts
import {PostsContext, UIContext} from '~/contexts';
//// components
import {ActionBar} from '../ActionBar';
import {ActionBarStyleProfile} from '~/constants/actionBarTypes';
//// etc
import {getTimeFromNow} from '~/utils/time';
import {PostsTypes} from '~/contexts/types';

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

//// props
interface Props {
  posts: any[];
  isUser: boolean;
  refreshing?: boolean;
  handlePressPosting?: () => void;
  refreshPosts?: () => void;
  fetchMore?: () => void;
}

const PostsListView = (props: Props): JSX.Element => {
  //// props
  // const posts = props.posts.slice(0, props.posts.length - 1);
  const {posts, refreshing} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {setPostRef, setPostDetails} = useContext(PostsContext);
  const {uiState, setAuthorParam, setToastMessage} = useContext(UIContext);
  //// states
  const [loadingMore, setLoadingMore] = useState(false);

  //// handle refresh event on posts
  const _onRefresh = () => {
    props.refreshPosts();
  };

  //// load more posts with bottom-reached event
  const _onLoadMore = async () => {
    //    setLoadingMore(true);
    //props.fetchMore && props.fetchMore();
  };

  const _onPressPost = (index: number) => {
    console.log('onPressPost. postRef');
    // navigate to the post details
    setPostRef(props.posts[index].state.post_ref);
    //
    setPostDetails(null);
    navigate({name: 'PostDetails'});
  };

  ////
  const _handlePressAuthor = (author: string) => {
    // set author param
    setAuthorParam(author);
    // navigate
    navigate({name: 'AuthorProfile'});
  };

  const _renderHeader = () => {
    return <Block></Block>;
  };

  //// render footer when loading more
  const _renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: height,
          paddingVertical: 20,
          marginTop: 10,
          marginBottom: 10,
          borderColor: theme.COLORS.PINK,
        }}>
        <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
      </View>
    );
  };

  //// render a post
  const _renderPost = (item: any, index: number) => {
    const {state} = item;
    const {title, createdAt, avatar} = state;
    const {author} = state.post_ref;
    return (
      <Block
        flex
        card
        row
        space="between"
        style={{
          marginBottom: 5,
          padding: 5,
          backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
        }}>
        <Block row middle style={{left: -20}}>
          <TouchableWithoutFeedback onPress={() => _handlePressAuthor(author)}>
            <Block center width={120}>
              <Image
                source={{
                  uri: avatar || null,
                }}
                style={styles.avatar}
              />
              {props.isUser && <Text size={10}>{author}</Text>}
            </Block>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => _onPressPost(index)}>
            <Block>
              <Text>{sliceByByte(title, LIST_TITLE_LENGTH)}</Text>
              <ActionBar
                actionBarStyle={ActionBarStyleProfile}
                postState={item.state}
                postsType={PostsTypes.AUTHOR}
                postIndex={index}
              />
            </Block>
          </TouchableWithoutFeedback>
        </Block>
        <Block middle>
          {createdAt && <Text>{getTimeFromNow(createdAt)}</Text>}
        </Block>
      </Block>
    );
  };

  return !refreshing ? (
    <FlatList
      contentContainerStyle={styles.posts}
      refreshing={refreshing}
      onRefresh={_onRefresh}
      data={posts}
      renderItem={({item, index}) => _renderPost(item, index)}
      keyExtractor={(item, index) => String(index)}
      initialNumToRender={5}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="small" />
    </View>
  );
};

export {PostsListView};

const styles = StyleSheet.create({
  posts: {
    width: '100%',
    paddingHorizontal: 5,
    paddingVertical: theme.SIZES.BASE * 1,
    paddingBottom: 20,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
});

//// render a post
// const _renderPost = (item: any, index: number) => {
//   const avatar = `${settingsState.blockchains.image}/u/${item.author}/avatar`;
//   return (
//     <TouchableWithoutFeedback onPress={() => _onPressPost(index)}>
//       <Block
//         flex
//         card
//         row
//         space="between"
//         style={{
//           marginBottom: 5,
//           padding: 5,
//           backgroundColor:
//             BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
//         }}>
//         <Block row middle style={{left: -20}}>
//           <Block center width={80}>
//             <Image
//               source={{
//                 uri: avatar || null,
//               }}
//               style={styles.avatar}
//             />
//             {props.isUser && <Text size={10}>{item.author}</Text>}
//           </Block>
//           <Block>
//             <Text>{sliceByByte(item.title, LIST_TITLE_LENGTH)}</Text>
//             {/* <ActionBar
//               actionBarStyle={ActionBarStyleFeed}
//               postState={item.state}
//               postsType={PostsTypes.FEED}
//               postIndex={index}
//             /> */}
//           </Block>
//         </Block>
//         <Block middle>
//           {item.createdAt && (
//             <Text>{getTimeFromNow(item.createdAt).split('ago')[0]}</Text>
//           )}
//         </Block>
//       </Block>
//     </TouchableWithoutFeedback>
//   );
// };

/*
const PostsListContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  const [posts, setPosts] = useState(null);
  const [fetched, setFetched] = useState(false);
  //// effect
  useEffect(() => {
    console.log('[PostsListsContainer] fetch posts');
    // fetch posts data from references (author/permlink)
    _getPosts(props.postsRefs);
  }, []);

  const _getPosts = async (refs: string[]) => {
    // refs format: author/permlink
    const promises = refs.map(async (ref) => {
      const authorPermlink = ref.split('/');
      console.log(
        '[PostsListsContainer] authorPermlink',
        authorPermlink[0],
        authorPermlink[1],
      );
      return fetchPost(authorPermlink[0], authorPermlink[1]);
    });
    const parsedPosts = await Promise.all(promises);
    console.log('[PostsListsContainer] parsed posts', parsedPosts);
    // set
    setPosts(parsedPosts);
  };

  return posts ? (
    <PostsListView posts={posts} isUser={false} />
  ) : (
    <ActivityIndicator color="pink" />
  );
};

export {PostsListContainer};
*/
