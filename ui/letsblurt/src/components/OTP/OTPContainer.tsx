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
////
import {Country, CountryCode} from '~/screens/signup/screen/types';
////
import {OTPView} from './OTPView';
import {UIContext} from '~/contexts';
//// constants
const countryData = require('react-native-country-picker-modal/lib/assets/data/countries-emoji.json');

interface Props {
  showModal: boolean;
  checkDuplicatedPhone?: (phone: string) => Promise<boolean>;
  handleOTPResult: (confirm: boolean, phoneNumber?: string) => void;
  cancelModal?: () => void;
}
const OTPContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSMSCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [showModal, setShowModal] = useState(props.showModal);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('KR');
  const [withFlag, setWithFlag] = useState<boolean>(true);
  const [country, setCountry] = useState<Country>(null);
  const [smsRequested, setSMSRequested] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState('');

  //////// events
  //// event: mount
  useEffect(() => {
    console.log('countryData', countryData);

    // get device country based on language setting not based on timezone
    console.log('locale', intl.locale);
    const code = intl.locale.split('-')[1];
    console.log('code', code);

    console.log('country', countryData[code]);
    setCountry(countryData[code]);
    // set country code
    setCountryCode(code);
    console.log('country code', code);
  }, []);

  //// handle phone number change
  const _handlePhoneNumberChange = (_phoneNumber: string) => {
    // clear phone message
    setPhoneMessage('');
    // this phone number does not include the country code
    setPhoneNumber(_phoneNumber);
  };

  //// handle sms code change
  const _handleSMSCodeChange = (_code: string) => {
    setSMSCode(_code);
  };

  //// handle country change
  const _handleCountryChange = (country: Country) => {
    console.log('country', country);
    setCountry(country);
    setCountryCode(country.cca2);
  };

  //// send sms code
  const _sendSMSCode = async () => {
    // build phone number including the country code
    const _phone = '+' + country.callingCode[0] + phoneNumber;
    // check sanity of the phone number
    const valid = _validatePhoneNumber(_phone);
    if (!valid) {
      console.log('invalid phone number', _phone);
      setPhoneMessage(intl.formatMessage({id: 'OTP.invalid_phonenumber'}));
      return;
    }
    // set phone number
    setPhoneNumber(phoneNumber);
    // check duplicated phone number
    if (props.checkDuplicatedPhone) {
      const duplicated = await props.checkDuplicatedPhone(_phone);
      if (duplicated) {
        console.log('phone number exists in db', _phone);
        setPhoneMessage(intl.formatMessage({id: 'OTP.duplicated_phonenumber'}));
        return;
      }
    }
    //// now send sms code
    // set code requested flag
    setSMSRequested(true);
    // clear phone message
    setPhoneMessage('');
    // verify phone auth of firebase and send sms code
    auth()
      .verifyPhoneNumber(_phone)
      .on(
        'state_changed',
        (phoneAuthSnapshot) => {
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT:
              console.log('[_verifyPhoneNumber] code sent');
              setPhoneMessage(intl.formatMessage({id: 'OTP.code_sent'}));
              // set verificationId
              setVerificationId(phoneAuthSnapshot.verificationId);
              break;
            case firebase.auth.PhoneAuthState.ERROR: // or 'error'
              console.log('verification error', phoneAuthSnapshot.error);
              setPhoneMessage(
                intl.formatMessage({id: 'OTP.verification_error'}),
              );
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
              // auto verified means the code has also been automatically confirmed as correct/received
              // phoneAuthSnapshot.code will contain the auto verified sms code - no need to ask the user for input.
              console.log('auto verified on android', phoneAuthSnapshot);
              // set sms code
              setSMSCode(phoneAuthSnapshot.code);
          }
        },
        (error) => {
          console.log('failed to verify phone number', error);
          setPhoneMessage(intl.formatMessage({id: 'OTP.verification_error'}));
        },
      );
  };

  //// check sanity of the phone number
  const _validatePhoneNumber = (_phoneNumber: string): boolean => {
    let regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(_phoneNumber);
  };

  //// verify SMS Code
  const _verifySMSCode = async () => {
    // @test
    //    smsCode = Config.SMS_TEST_CODE;
    console.log('sms code', smsCode);
    // build phone number including the country code
    const _phone = '+' + country.callingCode[0] + phoneNumber;
    // handle android auto login
    if (Platform.OS === 'android') {
      const valid = smsCode === smsCode ? true : false;
      props.handleOTPResult(valid, _phone);
      return true;
    }
    //// ios login
    // get credential
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      smsCode,
    );
    // try signin
    try {
      const user = await firebase.auth().signInWithCredential(credential);
      console.log('[signInWithCredential] user', user);
      // send back the result
      props.handleOTPResult(true, _phone);
      return true;

      // check new user here
      // if (user.additionalUserInfo.isNewUser) {
      //   props.handleOTPResult(true, _phone);
      //   return true;
      // } else {
      //   console.log(
      //     '[signInWithCredential] not mew user',
      //     user.additionalUserInfo.isNewUser,
      //   );
      //   props.handleOTPResult(false, _phone);
      //   return false;
      // }
    } catch (error) {
      console.log('failed to sign in firebase', error);
      // send back the result
      props.handleOTPResult(false, _phone);
      return false;
    }
  };

  ///// cancle the modal
  const _handleCancelModal = () => {
    //    setShowModal(false);
    props.cancelModal();
  };

  return (
    <OTPView
      showModal={showModal}
      phoneNumber={phoneNumber}
      smsCode={smsCode}
      countryCode={countryCode}
      phoneMessage={phoneMessage}
      loading={loading}
      smsRequested={smsRequested}
      handlePhoneNumberChange={_handlePhoneNumberChange}
      handleSMSCodeChange={_handleSMSCodeChange}
      onCountrySelect={_handleCountryChange}
      sendSMSCode={_sendSMSCode}
      verifySMSCode={_verifySMSCode}
      handleCancelModal={_handleCancelModal}
    />
  );
};

export {OTPContainer};
