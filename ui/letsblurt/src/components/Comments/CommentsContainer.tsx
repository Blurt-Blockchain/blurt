//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {Platform} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// firebase
import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
// blurt api
import {fetchComments} from '~/providers/blurt/dblurtApi';
//// contexts
import {AuthContext, UIContext} from '~/contexts';
import {CommentData, PostRef} from '~/contexts/types';
//// views
import {CommentsView} from './CommentsView';
//// constants

//// props
interface Props {
  postRef: PostRef;
  comments?: CommentData[];
}
const CommentsContainer = (props: Props): JSX.Element => {
  //// props
  //// context
  const {authState} = useContext(AuthContext);
  //// states
  const [postRef, setPostRef] = useState<PostRef>(props.postRef);
  const [comments, setComments] = useState<CommentData[]>([]);
  //// effects
  // effect: mount
  useEffect(() => {
    _fetchComments();
  }, []);
  // event: comments prop
  useEffect(() => {
    // fetch comments if no comments are given
    if (props.comments) {
      setComments(props.comments);
    } else {
      // TODO: fetch comments if there are comments
      _fetchComments();
    }
  }, [props.comments]);

  //// fetch comments
  const _fetchComments = async () => {
    // fetch comments on this post
    const _comments = await fetchComments(
      postRef.author,
      postRef.permlink,
      authState.currentCredentials.username,
    );
    console.log('_fetchComments', _comments);

    setComments(_comments);
  };

  ////
  const _handlePressChildren = (_postRef: PostRef) => {
    // set post ref
    setPostRef(_postRef);
    // fetch child comments
    _fetchComments();
  };

  return (
    <CommentsView
      comments={comments}
      fetchComments={_fetchComments}
      handlePressChildren={_handlePressChildren}
    />
  );
};

export {CommentsContainer};
