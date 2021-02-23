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
  Image,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Text, Input, Icon, theme} from 'galio-framework';
import {argonTheme} from '~/constants';
const {height, width} = Dimensions.get('window');
//// contexts
//// components
//// utils
import {getTimeFromNow} from '~/utils/time';
import {sliceByByte} from '~/utils/strings';
import {LIST_TITLE_LENGTH} from '~/constants/utils';

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

//// props
interface Props {
  searchText: string;
  active: boolean;
  items: any[];
  loading: boolean;
  imageServer: string;
  handleSearchChange: (text: string) => void;
  handleSearch: () => void;
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleActive: (active: boolean) => void;
  handlePressPost: (index: number) => void;
}
//// component
const SearchScreen = (props: Props): JSX.Element => {
  //// props
  const {searchText, active, items, loading, imageServer} = props;
  //// language
  const intl = useIntl();

  const SearchBar = () => {
    const iconSearch =
      searchText != '' ? (
        <TouchableWithoutFeedback onPress={() => props.handleSearchChange('')}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="remove"
            family="font-awesome"
          />
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback onPress={props.handleSearch}>
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
          right
          color="black"
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize="none"
          iconContent={iconSearch}
          defaultValue={searchText}
          returnKeyType="search"
          style={[styles.search, active ? styles.shadow : null]}
          placeholder={intl.formatMessage({id: 'Search.search_placeholder'})}
          onFocus={() => props.handleActive(true)}
          onBlur={() => props.handleActive(false)}
          onChangeText={props.handleSearchChange}
          onSubmitEditing={props.handleSearch}
        />
      </Block>
    );
  };

  //// load more posts with bottom-reached event
  const _onLoadMore = async () => {
    //    setLoadingMore(true);
    //props.fetchMore && props.fetchMore();
  };

  //// render a search item
  const _renderSearchItem = (item: any, index: number) => {
    const avatar = `${imageServer}/u/${item.author}/avatar`;
    console.log('search. item');
    return (
      <TouchableWithoutFeedback onPress={() => props.handlePressPost(index)}>
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
          <Block row middle style={{left: -20}}>
            <Block center width={80}>
              <Image
                source={{
                  uri: avatar || null,
                }}
                style={styles.avatar}
              />
            </Block>
            <Block>
              <Text>{sliceByByte(item.title, LIST_TITLE_LENGTH)}</Text>
            </Block>
          </Block>
          <Block middle>
            {item.createdAt && <Text>{getTimeFromNow(item.createdAt)}</Text>}
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Block style={{marginBottom: 70}}>
      {SearchBar()}
      {!loading ? (
        <FlatList
          contentContainerStyle={styles.posts}
          refreshing={loading}
          onRefresh={props.handleRefresh}
          onEndReached={_onLoadMore}
          onEndReachedThreshold={1}
          data={items}
          renderItem={({item, index}) => _renderSearchItem(item, index)}
          keyExtractor={(item, index) => String(index)}
          initialNumToRender={5}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{top: 20}}>
          <ActivityIndicator color={argonTheme.COLORS.ERROR} />
        </View>
      )}
    </Block>
  );
};

export {SearchScreen};

const styles = StyleSheet.create({
  item: {
    height: theme.SIZES.BASE * 1.5,
    marginBottom: theme.SIZES.BASE,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 1,
    borderRadius: 3,
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
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
});
