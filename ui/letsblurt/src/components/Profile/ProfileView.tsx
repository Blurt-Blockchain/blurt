//// react
import React from 'react';
//// react native
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  Linking,
} from 'react-native';
//// react navigation
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {Images, argonTheme} from '~/constants';
const {width, height} = Dimensions.get('screen');
import {HeaderHeight} from '~/constants/utils';
//// contexts
import {ProfileData} from '~/contexts/types';
//// etc
import {getNumberStat} from '~/utils/stats';
import {TouchableOpacity} from 'react-native-gesture-handler';

//// props
interface Props {
  profileData: ProfileData;
  isUser?: boolean;
  favoriting: boolean;
  favoriteState: boolean;
  following: boolean;
  followingState: boolean;
  imageServer: string;
  handlePressFavorite: () => void;
  handlePressEdit: () => void;
  handlePressFollow: () => void;
  handlePressFollowers: () => void;
  handlePressFollowings: () => void;
}
//// component with default props
const ProfileView: React.FC<Props> = ({
  isUser = true,
  ...props
}): JSX.Element => {
  //// props
  const {profile} = props.profileData;

  console.log('[ProfileView] profile data', profile);

  //// language
  const intl = useIntl();
  //// contexts
  //// stats
  ////

  const _handlePressWebsite = () => {
    // open link
    Linking.canOpenURL(profile.metadata.website).then((supported) => {
      if (supported) {
        Linking.openURL(profile.metadata.website);
      }
    });
  };
  //// render
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{marginTop: '1%', maxHeight: height / 3}}>
      <Block flex style={styles.profileCard}>
        <Block middle style={styles.avatarContainer}>
          <Block flex row center>
            <Block center flex={1} style={{top: 40}}>
              <TouchableOpacity onPress={props.handlePressFollowers}>
                <Text size={16} color="blue">
                  {getNumberStat(profile.stats.followers)}
                </Text>
              </TouchableOpacity>
              <Text color="#32325D">
                {intl.formatMessage({id: 'followers'})}
              </Text>
              {!isUser ? (
                <Button
                  onPress={props.handlePressFollow}
                  loading={props.following}
                  small
                  center
                  style={{
                    padding: 0,
                    width: 100,
                    backgroundColor: argonTheme.COLORS.BUTTON_COLOR,
                  }}>
                  {props.followingState
                    ? intl.formatMessage({id: 'Profile.unfollow_button'})
                    : intl.formatMessage({id: 'Profile.follow_button'})}
                </Button>
              ) : null}
            </Block>
            {profile && (
              <Block flex={3} center>
                <Block row>
                  <Image
                    source={{
                      uri:
                        `${props.imageServer}/u/${profile.name}/avatar` || null,
                      //uri: props.profileData.profile.metadata.profile_image || null,
                    }}
                    style={[styles.avatar, {left: 10}]}
                  />
                  {isUser && (
                    <Icon
                      style={{left: 10, top: 80}}
                      size={30}
                      color={argonTheme.COLORS.ERROR}
                      name="pencil"
                      family="font-awesome"
                      onPress={props.handlePressEdit}
                    />
                  )}
                </Block>
                <Text>{profile.metadata ? profile.metadata.name : ''}</Text>
                <Text color="orange">@{profile.name}</Text>
              </Block>
            )}
            <Block center flex={1} style={{top: 40}}>
              <TouchableOpacity onPress={props.handlePressFollowings}>
                <Text size={16} color="blue">
                  {getNumberStat(profile.stats.following)}
                </Text>
              </TouchableOpacity>
              <Text color="#32325D">
                {intl.formatMessage({id: 'following'})}
              </Text>
              {!isUser ? (
                <Button
                  onPress={props.handlePressFavorite}
                  loading={props.favoriting}
                  small
                  center
                  style={{
                    padding: 0,
                    width: 100,
                    backgroundColor: argonTheme.COLORS.ERROR,
                  }}>
                  {props.favoriteState
                    ? intl.formatMessage({id: 'Profile.unfavorite_button'})
                    : intl.formatMessage({id: 'Profile.favorite_button'})}
                </Button>
              ) : null}
            </Block>
          </Block>
          <Text size={14} color="#32325D" style={{marginTop: 10}}>
            {profile.metadata.about}
          </Text>
          <Text size={14} color="#32325D" style={{marginTop: 10}}>
            {profile.metadata.location}
          </Text>
          <TouchableOpacity onPress={_handlePressWebsite}>
            <Text color="blue">{profile.metadata.website}</Text>
          </TouchableOpacity>
        </Block>
        <Block row space="between" style={styles.stats}>
          <Block middle>
            <Text
              size={18}
              color="#525F7F"
              style={{
                marginBottom: 4,
              }}>
              {getNumberStat(profile.stats.post_count)}
            </Text>
            <Text size={12} color={argonTheme.COLORS.TEXT}>
              {intl.formatMessage({id: 'Profile.postings'})}
            </Text>
          </Block>
          <Block middle>
            <Text
              color="#525F7F"
              size={18}
              style={{
                marginBottom: 4,
              }}>
              {getNumberStat(parseInt(profile.power))}
            </Text>
            <Text size={12} color={argonTheme.COLORS.TEXT}>
              {intl.formatMessage({id: 'Profile.power'})}
            </Text>
          </Block>
          <Block middle>
            <Text
              color={argonTheme.COLORS.ERROR}
              size={18}
              style={{
                marginBottom: 4,
              }}>
              {profile.voteAmount} B
            </Text>
            <Text size={12} color={argonTheme.COLORS.TEXT}>
              {intl.formatMessage({id: 'Profile.vote_amount'})}
            </Text>
          </Block>
        </Block>
      </Block>
    </ScrollView>
  );
};

export {ProfileView};

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
