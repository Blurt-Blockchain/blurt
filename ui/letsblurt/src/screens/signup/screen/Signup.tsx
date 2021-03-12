import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';

import LinearGradient from 'react-native-linear-gradient';
import {argonTheme} from '~/constants';
import {HeaderHeight, iPhoneX} from '~/constants/utils';

import {navigate} from '~/navigation/service';

import {useIntl} from 'react-intl';

const {width, height} = Dimensions.get('window');
const TERMS_URL = 'https://letsblurt.app/terms';
const PRIVACY_URL = 'https://letsblurt.app/privacy';

interface Props {
  username: string;
  usernameMessage: string;
  accountAvailable: boolean;
  handleUsernameChange: (text: string) => void;
  onContinue: () => void;
}

const SignupScreen = (props: Props): JSX.Element => {
  //// props
  const {username, accountAvailable, usernameMessage} = props;

  const intl = useIntl();

  const iconContent = (
    <Icon
      size={16}
      color={theme.COLORS.MUTED}
      name="person"
      family="material"
    />
  );

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signup, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      <Block flex middle>
        <KeyboardAvoidingView behavior="height" enabled>
          <Block style={{marginVertical: height * 0.05}}>
            <Block
              row
              center
              space="between"
              style={{marginVertical: theme.SIZES.BASE * 1.875}}></Block>
          </Block>
          <Block
            middle
            style={{
              paddingVertical: theme.SIZES.BASE * 0.625,
              paddingHorizontal: 50,
            }}>
            <Text color="#fff" center size={theme.SIZES.FONT * 1.475}>
              {intl.formatMessage({id: 'Signup.header'})}
            </Text>
            <Text color="orange" center size={theme.SIZES.FONT * 0.875}>
              {intl.formatMessage({id: 'Signup.header_desc'})}
            </Text>
          </Block>

          <Block flex={1} center space="between">
            <Block>
              <Input
                bgColor="transparent"
                placeholderTextColor={argonTheme.COLORS.PLACEHOLDER}
                borderless
                color="white"
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
                iconContent={iconContent}
                style={styles.input}
                onChangeText={props.handleUsernameChange}
              />
              {accountAvailable ? (
                <Text style={{color: 'orange'}}>{usernameMessage}</Text>
              ) : (
                <Text style={{color: 'red'}}>{usernameMessage}</Text>
              )}
            </Block>
            <Block flex style={{marginTop: 20}}>
              <Button
                shadowless
                disabled={!accountAvailable}
                color={
                  accountAvailable
                    ? argonTheme.COLORS.ERROR
                    : argonTheme.COLORS.MUTED
                }
                style={styles.button}
                onPress={props.onContinue}>
                {intl.formatMessage({id: 'Signup.button'})}
              </Button>
              <Block center row>
                <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                  <Text color="white">Terms</Text>
                </TouchableOpacity>
                <Text color="white"> and </Text>
                <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
                  <Text color="white">Policy</Text>
                </TouchableOpacity>
              </Block>

              <Button
                color="transparent"
                shadowless
                style={styles.button}
                onPress={() => {
                  navigate({name: 'Login'});
                }}>
                <Text
                  center
                  color={theme.COLORS.WHITE}
                  size={theme.SIZES.FONT * 1}>
                  {intl.formatMessage({id: 'Signup.signin_guide'})}
                </Text>
              </Button>
            </Block>
          </Block>
        </KeyboardAvoidingView>
      </Block>
    </LinearGradient>
  );
};

export {SignupScreen};

const styles = StyleSheet.create({
  signup: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
  },
  input: {
    width: width * 0.9,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: argonTheme.COLORS.PLACEHOLDER,
  },
  inputActive: {
    borderBottomColor: 'white',
  },
});
