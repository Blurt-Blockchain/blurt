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

//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants/argonTheme';
const {width, height} = Dimensions.get('screen');
import Modal from 'react-native-modal';

//// contexts
import {
  PostsContext,
  UIContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

//// props
interface Props {
  authors: string[];
  showModal: boolean;
  handlePressAuthor: (author: string) => void;
  cancelModal?: () => void;
}

const AuthorListView = (props: Props): JSX.Element => {
  //// props
  console.log('AuthorListView. props', props);
  const {authors, showModal} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {uiState, setAuthorParam} = useContext(UIContext);
  const {userState} = useContext(UserContext);
  const {setPostRef} = useContext(PostsContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  //  const [showModal, setShowModal] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchedItems, setSearchedItems] = useState(authors || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);

  const _onPressAuthor = (author: string) => {
    console.log('[AuthorList] onPressAuthor');
    //   setShowModal(false);
    props.handlePressAuthor(author);
  };

  const _onSubmitSearch = () => {
    console.log('_onSubmitSearch. search text', searchText);
    //    setSearchParam(searchText);
    //    setShowModal(false);
    props.handlePressAuthor(searchText);
  };

  const _handleTextChange = (text: string) => {
    console.log('search text222', searchText);
    // // filter
    if (text === '') {
      setSearchedItems(authors);
    } else {
      const _filterdItems = authors.filter(
        (author) => text && author.includes(text),
      );
      setSearchedItems(_filterdItems);
    }
    // set text
    setSearchText(text);
  };

  const _renderHeader = () => {
    const iconSearch =
      searchText === '' ? (
        <TouchableWithoutFeedback onPress={() => setSearchText('')}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="page-remove"
            family="foundation"
          />
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback onPress={_onSubmitSearch}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="magnifying-glass"
            family="entypo"
          />
        </TouchableWithoutFeedback>
      );

    return (
      <Block center>
        <Input
          style={styles.searchContainer}
          right
          color={argonTheme.COLORS.ERROR}
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize="none"
          iconContent={iconSearch}
          defaultValue={searchText}
          placeholder={intl.formatMessage({id: 'Profile.search_author'})}
          placehoderTextColor={argonTheme.COLORS.INPUT}
          onChangeText={_handleTextChange}
          onSubmitEditing={_onSubmitSearch}
        />
      </Block>
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

  //// render an item
  const _renderItem = (author: string, index: number) => {
    const avatar = `${settingsState.blockchains.image}/u/${author}/avatar`;
    return (
      <TouchableWithoutFeedback onPress={() => _onPressAuthor(author)}>
        <Block
          flex
          card
          row
          space="between"
          style={{
            marginBottom: 5,
            padding: 5,
            backgroundColor:
              BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          }}>
          <Block row middle>
            <Image
              source={{
                uri: avatar || null,
              }}
              style={styles.avatar}
            />
            <Text size={14} style={{marginHorizontal: 5}}>
              {author}
            </Text>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={props.cancelModal}>
      <Block card style={styles.container}>
        <FlatList
          contentContainerStyle={styles.posts}
          data={searchedItems}
          renderItem={({item, index}) => _renderItem(item, index)}
          keyExtractor={(item, index) => String(index)}
          initialNumToRender={5}
          ListHeaderComponent={_renderHeader}
          ListFooterComponent={_renderFooter}
          showsVerticalScrollIndicator={false}
        />
      </Block>
    </Modal>
  );
};

export {AuthorListView};

const styles = StyleSheet.create({
  container: {
    width: width * 0.6,
    height: height * 0.3,
    backgroundColor: argonTheme.COLORS.TWITTER,
    paddingVertical: 10,
    marginHorizontal: 70,
  },
  posts: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
  searchContainer: {
    height: 38,
    width: width * 0.5,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
});
