import React, {useState, useContext} from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {navigate} from '~/navigation/service';
import {UIContext, PostsContext, AuthContext} from '~/contexts';
import {PostsTypes} from '~/contexts/types';
import {AvatarView} from './AvatarView';

interface Props {
  account: string;
  nickname?: string;
  reputation?: string;
  avatar: string;
  avatarSize: number;
  textSize: number;
  truncate?: boolean;
}
const AvatarContainer = (props: Props): JSX.Element => {
  // props
  const {
    account,
    nickname,
    avatar,
    reputation,
    avatarSize,
    textSize,
    truncate,
  } = props;
  //// contexts
  const {setAuthorParam} = useContext(UIContext);
  const {postsState, clearPosts} = useContext(PostsContext);
  const {authState} = useContext(AuthContext);

  const _handlePressAvatar = () => {
    console.log('onPressAvatar');
    // clear posts
    //    clearPosts(PostsTypes.FEED);
    // set current author in the context
    setAuthorParam(account);
    if (authState.currentCredentials.username === account) {
      navigate({name: 'Profile'});
    } else {
      navigate({name: 'AuthorProfile'});
    }
  };
  return (
    <AvatarView
      account={account}
      nickname={nickname}
      reputation={reputation}
      avatar={avatar}
      avatarSize={avatarSize}
      textSize={textSize}
      truncate={truncate}
      handlePressAvatar={_handlePressAvatar}
    />
  );
};

export {AvatarContainer};
