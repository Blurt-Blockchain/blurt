import React, {useState} from 'react';

import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useIntl} from 'react-intl';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';

interface Props {
  account: string;
  nickname?: string;
  reputation?: string;
  avatar: string;
  avatarSize: number;
  textSize: number;
  truncate?: boolean;
  handlePressAvatar: () => void;
}
const AvatarView = (props: Props): JSX.Element => {
  const {
    account,
    nickname,
    avatar,
    reputation,
    avatarSize,
    textSize,
    truncate,
  } = props;
  const _onPressAvatar = () => {
    props.handlePressAvatar();
  };

  return (
    <TouchableOpacity style={styles.avatarNameWrapper} onPress={_onPressAvatar}>
      <Block row style={styles.container}>
        <Block row>
          <Image
            source={{
              uri: avatar || null,
            }}
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              },
            ]}
          />
          <Block style={{top: -2}}>
            <Text size={textSize} color="blue">
              {truncate ? nickname.substring(0, 16) : nickname}
            </Text>
            <Text size={textSize}>
              @{truncate ? account.substring(0, 8) : account}
            </Text>
          </Block>
        </Block>
      </Block>
    </TouchableOpacity>
  );
};

export {AvatarView};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'column',
  },
  primaryDetails: {
    flexDirection: 'row',
  },
  secondaryDetails: {
    flexDirection: 'row',
    marginHorizontal: 3,
  },
  rightContainer: {
    flexDirection: 'column',
    marginLeft: 'auto',
    paddingLeft: 10,
  },
  avatar: {
    // borderColor: 'blue',
    // borderWidth: 1,
    marginRight: 5,
  },
  reputation: {
    fontSize: 12,
    color: 'green',
    marginRight: 8,
    alignSelf: 'center',
  },
  avatarNameWrapper: {
    flexDirection: 'row',
    padding: 10,
    top: 0,
  },
});
