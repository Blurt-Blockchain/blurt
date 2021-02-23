//// react
import React, {useState, useEffect, useRef, useContext} from 'react';
//// react native
import {View, StyleSheet, Dimensions, ScrollView, Image} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import ActionSheet from 'react-native-actions-sheet';
import {DropdownModal} from '~/components/DropdownModal';
import {argonTheme} from '~/constants/argonTheme';
import renderPostBody from '~/utils/render-helpers/markdown-2-html';
const {width, height} = Dimensions.get('screen');
//// contexts
import {UserContext} from '~/contexts';
import {PostData} from '~/contexts/types';
//// components
import {PostBody, Editor} from '~/components';
//// constants

interface Props {
  title: string;
  body: string;
  editMode: boolean;
  previewBody: string;
  rewardIndex: number;
  tagMessage: string;
  uploading: boolean;
  uploadedImage: {};
  posting: boolean;
  tags: string;
  clearBody?: boolean;
  handleTitleChange: (title: string) => void;
  handleBodyChange: (body: string) => void;
  handleTagsChange: (tags: string) => void;
  handleRewardChange: (index: number) => void;
  handlePressPostSubmit: () => void;
  followingList?: string[];
  handlePressBeneficiary: () => void;
  handleClearAll: () => void;
  handleCancelEditing: () => void;
}

const PostingScreen = (props: Props): JSX.Element => {
  //// props
  const {
    title,
    body,
    tags,
    editMode,
    previewBody,
    rewardIndex,
    tagMessage,
    clearBody,
  } = props;
  //// language
  const intl = useIntl();
  //// states
  // this is a workaround to use copy/paste
  const [titleEditable, setTitleEditable] = useState(false);

  //////// events
  //// mount
  useEffect(() => {
    setTimeout(() => setTitleEditable(true), 100);
  }, []);

  //// render preview of posting
  const _renderPreview = () => (
    <Block>
      <Text style={{marginLeft: 5, borderTopWidth: 2, fontWeight: 'bold'}}>
        {intl.formatMessage({id: 'Posting.preview'})}
      </Text>
      <Block card style={{margin: 10}}>
        <PostBody body={previewBody} />
      </Block>
    </Block>
  );

  const rewardOptions = ['Power Up 100%', 'No Reward'];
  const defaultOptionText = '';
  return (
    <View>
      <ScrollView>
        <Block flex>
          <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
            <Input
              value={title}
              editable={titleEditable}
              onChangeText={props.handleTitleChange}
              maxLength={100}
              borderless
              color="black"
              placeholder={intl.formatMessage({
                id: 'Posting.title_placeholder',
              })}
              placeholderTextColor={argonTheme.COLORS.FACEBOOK}
              bgColor="transparent"
              style={[styles.input, styles.inputDefault]}
            />
          </Block>
          <Editor
            isComment={false}
            originalBody={body}
            clearBody={clearBody}
            handleBodyChange={props.handleBodyChange}
          />

          <Block style={{paddingHorizontal: theme.SIZES.BASE}}>
            <Input
              color="black"
              placeholder={intl.formatMessage({id: 'Posting.tags_placeholder'})}
              placeholderTextColor={argonTheme.COLORS.FACEBOOK}
              bgColor="transparent"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              value={tags}
              onChangeText={props.handleTagsChange}
            />
            <Text color="red">{tagMessage}</Text>
          </Block>
          <Block row>
            <DropdownModal
              key={rewardOptions[rewardIndex]}
              defaultText={defaultOptionText || rewardOptions[rewardIndex]}
              dropdownButtonStyle={styles.dropdownButtonStyle}
              selectedOptionIndex={rewardIndex}
              rowTextStyle={styles.rowTextStyle}
              style={styles.dropdown}
              dropdownStyle={styles.dropdownStyle}
              textStyle={styles.dropdownText}
              options={rewardOptions}
              onSelect={props.handleRewardChange}
            />
            <Button
              size="small"
              onPress={props.handlePressBeneficiary}
              shadowless
              color={argonTheme.COLORS.FACEBOOK}>
              {intl.formatMessage({id: 'Posting.beneficiary_button'})}
            </Button>
          </Block>

          <Block center row>
            <Button
              onPress={props.handlePressPostSubmit}
              shadowless
              loading={props.posting}
              lodingSize="large"
              color={argonTheme.COLORS.ERROR}>
              {editMode
                ? intl.formatMessage({id: 'Posting.update_button'})
                : intl.formatMessage({id: 'Posting.post_button'})}
            </Button>
            {editMode ? (
              <Button
                onPress={props.handleCancelEditing}
                shadowless
                color="gray">
                {intl.formatMessage({id: 'Posting.cancel_button'})}
              </Button>
            ) : (
              <Button onPress={props.handleClearAll} shadowless color="gray">
                {intl.formatMessage({id: 'Posting.clear_button'})}
              </Button>
            )}
          </Block>
          {_renderPreview()}
        </Block>
      </ScrollView>
    </View>
  );
};

export {PostingScreen};

const styles = StyleSheet.create({
  components: {
    paddingTop: theme.SIZES.BASE * 3,
  },
  title: {
    paddingVertical: theme.SIZES.BASE / 12,
    paddingHorizontal: theme.SIZES.BASE * 1,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
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
  searchBar: {
    backgroundColor: argonTheme.COLORS.ERROR,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: argonTheme.COLORS.BORDER,
  },
  mentionList: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
  // dropdown
  text: {
    color: '#788187',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '#788187',
  },
  rowTextStyle: {
    fontSize: 12,
    color: '#788187',
    padding: 5,
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 200,
    width: 200,
  },
  dropdownButtonStyle: {
    borderColor: '#f5f5f5',
    borderWidth: 1,
    height: 44,
    width: 200,
    borderRadius: 8,
    marginRight: 20,
  },
  dropdown: {
    flexGrow: 1,
    width: 120,
  },
  textStyle: {
    color: '#357ce6',
  },
  textButton: {
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
  },
});
