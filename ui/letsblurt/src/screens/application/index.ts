import {AppContainer} from './container/AppContainer';
import {WelcomeScreen} from './screen/Welcome';

export {AppContainer, WelcomeScreen};

/*
import React, {useState} from 'react';
import {AppContainer} from './container/AppContainer';
import ApplicationScreen from './screen/Application';
import {IntroScreen} from './screen/Intro';

const Application = () => {
  const [showAnimation, setShowAnimation] = useState(
    process.env.NODE_ENV !== 'development',
  );
  console.log('Application index');
  return (
    <AppContainer>
      {({toastMessage}) => {
        return <ApplicationScreen toastMessage={toastMessage} />;
      }}
    </AppContainer>
  );
};

export default Application;
export {AppContainer, IntroScreen};
*/
