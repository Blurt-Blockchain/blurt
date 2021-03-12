/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import Config from 'react-native-config';
import React, {useContext} from 'react';
import {
  ScrollView,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useIntl} from 'react-intl';
import {Block, Text, Button, theme, Icon} from 'galio-framework';
import SplashScreen from 'react-native-splash-screen';
import LinearGradient from 'react-native-linear-gradient';
const {height, width} = Dimensions.get('screen');
// navigation
import {navigate} from '~/navigation/service';

import {materialTheme} from '~/constants/materialTheme';
import {argonTheme} from '~/constants';

// ui context
import {UIContext} from '~/contexts';

const WelcomeScreen = () => {
  SplashScreen.hide();
  const intl = useIntl();
  const {uiState, setToastMessage} = useContext(UIContext);

  const WELCOME_MESSAGES = [
    {
      text: intl.formatMessage({id: 'Welcome.msg1'}),
      color: 'white',
      bcolor: '#F65058FF',
    },
    {
      text: intl.formatMessage({id: 'Welcome.msg2'}),
      color: 'black',
      bcolor: '#FBDE44FF',
    },
    {
      text: intl.formatMessage({id: 'Welcome.msg3'}),
      color: 'white',
      bcolor: '#28334AFF',
    },
  ];

  const _onGetStarted = async () => {
    setToastMessage(intl.formatMessage({id: 'Welcome.not_loggedin'}));
    // set toast message
    navigate({name: 'Drawer'});
  };

  const _renderLastSlide = (index: number) => {
    if (index === WELCOME_MESSAGES.length - 1) {
      return (
        <Button style={{bottom: -50}} onPress={_onGetStarted}>
          {intl.formatMessage({id: 'Welcome.button'})}
        </Button>
      );
    }
  };

  const _renderDots = (id: number) => {
    return (
      <Block row center style={{top: 100}}>
        {WELCOME_MESSAGES.map((message, index) => (
          <Icon
            key={index}
            style={{marginHorizontal: 10}}
            size={20}
            color="white"
            name={id === index ? 'circle' : 'circle-thin'}
            family="font-awesome"
          />
        ))}
      </Block>
    );
  };

  const _renderSlides = () => {
    return WELCOME_MESSAGES.map((message, index) => {
      return (
        <Block
          key={message.text}
          style={[styles.slide, {backgroundColor: message.bcolor}]}>
          <Text size={26} color={message.color} style={{margin: 10}}>
            {message.text}
          </Text>
          {_renderLastSlide(index)}
          {_renderDots(index)}
        </Block>
      );
    });
  };
  return (
    <ScrollView horizontal style={{flex: 1}} pagingEnabled>
      {_renderSlides()}
    </ScrollView>
  );
};

export {WelcomeScreen};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
  },
  container: {
    backgroundColor: theme.COLORS.BLACK,
  },
  padded: {
    // paddingHorizontal: theme.SIZES.BASE * 2,
    position: 'relative',
    bottom: theme.SIZES.BASE,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 8,
    marginLeft: 12,
    borderRadius: 2,
    height: 22,
  },
  gradient: {
    zIndex: 1,
    position: 'absolute',
    top: 33 + theme.SIZES.BASE,
    left: 0,
    right: 0,
    height: 66,
  },
});

/*
  return (
    <Block flex style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Block flex center>
        <ImageBackground
          source={Onboarding}
          style={{height: height / 1.8, width, zIndex: 1}}
        />
      </Block>
      <Block flex={1.3} space="between" style={styles.padded}>
        <Block style={{paddingTop: 40, position: 'relative'}}>
          <LinearGradient
            style={styles.gradient}
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          />
          <Block
            style={{
              marginBottom: theme.SIZES.BASE / 2,
              paddingHorizontal: theme.SIZES.BASE * 2,
              zIndex: 3,
            }}>
            <Block>
              <Text color="orange" size={60}>
                Play
              </Text>
            </Block>
            <Block row style={{paddingTop: 10}}>
              <Text color="orange" size={60}>
                Steemit
              </Text>
            </Block>
          </Block>
          <Block style={{paddingHorizontal: theme.SIZES.BASE * 2}}>
            <Text size={16} color="rgba(255,255,255,0.6)">
              {intl.formatMessage({id: 'intro-msg'})}
            </Text>
          </Block>
        </Block>
        <Block center style={{paddingBottom: 30}}>
          <Button
            shadowless
            style={styles.button}
            color={argonTheme.COLORS.ERROR}
            onPress={_onGetStarted}>
            {intl.formatMessage({id: 'intro-button'})}
          </Button>
        </Block>
      </Block>
    </Block>
  );
*/
