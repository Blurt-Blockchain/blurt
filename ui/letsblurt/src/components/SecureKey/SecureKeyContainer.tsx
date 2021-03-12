//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {View} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// blockchain
import {verifyPassoword} from '~/providers/blurt/dblurtApi';
//// context
import {AuthContext, UserContext, SettingsContext} from '~/contexts';
//// components
import {OTP} from '~/components';
//// views
import {SecureKeyView} from './SecureKeyView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  showModal: boolean;
  username: string;
  requiredKeyType: KeyTypes;
  handleResult: (result: boolean, password: string) => void;
  cancelProcess: () => void;
}
const SecureKeyContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [showModal, setShowModal] = useState(props.showModal);
  const [loading, setLoading] = useState(false);

  //// effect

  //// display secure modal
  const _displayModal = () => {
    // hide otp modal
    if (settingsState.securities.useOTP) setShowOTP(false);
    // show secure modal after some time
    setTimeout(() => {
      // show token modal after some time
      setShowModal(true);
    }, 500);
  };

  //// display otp modal
  const _displayOTPModal = () => {
    // close secure modal
    setShowModal(false);
    // show otp modal after some time
    if (settingsState.securities.useOTP) {
      setTimeout(() => {
        setShowOTP(true);
      }, 500);
    }
  };

  //// update password
  const _handlePasswordChange = (_password: string) => {
    setPassword(_password);
  };

  ////
  const _handlePressConfirm = async () => {
    const {username} = authState.currentCredentials;
    setLoading(true);
    // check password
    const {keyType} = await verifyPassoword(username, password);
    setLoading(false);
    // check key type
    if (keyType && keyType >= props.requiredKeyType) {
      if (settingsState.securities.useOTP) {
        // display otp modal
        _displayOTPModal();
        return;
      }
      // clear message
      setMessage('');
      // send back the result
      props.handleResult(true, password);
    } else {
      // show message
      setMessage(intl.formatMessage({id: 'Transaction.need_higher_password'}));
    }
  };

  ////
  const _handleOTPResult = (result: boolean) => {
    console.log('_handleOTPResult. result', result);
    if (result) {
      // send back the result
      props.handleResult(true, password);
      // hide secure
      setShowModal(false);
    }
    if (!result) {
      // show error
      setMessage(intl.formatMessage({id: 'Transaction.need_higher_password'}));
    }
  };

  const _cancelModal = () => {
    // hide secure key modal
    setShowModal(false);
    // cancel process
    props.cancelProcess();
  };

  const _cancelOTPModal = () => {
    // cancel process
    props.cancelProcess();
  };

  return (
    <View>
      <SecureKeyView
        username={props.username}
        message={message}
        showModal={showModal}
        loading={loading}
        handlePasswordChange={_handlePasswordChange}
        handlePressConfirm={_handlePressConfirm}
        cancelModal={_cancelModal}
      />
      {showOTP && (
        <OTP
          showModal={showOTP}
          handleOTPResult={_handleOTPResult}
          cancelModal={_cancelOTPModal}
        />
      )}
    </View>
  );
};

export {SecureKeyContainer};
