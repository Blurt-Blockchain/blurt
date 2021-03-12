import React, {useState, useEffect, useContext} from 'react';

import {navigate} from '~/navigation/service';
import {PostState, PostData} from '~/contexts/types';
import {PostsContext, AuthContext} from '~/contexts';

import {PostView} from './PostView';
import {ActionBarStyle} from '~/constants/actionBarTypes';

interface Props {
  post: PostData;
  index: number;
  username?: string;
  actionBarStyle: ActionBarStyle;
}
const Post = (props: Props): JSX.Element => {
  // contexts
  const {postsState, setPostRef, setPostIndex, setPostDetails} = useContext(
    PostsContext,
  );
  const {post} = props;

  const _handleOnPressAuthor = () => {
    console.log('[Post] handle press author');
  };
  const _handleOnPressPost = () => {
    console.log('[Post] handle press post', post);
    // set post ref
    setPostRef(post.state.post_ref);
    // set post index
    setPostIndex(postsState.postsType, props.index);

    // @test: set post data to context
    setPostDetails(post);

    // navigate
    navigate({name: 'PostDetails'});
  };
  return (
    <PostView
      post={props.post}
      postsType={postsState.postsType}
      index={props.index}
      username={props.username}
      actionBarStyle={props.actionBarStyle}
      handleOnPressPost={_handleOnPressPost}
      handleOnPressAuthor={_handleOnPressAuthor}
    />
  );
};

export {Post};
