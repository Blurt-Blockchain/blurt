import React, {useState, useContext, useEffect} from 'react';
import {
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Button, Icon, Block, NavBar, Input, Text, theme} from 'galio-framework';
import {Images, argonTheme} from '~/constants';

//
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
// steem api
import {
  UIContext,
  AuthContext,
  PostsContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
// types
import {
  PostRef,
  PostsState,
  PostsTypes,
  KeyTypeStrings,
} from '~/contexts/types';
import {materialTheme} from '~/constants/materialTheme';
import {DropdownModal} from './DropdownModal';
import {indexOf} from 'lodash';
import {useRoute} from '@react-navigation/native';

import ModalDropdown from 'react-native-modal-dropdown';

const {height, width} = Dimensions.get('window');
const iPhoneX = (): boolean =>
  Platform.OS === 'ios' &&
  (height === 812 || width === 812 || height === 896 || width === 896);

export const COMMUNITY_INDEX = 'community_index';

interface Props {
  title: string;
  white?: boolean;
  back?: boolean;
  transparent?: boolean;
  navigation: any;
}
const Header = (props: Props): JSX.Element => {
  //// props
  //// lanugage
  const intl = useIntl();
  // contexts
  const {authState, changeAccount, processLogout} = useContext(AuthContext);
  const {userState, getFollowings, updateVoteAmount} = useContext(UserContext);
  const {uiState, setSearchParam, setLanguageParam} = useContext(UIContext);
  const {postsState, setTagIndex, setFilterIndex, clearPosts} = useContext(
    PostsContext,
  );
  const {settingsState} = useContext(SettingsContext);
  // states
  const [username, setUsername] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [accounts, setAccounts] = useState(null);
  const [keyTypes, setKeyTypes] = useState(null);
  const [searching, setSearching] = useState(false);
  const [community, setCommunity] = useState(0);
  const [category, setTag] = useState(0);

  /// auth state change effect
  useEffect(() => {
    //    if (authState.loggedIn) {
    setUsername(authState.currentCredentials.username);
    // set accounts
    const iterator = authState.credentialsList.values();
    let _accounts = [];
    let _keyTypes = [];
    for (const key of iterator) {
      const _username = Object.keys(key)[0];
      // store if it exists
      if (_username) {
        _accounts.push(_username);
        _keyTypes.push(key[_username].type);
      }
    }
    // set accounts
    setAccounts(_accounts);
    // set key types of accounts
    setKeyTypes(_keyTypes);
  }, [authState.currentCredentials]);

  const _onSubmitSearch = () => {
    console.log('_onSubmitSearch');
    setSearchParam(searchText);
  };

  const _renderAccountRow = (option, index, isSelect) => {
    return (
      <Block row style={{margin: 5}}>
        <Block row middle>
          {index >= accounts.length ? (
            index === accounts.length ? (
              <Icon
                size={30}
                color={argonTheme.COLORS.SWITCH_ON}
                name="adduser"
                family="antdesign"
              />
            ) : (
              <Icon
                size={30}
                color={argonTheme.COLORS.ERROR}
                name="logout"
                family="antdegisn"
              />
            )
          ) : (
            <Image
              source={{
                uri: `${settingsState.blockchains.image}/u/${option}/avatar`,
                //uri: userState.profileData.profile.metadata.profile_image,
              }}
              style={[
                styles.avatar,
                {
                  width: 30,
                  height: 30,
                  borderRadius: 30 / 2,
                },
              ]}
            />
          )}
          <Text
            size={14}
            style={{marginHorizontal: 5, color: argonTheme.COLORS.WHITE}}>
            {option}
          </Text>
        </Block>

        {keyTypes && (
          <Block right middle>
            {index < accounts.length ? (
              <Text color={argonTheme.COLORS.WARNING}>
                {KeyTypeStrings[keyTypes[index]][0].toUpperCase()}
              </Text>
            ) : null}
          </Block>
        )}
      </Block>
    );
  };

  const _handleChangeAccount = async (index: number, value: string) => {
    // switch account
    if (index < accounts.length) {
      // fetching followings
      await getFollowings(value);
      // switch account, auth
      await changeAccount(value);
      // update vote amount
      await updateVoteAmount(value);
      // set username
      setUsername(value);
    }
    // add account
    else if (index === accounts.length) {
      //      navigate({name: 'Login'});
      navigate({name: 'Login', params: {addingAccount: true}});
    }
    // log out
    else {
      // TODO: show modal to inform that all saved passwords will be removed
      processLogout();
    }
  };

  const Avatar = () => {
    let options = accounts;
    if (username) {
      // append logout at the end
      options = [
        ...accounts,
        intl.formatMessage({id: 'Header.add_account'}),
        intl.formatMessage({id: 'logout'}),
      ];
    }
    return username ? (
      <ModalDropdown
        options={options}
        renderRow={_renderAccountRow}
        style={styles.dropdown}
        dropdownButtonStyle={styles.avatarButton}
        selectedOptionIndex={0}
        rowTextStyle={styles.rowTextStyle}
        dropdownStyle={styles.dropdownAvatarStyle}
        textStyle={styles.dropdownText}
        onSelect={_handleChangeAccount}>
        <Image
          source={{
            uri: `${settingsState.blockchains.image}/u/${username}/avatar`,
            //uri: userState.profileData.profile.metadata.profile_image,
          }}
          style={[styles.avatar]}
        />
      </ModalDropdown>
    ) : (
      <Block style={styles.dropdown}>
        <Icon
          onPress={() => navigate({name: 'Login'})}
          name="login"
          family="antdesign"
          size={40}
        />
      </Block>
    );
  };

  //// update tag index of uiState
  const _handleOnTagChange = (index: number, value: string) => {
    // set tag index
    setTagIndex(index, PostsTypes.FEED, authState.currentCredentials.username);
  };

  //// update category index of uiState
  const _handleOnFilterChange = (index: number, value: string) => {
    setFilterIndex(index, authState.currentCredentials.username);
  };

  //// handle on language change
  const _handleOnLanguageChange = (index: number, value: string) => {
    console.log('header _handleOnLanguageChange. index, value', index, value);
    setLanguageParam(value.toLowerCase());
  };

  //// update tag index of uiState
  const _handleOnTagChangeForPosting = (index: number, value: string) => {
    console.log('[Header] _handleOnTagChangeForPosting. community', value);
  };

  ////
  const _handleLeftPress = () => {
    const {back, navigation} = props;
    try {
      if (back) navigation.goBack();
      else navigation.openDrawer();
    } catch {
      // show modal
      Alert.alert(
        intl.formatMessage({id: 'App.push_title'}),
        intl.formatMessage({id: 'App.push_body'}),
        [
          {text: intl.formatMessage({id: 'no'}), style: 'cancel'},
          {
            text: intl.formatMessage({id: 'yes'}),
            onPress: () => console.log('go back. yes'),
          },
        ],
        {cancelable: true},
      );
    }
  };

  ////
  const _renderRight = () => {
    const {white, title, navigation} = props;
    const defaultCommunityText = '';
    const defaultCategoryText = '';
    const {tagList, filterList, tagIndex, filterIndex} = postsState;
    let tagOptions = postsState.tagList;
    switch (title) {
      case 'Feed':
        //        tagList.forEach((item) => tagOptions.push(item.tag));
        return (
          <Block row space="between">
            <Block row space="around" style={{left: 100}}>
              <DropdownModal
                key={tagOptions[tagIndex]}
                defaultText={defaultCommunityText || tagOptions[tagIndex]}
                dropdownButtonStyle={styles.dropdownButtonStyle}
                selectedOptionIndex={tagIndex}
                rowTextStyle={styles.rowTextStyle}
                style={styles.dropdown}
                dropdownStyle={styles.dropdownStyle}
                textStyle={styles.dropdownText}
                options={tagOptions}
                onSelect={_handleOnTagChange}
              />
              <DropdownModal
                key={filterList[filterIndex]}
                defaultText={defaultCategoryText || filterList[filterIndex]}
                dropdownButtonStyle={styles.dropdownButtonStyle}
                selectedOptionIndex={filterIndex}
                rowTextStyle={styles.rowTextStyle}
                style={styles.dropdown}
                dropdownStyle={styles.dropdownStyle}
                textStyle={styles.dropdownText}
                options={filterList}
                onSelect={_handleOnFilterChange}
              />
            </Block>
            <Block style={{left: 120, top: 2}}>
              <Avatar />
            </Block>
          </Block>
        );
      case 'Search':
      case 'Post':
      case 'Posting':
      case 'Profile':
      case 'Author':
      case 'Notification':
      case 'Wallet':
      case 'Settings':
        return (
          <Block style={{left: 120, top: 0}}>
            <Avatar />
          </Block>
        );

      default:
        break;
    }
  };

  const {back, title, white, transparent, navigation} = props;
  const headerStyles = [
    styles.shadow,
    transparent ? {backgroundColor: 'rgba(0,0,0,0)'} : null,
  ];

  return (
    <Block style={headerStyles}>
      <NavBar
        back={back}
        title={intl.formatMessage({id: `${title.toLowerCase()}`})}
        style={styles.navbar}
        transparent={transparent}
        right={_renderRight()}
        rightStyle={{
          alignItems: 'flex-end',
          flex: 3,
          marginRight: 0,
          left: -70,
        }}
        leftStyle={{paddingTop: 3, flex: 0.3}}
        leftIconName={back ? 'chevron-left' : 'navicon'}
        leftIconFamily="font-awesome"
        leftIconColor={white ? theme.COLORS.WHITE : theme.COLORS.ICON}
        titleStyle={[
          styles.title,
          {color: theme.COLORS[white ? 'WHITE' : 'ICON']},
        ]}
        onLeftPress={_handleLeftPress}
      />
    </Block>
  );
};

export {Header};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    position: 'relative',
  },
  title: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navbar: {
    paddingVertical: 0,
    paddingBottom: theme.SIZES.BASE * 1.5,
    paddingTop: iPhoneX()
      ? theme.SIZES.BASE * 4
      : Platform.OS === 'ios'
      ? theme.SIZES.BASE * 4
      : theme.SIZES.BASE,
    zIndex: 5,
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  notify: {
    backgroundColor: materialTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  searchContainer: {
    height: 38,
    width: width * 0.6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.5,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300',
  },
  // dropdown
  avatarButton: {
    borderColor: '#f5f5f5',
    borderWidth: 1,
    height: 44,
    width: 120,
    borderRadius: 8,
    marginRight: 0,
  },
  text: {
    color: '#788187',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 10,
    paddingHorizontal: 14,
    color: '#788187',
  },
  rowTextStyle: {
    fontSize: 12,
    color: '#788187',
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 120,
    width: 120,
    backgroundColor: argonTheme.COLORS.DEFAULT,
  },
  dropdownAvatarStyle: {
    marginTop: 15,
    minWidth: 150,
    width: 200,
    height: 200,
    backgroundColor: argonTheme.COLORS.DEFAULT,
  },
  dropdownButtonStyle: {
    borderColor: '#f5f5f5',
    borderWidth: 1,
    height: 44,
    width: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  dropdown: {
    width: 100,
  },
  textStyle: {
    color: '#357ce6',
  },
  textButton: {
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 62,
    borderWidth: 0,
  },
});
