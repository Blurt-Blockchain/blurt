//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  ImageBackground,
  StyleSheet,
  Platform,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// react navigation
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Text, theme} from 'galio-framework';
import {Images} from '~/constants';
import {TabView, SceneMap} from 'react-native-tab-view';
//// contexts
import {
  PostData,
  PostRef,
  PostsTypes,
  ProfileData,
  WalletData,
} from '~/contexts/types';
import {ProfileContainer, WalletStatsView} from '~/components';
//// etc
import {HeaderHeight} from '~/constants/utils';
import {getNumberStat} from '~/utils/stats';
import {PostsListView} from '~/components/PostsList';

const {width, height} = Dimensions.get('screen');
//// props
interface Props {
  profileData: ProfileData;
  blogs: any[];
  walletData: WalletData;
  refreshing: boolean;
  refreshPosts: () => void;
  refreshWallet: () => void;
}
//// component
const AuthorProfileScreen = (props: Props): JSX.Element => {
  //// props
  const {refreshing} = props;
  const intl = useIntl();

  //// states
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'blogs', title: intl.formatMessage({id: 'Profile.blog_tab'})},
    {key: 'wallet', title: intl.formatMessage({id: 'Profile.wallet_tab'})},
  ]);

  const BlogList = () => (
    <PostsListView
      posts={props.blogs}
      isUser={false}
      refreshPosts={props.refreshPosts}
      refreshing={refreshing}
    />
  );

  const WalletStats = () =>
    props.walletData ? (
      <WalletStatsView
        walletData={props.walletData}
        isUser={false}
        onRefresh={props.refreshWallet}
      />
    ) : null;

  const renderScene = SceneMap({
    blogs: BlogList,
    wallet: WalletStats,
  });

  return (
    <Block flex style={styles.profileScreen}>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <ProfileContainer profileData={props.profileData} isUser={false} />
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

export {AuthorProfileScreen};

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
});
