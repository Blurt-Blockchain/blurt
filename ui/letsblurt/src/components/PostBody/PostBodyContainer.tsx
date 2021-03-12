//// react
import React, {useRef, useState, useContext} from 'react';
//// react native
import {Linking, Platform, PermissionsAndroid} from 'react-native';
import {get} from 'lodash';
import {useIntl} from 'react-intl';
import {PostBodyView} from './PostBodyView';
import {UIContext, AuthContext, PostsContext} from '~/contexts';
import {navigate} from '~/navigation/service';
import RNFetchBlob from 'rn-fetch-blob';
import Clipboard from '@react-native-community/clipboard';
import CameraRoll from '@react-native-community/cameraroll';

import {Text} from 'react-native';

interface Props {
  body: string;
  commentDepth?: number;
}
const PostBodyContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {setAuthorParam, setToastMessage} = useContext(UIContext);
  const {authState} = useContext(AuthContext);
  const {setPostRef, appendTag, setPostDetails} = useContext(PostsContext);
  //// states
  const [selectedLink, setSelectedLink] = useState(null);
  const [postImages, setPostImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  //// refs
  const linkActionRef = useRef(null);
  const imageActionRef = useRef(null);

  //// handle post press
  const _handlePostPress = (author: string, permlink: string) => {
    if (permlink) {
      // set post ref
      setPostRef({author, permlink});
      //
      setPostDetails(null);
      // navigate to the post details screen
      navigate({name: 'PostDetails'});
    }
  };

  //// handle author press
  const _handleAuthorPress = (author: string) => {
    if (author) {
      // set author state in UIContext
      setAuthorParam(author);
      if (authState.currentCredentials.username === author) {
        // navigate to the author profile
        navigate({name: 'Profile'});
      } else {
        navigate({
          // if the author is the user, then navigate to the Profile
          name: 'AuthorProfile',
        });
      }
    } else {
      setToastMessage(
        intl.formatMessage({
          id: 'PostDetails.wrong_link',
        }),
      );
    }
  };

  //// handle tag press
  const _handleTagPress = (tag: string) => {
    console.log('[PostBodyContainer] _handleTagPress');
    // append tag to the tag list in postsContext
    appendTag(tag);
    if (tag) {
      // navigate to the feed
      navigate({
        name: 'Feed',
      });
    }
  };

  //// handle (post) link presss
  const _handleLinkPress = (event) => {
    //    console.log('post body link pressed. event', event);
    try {
      const data = JSON.parse(get(event, 'nativeEvent.data'));
      const {
        type,
        href,
        images,
        image,
        author,
        category,
        permlink,
        tag,
        proposal,
        videoHref,
      } = data;

      switch (type) {
        // external link
        case '_external':
        case 'markdown-external-link':
          // set the link
          setSelectedLink(href);
          console.log('external link clicked', href, linkActionRef);
          // show link action sheet
          linkActionRef.current?.setModalVisible();
          break;
        case 'markdown-author-link':
          // navigate to the author profile
          _handleAuthorPress(author);
          break;
        case 'markdown-post-link':
          // navigate to the post details
          _handlePostPress(author, permlink);
          break;
        case 'markdown-tag-link':
          // navigate to the feed with the tag
          _handleTagPress(tag);
          break;
        case 'markdown-witnesses-link':
          break;
        case 'markdown-proposal-link':
          break;
        case 'markdown-video-link':
          break;
        case 'image':
          // set all images in the post
          setPostImages(images);
          // set the selected image
          setSelectedImage(image);
          // show action sheet for image
          imageActionRef.current?.setModalVisible(true);
          break;
        default:
          break;
      }
    } catch (error) {
      setToastMessage(intl.formatMessage({id: 'PostDetails.wrong_link'}));
    }
  };

  //// open external link
  const _openExternalLInk = () => {
    // open link
    Linking.canOpenURL(selectedLink).then((supported) => {
      if (supported) {
        Linking.openURL(selectedLink);
      } else {
        // toast message
        setToastMessage(intl.formatMessage({id: 'Alert.open_link_fail'}));
      }
    });
    // hide the link action sheet
    linkActionRef.current?.setModalVisible(false);
  };

  //// copy link to the clipboard with image option
  const _copyLinkToClipboard = (isImage: boolean) => {
    let link = null;
    // if image, copy image link and hide the image action sheet
    if (isImage) {
      link = selectedImage;
      imageActionRef.current?.setModalVisible(false);
    } else {
      link = selectedLink;
      linkActionRef.current?.setModalVisible(false);
    }
    // copt the link to the clipboard
    Clipboard.setString(link);
    setToastMessage(intl.formatMessage({id: 'Alert.copied'}));
    console.log('[_copyLinkToClipboard] link', link);
  };

  //// close action sheet with image option
  const _closeActionSheet = (isImage: boolean) => {
    if (isImage) {
      // hide image action sheet
      imageActionRef.current?.setModalVisible(false);
    } else {
      // hide link action sheet
      linkActionRef.current?.setModalVisible(false);
    }
  };

  //// request acessing gellary permission
  const _requestAndroidPermission = async () => {
    try {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;
      const status = await PermissionsAndroid.request(permission);
      return status === 'granted';
    } catch (error) {
      console.log(
        '[_requestAndroidPermission] failed to get permission',
        error,
      );
      return false;
    }
  };

  //// handle save an image
  const _onSaveImage = async () => {
    try {
      let uri = selectedImage;
      if (Platform.OS === 'android') {
        const hasPermission = await _requestAndroidPermission();
        console.log('[_saveImage] uri. hasPermission?', hasPermission);
        if (!hasPermission) return;
        uri = `file://${await _downloadImage(uri)}`;
        console.log('[_onSaveImage] uri', uri);
      }
      // save image
      CameraRoll.save(uri, {type: 'photo'})
        .then((res) => {
          // hide image action sheet
          imageActionRef.current?.setModalVisible(false);
          setToastMessage(intl.formatMessage({id: 'Alert.saved'}));
        })
        .catch((error) => {
          console.log('[_saveImage] failed to save image', error);
          setToastMessage(intl.formatMessage({id: 'Alert.save_fail'}));
        });
    } catch (error) {
      console.log('[_saveImage] failed to get image uri', error);
      setToastMessage(intl.formatMessage({id: 'Alert.save_fail'}));
    }
  };

  //// download an image
  const _downloadImage = async (uri) => {
    return RNFetchBlob.config({
      fileCache: true,
      appendExt: 'jpg',
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: 'Lets Blurt',
        description: 'image downloaded',
        mime: 'image/png',
      },
    })
      .fetch('GET', uri)
      .then((res) => {
        let status = res.info().status;
        if (status == 200) {
          return res.path();
        } else {
          Promise.reject();
        }
      })
      .catch((error) => {
        Promise.reject(error);
      });
  };

  return (
    <PostBodyView
      body={props.body}
      commentDepth={props.commentDepth ? props.commentDepth : 0}
      linkActionRef={linkActionRef}
      imageActionRef={imageActionRef}
      handleLinkPress={_handleLinkPress}
      copyLinkToClipboard={_copyLinkToClipboard}
      openExternalLInk={_openExternalLInk}
      onSaveImage={_onSaveImage}
      closeActionSheet={_closeActionSheet}
    />
  );
};

export {PostBodyContainer};
