/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useContext} from 'react';
import {StyleSheet, ImageBackground, StatusBar, Dimensions} from 'react-native';

import {useIntl} from 'react-intl';

import {Block, Text, Button, theme} from 'galio-framework';
import LinearGradient from 'react-native-linear-gradient';
const {height, width} = Dimensions.get('screen');
// navigation
import {navigate} from '../../../navigation/service';

import {materialTheme} from '../../../constants/materialTheme';
import {argonTheme} from '../../../constants';

// ui context
import {UIContext} from '../../../contexts';

const IntroScreen = () => {
  const intl = useIntl();
  const {uiState, setToastMessage} = useContext(UIContext);

  const _onGetStarted = async () => {
    setToastMessage('Get Started');
    navigate({name: 'Drawer'});
  };

  return (
    <Block flex style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Block flex center></Block>
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
};

export {IntroScreen};

const styles = StyleSheet.create({
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
