import React, {useState} from 'react';

import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
// html render
import HTML from 'react-native-render-html';
const {width} = Dimensions.get('screen');

import {useIntl} from 'react-intl';
import FAB from 'react-native-fab';

// unicode substring
const runes = require('runes');
import {sliceByByte} from '~/utils/strings';

import {PostData, PostState, PostsTypes} from '~/contexts/types';

import {materialTheme} from '~/constants/materialTheme';

import {ActionBar} from '../ActionBar';
import {ActionBarStyle} from '~/constants/actionBarTypes';
import {POST_TITLE_LENGTH} from '~/constants/utils';
import {Avatar} from '~/components/Avatar';
import {getTimeFromNow} from '~/utils/time';

interface Props {
  post: PostData;
  postsType: PostsTypes;
  index: number;
  username?: string;
  actionBarStyle: ActionBarStyle;
  handleOnPressPost: () => void;
  handleOnPressAuthor: (author: string) => void;
}

const PostView = (props: Props): JSX.Element => {
  const imageStyles = [styles.image, styles.horizontalImage];
  const {post} = props;
  const reputation = post.state.reputation.toFixed(0);
  const {nickname} = post.state;
  const _onPressPost = () => {
    console.log('onPressPost');
    // @todo navigate to the post details
    props.handleOnPressPost();
  };

  const _onPressAuthor = () => {
    console.log('onPressAuthor');
    props.handleOnPressAuthor(post.state.post_ref.author);
  };

  return (
    <Block row card flex style={[styles.post, styles.shadow]}>
      <Block flex={3}>
        <Block>
          <Avatar
            account={post.state.post_ref.author}
            nickname={nickname ? nickname : post.state.post_ref.author}
            reputation={reputation}
            avatar={post.state.avatar}
            avatarSize={30}
            textSize={10}
            truncate={true}
          />
        </Block>
        <TouchableWithoutFeedback onPress={_onPressPost}>
          <Block flex={7} style={[styles.imageContainer, styles.shadow]}>
            <Image
              resizeMode="cover"
              source={{
                uri: post.image || null,
              }}
              style={imageStyles}
            />
          </Block>
        </TouchableWithoutFeedback>
      </Block>

      <TouchableWithoutFeedback onPress={_onPressPost}>
        <Block flex={6} space="between" style={styles.postDescription}>
          <Block>
            <Text size={16} style={{color: materialTheme.COLORS.ERROR}}>
              {/* {runes.substr(post.state.title, 0, 45)} */}
              {sliceByByte(post.state.title, POST_TITLE_LENGTH)}
            </Text>
            {post.summary.length > 0 && (
              <HTML
                html={post.summary.replace(/\p{Emoji_Presentation}/gu, ' ')}
              />
            )}
          </Block>
          <Block row space="between">
            <ActionBar
              actionBarStyle={props.actionBarStyle}
              postState={post.state}
              postsType={props.postsType}
              postIndex={props.index}
            />
            <Text>{getTimeFromNow(post.state.createdAt)}</Text>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    </Block>
  );
};

export {PostView};

const styles = StyleSheet.create({
  post: {
    marginBottom: 10,
    backgroundColor: theme.COLORS.WHITE,
    borderWidth: 0,
    minHeight: 150,
    maxHeight: 150,
    top: -20,
  },
  postDescription: {
    padding: theme.SIZES.BASE / 3,
  },
  votingContainer: {
    width: '70%',
    height: 'auto',
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 20,
  },

  imageContainer: {
    elevation: 1,
  },
  image: {
    borderRadius: 3,
    marginHorizontal: theme.SIZES.BASE / 2,
    //    marginTop: -16,
  },
  horizontalImage: {
    height: 100,
    width: 'auto',
  },
  fullImage: {
    height: 215,
    width: width - theme.SIZES.BASE * 3,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});
