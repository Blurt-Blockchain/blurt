//// react
import React from 'react';
//// react native
import {
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
//// config
//// language
import {useIntl} from 'react-intl';
//// blockchain
//// contexts
//// navigation
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants/argonTheme';
const {height, width} = Dimensions.get('window');
//// components
import {ImageUpload} from '~/components';

interface Props {
  isComment: boolean;
  depth?: number;
  body: string;
  editable: boolean;
  containerHeight: number;
  submitting: boolean;
  showCloseButton?: boolean;
  handleBodyChange?: (body: string) => void;
  handleSubmitComment: (text: string) => void;
  handleOnSelectionChange: (event: any) => void;
  handlePressKey: (event: any) => void;
  handleContainerHeight: (event: any) => void;
  handleUploadedImageURL: (url: string) => void;
  handlePressMention: () => void;
  handlePressClear: () => void;
  handlePressCancel?: () => void;
}
const EditorView = (props: Props): JSX.Element => {
  //// props
  const {
    isComment,
    depth,
    body,
    editable,
    containerHeight,
    submitting,
    showCloseButton,
  } = props;
  //// language
  const intl = useIntl();

  // icon for submitting a comment
  const iconSend = (
    <Button
      onPress={props.handleSubmitComment}
      loading={submitting}
      onlyIcon
      icon="ios-send"
      iconFamily="ionicon"
      iconSize={24}
      color={argonTheme.COLORS.ERROR}
      style={{
        margin: 0,
        padding: 0,
        right: -10,
        width: 24 + 3,
        height: 24 + 3,
      }}
    />
  );

  return (
    <Block center style={{paddingHorizontal: theme.SIZES.BASE}}>
      <Block row center space="between">
        {isComment && showCloseButton && (
          <Icon
            style={{marginRight: 5}}
            size={30}
            color={argonTheme.COLORS.ERROR}
            name="cancel"
            family="material-icon"
            onPress={props.handlePressCancel}
          />
        )}
        <Input
          style={
            isComment
              ? [
                  styles.commentContainer,
                  {
                    width: width * 0.85 - depth * 20,
                    height: containerHeight,
                  },
                ]
              : styles.postContainer
          }
          editable={editable}
          value={body}
          onChangeText={props.handleBodyChange}
          onSelectionChange={props.handleOnSelectionChange}
          onKeyPress={props.handlePressKey}
          right={isComment ? true : false}
          iconContent={isComment ? iconSend : null}
          placeholder={intl.formatMessage({id: 'Posting.body_placeholder'})}
          placeholderTextColor={argonTheme.COLORS.FACEBOOK}
          color="black"
          multiline
          rounded
          blurOnSubmit={false}
          textAlignVertical="top"
          autoCorrect={false}
          onContentSizeChange={props.handleContainerHeight}
        />
      </Block>
      <Block row left style={{top: -10}}>
        <ImageUpload
          isComment={isComment}
          containerStyle={{right: true}}
          getImageURL={props.handleUploadedImageURL}
        />
        <Button
          onPress={props.handlePressMention}
          onlyIcon
          icon="at"
          iconFamily="font-awesome"
          iconSize={isComment ? 10 : 14}
          color={argonTheme.COLORS.FACEBOOK}
        />
        <Button
          onPress={props.handlePressClear}
          onlyIcon
          icon="trash"
          iconFamily="font-awesome"
          iconSize={isComment ? 10 : 14}
          color={argonTheme.COLORS.SWITCH_ON}
        />
      </Block>
    </Block>
  );
};

export {EditorView};

const styles = StyleSheet.create({
  postContainer: {
    width: width * 0.9,
    height: 250,
    margin: 0,
    padding: 0,
    fontSize: 14,
    borderColor: 'grey',
    borderWidth: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  commentContainer: {
    width: width * 0.85,
    height: theme.SIZES.BASE * 3,
    backgroundColor: theme.COLORS.WHITE,
    borderColor: 'red',
    borderWidth: 2,
    paddingVertical: 0,
    marginVertical: 0,
  },
  components: {
    paddingTop: theme.SIZES.BASE * 3,
  },
  input: {
    borderBottomWidth: 1,
  },
  inputDefault: {
    borderBottomColor: argonTheme.COLORS.PLACEHOLDER,
  },
  bodyContainer: {
    height: 250,
    margin: 0,
    padding: 0,
    fontSize: 14,
    borderColor: 'grey',
    borderWidth: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
