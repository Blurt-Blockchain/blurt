// set top level navigation
// show notification

import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {View} from 'react-native';
// SafeAreaView provider
import {SafeAreaProvider} from 'react-native-safe-area-context';

// routes
import Screens from '~/navigation/routes';
// navigation helper
import {setTopLevelNavigator} from '~/navigation/service';
//
import {Toast} from '~/components/Toast';

interface Props {
  toastMessage: string;
  clearMessage: () => void;
}

const ApplicationScreen = ({toastMessage, clearMessage}: Props) => {
  const [showToastMessage, setShowToastMessage] = useState(false);

  useEffect(() => {
    console.log('app screen useEffect toast message', toastMessage);
    if (toastMessage) setShowToastMessage(true);
  }, [toastMessage]);

  const _onHideToastMessage = () => {
    // clear toast message
    clearMessage();
    // hide the toast
    setShowToastMessage(false);
  };

  return (
    <SafeAreaProvider style={{flex: 1}}>
      <NavigationContainer
        ref={(navigationRef: NavigationContainerRef) => {
          setTopLevelNavigator(navigationRef);
        }}>
        <Screens />
      </NavigationContainer>
      {showToastMessage && (
        <Toast
          text={toastMessage}
          duration={3000}
          onHide={_onHideToastMessage}
        />
      )}
    </SafeAreaProvider>
  );
};

export {ApplicationScreen};
