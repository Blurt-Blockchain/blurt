import React, {useState, useContext, useEffect} from 'react';
import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';
//// navigation
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
//// components
import {AuthorList} from '~/components';
//// screens, views
import {EditorView} from './EditorView';
import {Platform} from 'react-native';
//// utils
//// constants
import {MIN_EDITOR_HEIGHT} from '~/constants/utils';

//// types
type Position = {
  start: number;
  end: number;
};
//// props
interface Props {
  isComment: boolean;
  originalBody?: string;
  depth?: number;
  showCloseButton?: boolean;
  clearBody?: boolean;
  handleBodyChange?: (body: string) => void;
  handleCloseEditor?: () => void;
  handleSubmitComment?: (text: string) => Promise<boolean>;
}
const EditorContainer = (props: Props): JSX.Element => {
  //// props
  const {clearBody, originalBody} = props;
  //// language
  //// contexts
  const {userState} = useContext(UserContext);
  //// states
  const [body, setBody] = useState(originalBody);
  const [editable, setEditable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bodySelection, setBodySelection] = useState<Position>({
    start: 0,
    end: 0,
  });
  const [containerHeight, setContainerHeight] = useState(MIN_EDITOR_HEIGHT);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  //////// events
  //// mount
  useEffect(() => {
    setTimeout(() => setEditable(true), 100);
  }, []);
  //// event: clear body
  useEffect(() => {
    if (clearBody) {
      setBody('');
    }
  }, [clearBody]);

  // //// edit event. set body
  // useEffect(() => {
  //   console.log('[EditorView] original body exists', props.originalBody);

  //   if (props.originalBody) {
  //     console.log('[EditorView] original body exists', props.originalBody);
  //     setBody(props.originalBody);
  //   }
  // }, [props.originalBody]);

  //// edit event. set body
  useEffect(() => {
    if (originalBody) {
      console.log('original body exists', props.originalBody);
      setBody(originalBody);
    }
  }, [originalBody]);

  //// uploading image event
  useEffect(() => {
    if (uploadedImageUrl) {
      const _body =
        body.substring(0, bodySelection.start) +
        uploadedImageUrl +
        body.substring(bodySelection.end);
      _handleBodyChange(_body);
    }
  }, [uploadedImageUrl]);

  //// handle press key event and catch '@' key
  const _handlePressKey = ({nativeEvent}) => {
    const {key} = nativeEvent;
    if (key === '@') {
      setShowAuthorsModal(true);
    } else {
      setShowAuthorsModal(false);
    }
  };

  const _handleBodyChange = (text: string) => {
    // check validity:
    setBody(text);
    // return the body (markdown) to the parent
    props.handleBodyChange(text);
  };

  const _insertMentionedAccount = (text: string) => {
    // hide the modal
    setShowAuthorsModal(false);

    // append the author int the body
    const _body =
      body.substring(0, bodySelection.start) +
      text +
      body.substring(bodySelection.end, body.length);
    console.log('_finalizeMention. body', _body);
    // update body selection
    setBodySelection({
      start: bodySelection.start + text.length,
      end: bodySelection.end + text.length,
    });
    setBody(_body);
    // send the change to the parent
    _body;
  };

  //// handle press mention icon
  const _handlePressMention = () => {
    // put @ in the body
    const _body =
      body.substring(0, bodySelection.start) +
      '@' +
      body.substring(bodySelection.end, body.length);
    console.log('_finalizeMention. body', _body);
    setBody(_body);
    // update body selection
    setBodySelection({
      start: bodySelection.start + 1,
      end: bodySelection.end + 1,
    });
    // show author list modal
    setShowAuthorsModal(true);
  };

  //// update input selection position
  const _handleOnSelectionChange = async (event) => {
    setBodySelection(event.nativeEvent.selection);
  };

  //// update the height of comment input
  const _handleContainerHeight = (event) => {
    if (props.isComment) {
      let _height = event.nativeEvent.contentSize.height;
      if (_height < MIN_EDITOR_HEIGHT) _height = MIN_EDITOR_HEIGHT;
      setContainerHeight(_height);
    }
  };

  //// set uploaded image url
  const _handleUploadedImageURL = (url: string) => {
    setUploadedImageUrl(url);
  };

  //// submit the comment
  const _handleSubmitComment = async () => {
    setSubmitting(true);
    const result = await props.handleSubmitComment(body);
    setSubmitting(false);
    if (result) {
      console.log('_handleSubmitComment. result', result);
      // clear body
      setBody('');
    }
  };

  //// clear body
  const _handlePressClear = () => {
    setBody('');
  };

  //// cancel the editing
  const _cancelEditing = () => {
    setBody('');
    props.handleCloseEditor();
  };

  return (
    <Block>
      <EditorView
        isComment={props.isComment}
        depth={props.depth}
        body={body}
        editable={editable}
        containerHeight={containerHeight}
        submitting={submitting}
        showCloseButton={props.showCloseButton}
        handleBodyChange={_handleBodyChange}
        handleSubmitComment={_handleSubmitComment}
        handleOnSelectionChange={_handleOnSelectionChange}
        handlePressKey={_handlePressKey}
        handleContainerHeight={_handleContainerHeight}
        handleUploadedImageURL={_handleUploadedImageURL}
        handlePressMention={_handlePressMention}
        handlePressClear={_handlePressClear}
        handlePressCancel={_cancelEditing}
      />
      {showAuthorsModal && (
        <AuthorList
          showModal={true}
          authors={userState.followings}
          handlePressAuthor={_insertMentionedAccount}
          cancelModal={() => setShowAuthorsModal(false)}
        />
      )}
    </Block>
  );
};

export {EditorContainer};
