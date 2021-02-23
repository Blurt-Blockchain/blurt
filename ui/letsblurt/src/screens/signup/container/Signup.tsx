//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// firebase
import {firebase} from '@react-native-firebase/functions';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
//// navigation
import {useFocusEffect} from '@react-navigation/native';

import SplashScreen from 'react-native-splash-screen';
import {SignupScreen} from '../screen/Signup';
import {AccountScreen} from '../screen/Account';
////
import Clipboard from '@react-native-community/clipboard';
import {OTP} from '~/components';

import {
  checkUsernameAvailable,
  createAccount,
  generateMasterPassword,
  getDynamicGlobalProperties,
} from '~/providers/blurt/dblurtApi';

//// contexts
import {UIContext, UserContext} from '~/contexts';
import {acc} from 'react-native-reanimated';

interface Props {}
const Signup = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {userState} = useContext(UserContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [username, setUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [showSignupScreen, setShowSignupScreen] = useState(true);
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);

  const [copied, setCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    setShowSignupScreen(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // clear modal
      setShowAccountScreen(false);
      setUsernameMsg('');
      setAccountAvailable(false);
      setShowSignupScreen(true);
    }, []),
  );

  // start sign up process
  const _onStartSignup = async () => {
    // check if username is avaliable
    const available = await checkUsernameAvailable(username);
    console.log('username avail?', available);
    setAccountAvailable(available);
    if (available) {
      setUsernameMsg(intl.formatMessage({id: 'Signup.username_available'}));
      // now the username is avaliable, generate masster password
      const _password = generateMasterPassword();
      setPassword(_password);
      setShowSignupScreen(false);
      setShowOTP(true);
    } else {
      setUsernameMsg(intl.formatMessage({id: 'Signup.username_exists'}));
    }
  };

  const _checkUsernameValid = (_username: string) => {
    if (_username.length < 3) {
      console.log('username must be longer than 3.', _username);
      setUsernameMsg(intl.formatMessage({id: 'Signup.msg_too_short'}));
      return false;
    }
    // long length
    if (_username.length > 16) {
      console.log('username must be shorter than 16.', _username);
      setUsernameMsg(intl.formatMessage({id: 'Signup.msg_too_long'}));
      return false;
    }
    // start with number
    if (_username.match(/^\d/)) {
      console.log('username must not start with a number.', _username);
      setUsernameMsg(intl.formatMessage({id: 'Signup.msg_number'}));
      return false;
    }
    return true;
  };

  const _handleUsernameChange = (text: string) => {
    // set username
    setUsername(text);
    // check username valid
    const valid = _checkUsernameValid(text);
    if (valid) {
      setAccountAvailable(true);
      setUsernameMsg('');
    } else {
      setAccountAvailable(false);
    }
  };

  const _createAccount = async () => {
    console.log('userState global props', userState.globalProps);
    // set loading flag
    setLoading(true);
    const options = {
      username,
      password,
      creationFee: userState.globalProps.chainProps.account_creation_fee,
    };
    const result = await firebase
      .functions()
      .httpsCallable('createAccountRequest')(options);

    console.log('_createAccount. result', result);
    // check sanity
    if (result) {
      // create a new doc in phones collection (firestore)
      firestore().collection('phones').add({
        username: username,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
      });
      // update the finalize flag
      setFinalized(true);
    }
    // clear loading
    setLoading(false);
  };

  //// check if the given phone number exists in db
  const _checkDuplicatedPhone = async (_phone: string) => {
    // sign in to firebase anonymously to use firebase firestore
    await auth()
      .signInAnonymously()
      .then((result) => console.log('signed in firebase', result))
      .catch((error) => console.log('failed to sign in firebase', error));

    // reference to phones collection
    const phonesRef = firestore().collection('phones');
    let duplicated = false;
    await phonesRef
      .where('phoneNumber', '==', _phone)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          console.log('phone duplicated');
          duplicated = true;
        }
      })
      .catch((error) => {
        console.log('failed to query phones', error);
      });
    return duplicated;
  };

  const _handleOTPResult = async (result: boolean, _phoneNumber?: string) => {
    if (_phoneNumber != '') {
      console.log('phoneNumber', _phoneNumber);
      setPhoneNumber(_phoneNumber);
    }
    console.log('opt result', result);

    if (result) {
      setShowAccountScreen(true);
    } else {
      setUsernameMsg('');
      setShowSignupScreen(true);
      setToastMessage(intl.formatMessage({id: 'OTP.otp_error'}));
    }
    setShowOTP(false);
  };

  const _copyPasswordToClipboard = () => {
    console.log('Clipboard', Clipboard);
    Clipboard.setString(password);
    // update state to show toast
    setCopied(true);
    // set toast message
    setToastMessage(intl.formatMessage({id: 'Signup.msg_copied'}));
  };

  const _handleKeyCheckChange = () => {
    setKeyCopied(!keyCopied);
  };

  const _cancelOTPModal = () => {
    // clear username message
    setUsernameMsg('');
    //
    setShowOTP(false);
    // reset account avaliable
    setAccountAvailable(false);
    // show signup screen
    setShowSignupScreen(true);
    // hide account screen
    setShowAccountScreen(false);
    //
    setLoading(false);
  };

  return showAccountScreen ? (
    <AccountScreen
      account={username}
      password={password}
      keyCopied={keyCopied}
      loading={loading}
      finalized={finalized}
      createAccount={_createAccount}
      copyPasswordToClipboard={_copyPasswordToClipboard}
      handleKeyCheckChange={_handleKeyCheckChange}
    />
  ) : showSignupScreen ? (
    <SignupScreen
      username={username}
      usernameMessage={usernameMsg}
      accountAvailable={accountAvailable}
      handleUsernameChange={_handleUsernameChange}
      onContinue={_onStartSignup}
    />
  ) : (
    showOTP && (
      <OTP
        showModal={showOTP}
        checkDuplicatedPhone={_checkDuplicatedPhone}
        handleOTPResult={_handleOTPResult}
        cancelModal={_cancelOTPModal}
      />
    )
  );
};

export {Signup};
