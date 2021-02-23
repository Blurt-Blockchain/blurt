//// react
import React, {useState, useEffect, Fragment} from 'react';
//// react native
import {View, StyleSheet, FlatList, Dimensions} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import Modal from 'react-native-modal';
import {argonTheme} from '~/constants';
import {materialTheme} from '~/constants/';
//// contexts types
import {CommentData, PostRef} from '~/contexts/types';
//// utils
import {get} from 'lodash';
//// views
import {Comment} from '~/components';
//// constants
const {width, height} = Dimensions.get('window');

//// props
interface Props {
  comments: CommentData[];
  fetchComments: () => void;
  handlePressChildren: (postRef: PostRef) => void;
}
const CommentsView = (props: Props): JSX.Element => {
  //// props
  const {comments} = props;

  const _renderItem = ({item}) => {
    return (
      <Comment
        key={String(item.id)}
        comment={item}
        fetchComments={props.fetchComments}
      />
    );
  };

  // TODO: check the comment is the last one, then set margin bottom to 100, otherwiese, set 20
  return (
    <Block style={{marginBottom: 0}}>
      <Fragment>
        <FlatList
          data={comments}
          renderItem={_renderItem}
          keyExtractor={(item) => String(get(item, 'id'))}
        />
      </Fragment>
    </Block>
  );
};

export {CommentsView};
