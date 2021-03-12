//// react
import React, {useState, useEffect, useContext, useRef} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Linking,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import ActionSheet from 'react-native-actions-sheet';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
import {UIContext} from '~/contexts';

interface Props {
  isComment: boolean;
  uploading: boolean;
  containerStyle: any;
  closeActionSheet: boolean;
  handlePhotoUpload: () => void;
  handleCameraUpload: () => void;
}
const ImageUploadView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  //// refs
  // photo
  const photoUploadRef = useRef(null);
  //// effects
  // effect: close prop
  useEffect(() => {
    // close action sheet
    if (props.closeActionSheet) {
      photoUploadRef.current?.setModalVisible(false);
    }
  }, [props.closeActionSheet]);

  //// handle press photo upload
  const _handlePressPhotoUpload = () => {
    console.log('[_handlePressPhotoUpload]');
    // show the action modal
    photoUploadRef.current?.setModalVisible(true);
  };

  ////
  const _openImagePicker = () => {
    props.handlePhotoUpload();
  };

  ///
  const _openCamera = () => {
    props.handleCameraUpload();
  };

  ////
  const _closeActionSheet = () => {
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  return (
    <Block>
      <Block {...props.containerStyle}>
        <Button
          onPress={_handlePressPhotoUpload}
          loading={props.uploading}
          onlyIcon
          icon="picture-o"
          iconFamily="font-awesome"
          iconSize={props.isComment ? 10 : 14}
          color={argonTheme.COLORS.ERROR}
        />
      </Block>
      <ActionSheet ref={photoUploadRef}>
        <Block center>
          <Button color="primary" onPress={_openImagePicker}>
            {intl.formatMessage({id: 'Actionsheet.gallery'})}
          </Button>
          <Button color="warning" onPress={_openCamera}>
            {intl.formatMessage({id: 'Actionsheet.camera'})}
          </Button>
          <Button color="gray" onPress={_closeActionSheet}>
            {intl.formatMessage({id: 'Actionsheet.close'})}
          </Button>
        </Block>
      </ActionSheet>
    </Block>
  );
};

export {ImageUploadView};

const styles = StyleSheet.create({});
