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
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc

//// props
interface Props {
  post: PostData;
}
const ParentPostView = (props: Props): JSX.Element => {
  //// props
  const {post} = props;
  console.log('[ParentPostView] post', post);
  //// language
  const intl = useIntl();
  //// contexts
  const {setPostRef, setPostDetails} = useContext(PostsContext);

  const _handlePressButton = () => {
    // set post ref
    setPostRef(post.state.post_ref);

    // @test: set post data to context
    setPostDetails(post);

    // navigate
    navigate({name: 'PostDetails'});
  };

  return (
    <Block
      card
      center
      style={{
        shadowColor: argonTheme.COLORS.FACEBOOK,
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 20,
      }}>
      <Text>{intl.formatMessage({id: 'ParentPost.info'})}</Text>
      <Text size={20} color="blue" bold>
        {post.state.title}
      </Text>
      <Button onPress={_handlePressButton}>
        {intl.formatMessage({id: 'ParentPost.parent_button'})}
      </Button>
    </Block>
  );
};

export {ParentPostView};
