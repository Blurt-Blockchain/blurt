//// react
import React from 'react';
//// react native
import {
  View,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {TabView, SceneMap} from 'react-native-tab-view';
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
import {Images, argonTheme} from '~/constants';
import {HeaderHeight, LIST_TITLE_LENGTH} from '~/constants/utils';
import {getNumberStat} from '~/utils/stats';
import {Feed} from '~/screens';
import {PostsListView, ProfileContainer, DraggableList} from '~/components';
import {PostsTypes, PostData, PostRef, ProfileData} from '~/contexts/types';
import {sliceByByte} from '~/utils/strings';

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
const {width, height} = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

const initialLayout = {width: Dimensions.get('window').width};

interface Props {
  profileData: ProfileData;
  blogs: any[];
  bookmarks: any[];
  favorites: any[];
  imageServer: string;
  refreshing: boolean;
  handlePressAuthor: (author: string) => void;
  handlePressEdit: () => void;
  handlePressBookmark: (postRef: PostRef) => void;
  removeBookmark: (postRef: PostRef, title: string) => void;
  removeFavorite: (account: string) => void;
  refreshPosts: () => void;
  refreshBookmarks: () => void;
  refreshFavorites: () => void;
  clearPosts: () => void;
}
const ProfileScreen = (props: Props): JSX.Element => {
  //// props
  const {refreshing, blogs} = props;
  console.log('[Profile] test props', props);

  const intl = useIntl();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'blogs', title: intl.formatMessage({id: 'Profile.blog_tab'})},
    {key: 'bookmarks', title: intl.formatMessage({id: 'Profile.bookmark_tab'})},
    {key: 'favorites', title: intl.formatMessage({id: 'Profile.favorite_tab'})},
  ]);

  const BlogList = () =>
    props.blogs && (
      <PostsListView
        posts={blogs}
        isUser
        refreshing={refreshing}
        refreshPosts={props.refreshPosts}
      />
    );

  const BookmarkList = () =>
    props.bookmarks && (
      <DraggableList
        data={props.bookmarks}
        renderItem={_renderBookmarkItem}
        onRefresh={props.refreshBookmarks}
      />
    );

  const FavoriteList = () =>
    props.favorites && (
      <DraggableList
        data={props.favorites}
        renderItem={_renderFavoriteItem}
        onRefresh={props.refreshFavorites}
      />
    );

  const renderScene = SceneMap({
    blogs: BlogList,
    bookmarks: BookmarkList,
    favorites: FavoriteList,
  });

  ////
  const _renderBookmarkItem = ({item, index, drag, isActive}) => {
    const avatar = `${props.imageServer}/u/${item.author}/avatar`;
    return (
      <Block
        card
        row
        space="between"
        style={{
          marginBottom: 5,
          padding: 5,
          backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
        }}>
        <Block row middle style={{left: -20}}>
          <TouchableWithoutFeedback
            onPress={() => props.handlePressAuthor(item.author)}>
            <Block center width={120}>
              <Image
                source={{
                  uri: avatar || null,
                }}
                style={styles.itemAvatar}
              />
              <Text size={10}>{item.author}</Text>
            </Block>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => props.handlePressBookmark(item.postRef)}>
            {<Text>{sliceByByte(item.title, LIST_TITLE_LENGTH)}</Text>}
          </TouchableWithoutFeedback>
        </Block>
        <Block center>
          <Icon
            onPress={() => props.removeBookmark(item.postRef, item.title)}
            size={20}
            name="remove-circle"
            family="ionicon"
            color={argonTheme.COLORS.MUTED}
          />
        </Block>
      </Block>
    );
  };

  ////
  const _renderFavoriteItem = ({item, index, drag, isActive}) => {
    const avatar = `${props.imageServer}/u/${item.author}/avatar`;
    return (
      <Block
        card
        row
        space="between"
        style={{
          marginBottom: 5,
          padding: 5,
          backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
        }}>
        <TouchableWithoutFeedback
          onPress={() => props.handlePressAuthor(item.author)}>
          <Block row center>
            <Image
              source={{
                uri: avatar || null,
              }}
              style={styles.itemAvatar}
            />
            <Text size={14} color={argonTheme.COLORS.FACEBOOK}>
              {item.author}
            </Text>
          </Block>
        </TouchableWithoutFeedback>
        <Block center>
          <Icon
            onPress={() => props.removeFavorite(item.author)}
            size={20}
            name="remove-circle"
            family="ionicon"
            color={argonTheme.COLORS.MUTED}
          />
        </Block>
      </Block>
    );
  };

  return (
    <Block flex style={styles.profileScreen}>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <ProfileContainer
          profileData={props.profileData}
          isUser={true}
          handlePressEdit={props.handlePressEdit}
        />
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          tabBarPosition="top"
        />
      </ImageBackground>
    </Block>
  );
};

export {ProfileScreen};

const styles = StyleSheet.create({
  profileScreen: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight / 100 : 0,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
    flex: 1,
  },
  profileBackground: {
    width: width,
    height: height / 3,
    flex: 1,
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
  },
  stats: {
    paddingHorizontal: 40,
    backgroundColor: theme.COLORS.WHITE,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -80,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
  },
  itemAvatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
    marginHorizontal: 10,
  },
});
