//// react
import React from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
//// react navigation
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import FAB from 'react-native-fab';
import ActionSheet from 'react-native-actions-sheet';

import {argonTheme} from '~/constants/argonTheme';
const {width, height} = Dimensions.get('screen');
//// contexts
import {PostData} from '~/contexts/types';
//// etc
import {Post} from '~/components/Post';
import {ActionBarStyleFeed} from '~/constants/actionBarTypes';

//// props
interface Props {
  posts: PostData[];
  query: string;
  username?: string;
  reloading: boolean;
  loadingMore: boolean;
  showSearchFAB: boolean;
  searchRef: any;
  handlePressFAB: () => void;
  handleQueryChange: (query: string) => void;
  handleSubmitSearch: (searchText: string) => void;
  refreshPosts: () => void;
  fetchMorePosts: () => void;
}

const PostsFeedView = (props: Props): JSX.Element => {
  //// props
  const {
    query,
    showSearchFAB,
    searchRef,
    posts,
    username,
    loadingMore,
    reloading,
  } = props;
  //// language
  const intl = useIntl();

  //// header
  const _renderHeader = () => {
    return <Block></Block>;
  };

  //// render posts
  const _renderPosts = () => {
    if (!props.posts) return;

    return (
      <FlatList
        contentContainerStyle={styles.posts}
        refreshing={props.reloading}
        onRefresh={props.refreshPosts}
        onEndReached={props.fetchMorePosts}
        onEndReachedThreshold={1.5}
        data={posts}
        renderItem={({item, index}) => _renderPost(item, index)}
        keyExtractor={(item, index) => String(index)}
        initialNumToRender={5}
        ListHeaderComponent={_renderHeader}
        ListFooterComponent={_renderFooter}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  //// render a post
  const _renderPost = (item: PostData, index: number) => {
    return (
      <Post
        post={item}
        index={index}
        username={username}
        actionBarStyle={ActionBarStyleFeed}
      />
    );
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

  return (
    <View>
      {!reloading ? (
        _renderPosts()
      ) : (
        <View style={{top: 20}}>
          <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
        </View>
      )}
      {props.posts && !props.reloading && (
        <FAB
          buttonColor="red"
          iconTextColor="#FFFFFF"
          onClickAction={props.handlePressFAB}
          visible={showSearchFAB}
          iconTextComponent={
            <Icon family="antdesign" size={16} name="search1" />
          }
        />
      )}
      <ActionSheet ref={searchRef}>
        <Block shadow center style={styles.searchBar}>
          <Text size={20}>
            {intl.formatMessage({id: 'Actionsheet.search'})}
          </Text>
          <Input
            right
            color="black"
            style={styles.search}
            autoFocus
            onChangeText={props.handleQueryChange}
            onSubmitEditing={() => {
              searchRef.current?.setModalVisible(false);
              props.handleSubmitSearch(query);
            }}
            placeholder={intl.formatMessage({
              id: 'Actionsheet.search_placeholder',
            })}
            placeholderTextColor={'#8898AA'}
            iconContent={
              <TouchableWithoutFeedback
                onPress={() => {
                  searchRef.current?.setModalVisible(false);
                  props.handleSubmitSearch(query);
                }}>
                <Icon
                  size={24}
                  color={theme.COLORS.MUTED}
                  name="search1"
                  family="antdesign"
                />
              </TouchableWithoutFeedback>
            }
          />
        </Block>
      </ActionSheet>
    </View>
  );
};

export {PostsFeedView};

const styles = StyleSheet.create({
  posts: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 2,
  },
  searchBar: {
    backgroundColor: argonTheme.COLORS.ERROR,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: argonTheme.COLORS.BORDER,
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
});
