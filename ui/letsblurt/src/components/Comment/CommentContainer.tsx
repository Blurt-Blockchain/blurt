//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {View, Dimensions} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// firebase
import {firebase} from '@react-native-firebase/functions';
// blurt api
import {fetchComments} from '~/providers/blurt/dblurtApi';
//// UIs
//// contexts
import {
  AuthContext,
  UIContext,
  PostsContext,
  SettingsContext,
} from '~/contexts';
//// componetns
import {Editor} from '~/components';
import {CommentData, PostingContent, PostsTypes} from '~/contexts/types';
//// utils
import {generateCommentPermlink, createPatch} from '~/utils/editor';
import {getTimeFromNow} from '~/utils/time';
import {
  extractMetadata,
  generatePermlink,
  makeJsonMetadata,
} from '~/utils/editor';
const {height, width} = Dimensions.get('window');
//// view
import {CommentView} from './CommentView';

// component
interface Props {
  comment: CommentData;
  //  handleSubmitComment: (message: string) => void;
  //  updateComment: () => void;
  fetchComments: () => void;
}
const CommentContainer = (props: Props): JSX.Element => {
  //// props
  const {comment} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {setToastMessage, speakBody} = useContext(UIContext);
  const {postsState, submitPost, flagPost} = useContext(PostsContext);
  const {settingsState} = useContext(SettingsContext);
  //// stats
  const [originalPost, setOriginalPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // reply text
  const [replyText, setReplyText] = useState('');
  const [newHeight, setNewHeight] = useState(40);
  // comment body
  const [body, setBody] = useState(comment.body);
  const [showOriginal, setShowOriginal] = useState(true);
  const [originalBody, setOriginalBody] = useState(comment.body);
  const [translatedBody, setTranslatedBody] = useState(null);
  // const [showChildComments, setShowChildComments] = useState(
  //   props.showChildComments || false,
  // );
  const [showChildComments, setShowChildComments] = useState(false);
  // tts
  const [speaking, setSpeaking] = useState(false);
  const reputation = comment.state.reputation.toFixed(0);

  const formatedTime = comment && getTimeFromNow(comment.state.createdAt);

  const _handleSubmitComment = async (_text: string) => {
    // check sanity
    if (_text === '') return false;

    // set submitted flag
    setSubmitting(true);
    const {username} = authState.currentCredentials;
    // extract meta
    const _meta = extractMetadata(_text);
    // split tags by space
    const _tags = [];
    const jsonMeta = makeJsonMetadata(_meta, _tags);

    // build posting content for a new comment
    const postingContent: PostingContent = {
      author: username,
      title: '',
      body: _text,
      parent_author: comment.state.post_ref.author,
      parent_permlink: comment.state.post_ref.permlink,
      json_metadata: JSON.stringify(jsonMeta) || '',
      permlink: generateCommentPermlink(username),
    };

    // update the body with patch if it is edit mode
    if (editMode) {
      //      const patch = createPatch(comment.body, replyText);
      postingContent.parent_author = comment.state.parent_ref.author;
      postingContent.parent_permlink = comment.state.parent_ref.permlink;
      postingContent.permlink = comment.state.post_ref.permlink;
    }
    // submit the comment
    const result = await submitPost(
      postingContent,
      authState.currentCredentials.password,
      true,
    );
    // fetch comments
    props.fetchComments();
    // clear submitted flag
    setSubmitting(false);
    // close reply form
    setShowReply(false);
    setEditMode(false);
    if (result) return true;
    return false;
  };

  const _handlePressReply = () => {
    // clear reply form
    setShowReply(!showReply);
  };

  const _handlePressEditComment = () => {
    console.log('_handlePressEditComment. markdown body', comment.markdownBody);
    setEditMode(true);
    // set markdown format to body
    setBody(comment.markdownBody);
  };

  const _handlePressTranslation = async () => {
    console.log('[Comment|_handlePressTranslation]');

    if (!authState.loggedIn) {
      console.log('you need to log in to translate a post');
      setToastMessage(intl.formatMessage({id: 'PostDetails.need_login'}));
      return;
    }
    const _showOriginal = !showOriginal;
    setShowOriginal(_showOriginal);
    if (_showOriginal) {
      // set original comment
      setBody(originalBody);
      return;
    }
    // if translation exists, use it
    if (translatedBody) {
      console.log('translation exists');
      setBody(translatedBody);
      return;
    }
    const targetLang = settingsState.languages.translation;
    const bodyOptions = {
      targetLang: targetLang,
      text: body,
      format: 'html',
    };

    try {
      const bodyTranslation = await firebase
        .functions()
        .httpsCallable('translationRequest')(bodyOptions);

      const translatedBody =
        bodyTranslation.data.data.translations[0].translatedText;

      // set translation
      setBody(translatedBody);
      // store the translation
      setTranslatedBody(translatedBody);
    } catch (error) {
      console.log('failed to translate', error);
      setToastMessage(
        intl.formatMessage({id: 'PostDetails.translation_error'}),
      );
    }
  };

  //// handle press speaker
  const _handlePressSpeak = () => {
    if (speaking) {
      speakBody(comment.markdownBody, true);
    } else {
      speakBody(comment.markdownBody, false);
    }
    // toggle the state
    setSpeaking(!speaking);
  };

  //// fetch children comments
  const _handlePressChildren = async () => {
    // toggle
    setShowChildComments(!showChildComments);
  };

  ////
  const _closeEditor = () => {
    setShowReply(false);
    setEditMode(false);
  };

  //// flag a post
  const _flagPost = () => {
    console.log('flagComment. comment', comment);
    if (authState.loggedIn)
      flagPost(comment.url, authState.currentCredentials.username);
  };

  return (
    <View>
      {!editMode ? (
        <CommentView
          key={comment.id}
          comment={comment}
          showChildComments={showChildComments}
          handlePressReply={_handlePressReply}
          handlePressEditComment={_handlePressEditComment}
          handlePressTranslation={_handlePressTranslation}
          handlePressSpeak={_handlePressSpeak}
          handleSubmitComment={_handleSubmitComment}
          handlePressChildren={_handlePressChildren}
          flagPost={_flagPost}
        />
      ) : (
        <Editor
          isComment={true}
          originalBody={body}
          depth={comment.depth}
          showCloseButton={true}
          handleBodyChange={(text) => {}}
          handleCloseEditor={_closeEditor}
          handleSubmitComment={_handleSubmitComment}
        />
      )}
      {showReply && (
        <Editor
          isComment={true}
          depth={comment.depth}
          showCloseButton={true}
          handleCloseEditor={_closeEditor}
          handleBodyChange={(text) => {}}
          handleSubmitComment={_handleSubmitComment}
        />
      )}
    </View>
  );
};

export {CommentContainer};
