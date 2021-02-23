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
import {Block, Button, Input, Text, theme} from 'galio-framework';

import LinearGradient from 'react-native-linear-gradient';
import {argonTheme, materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';
import {navigate} from '~/navigation/service';

import {useIntl} from 'react-intl';

const {width, height} = Dimensions.get('window');

const TERMS_URL = 'https://letsblurt.app/terms';
const PRIVACY_URL = 'https://letsblurt.app/privacy';

interface Props {
  username: string;
  password: string;
  message: string;
  loading: boolean;
  handleUsernameChange: (username: string) => void;
  handlePasswordChange: (password: string) => void;
  processLogin: () => void;
}

const LoginScreen = (props: Props): JSX.Element => {
  //// props
  const {username, password, message, loading} = props;
  const intl = useIntl();

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signin, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      <Block flex middle>
        <Block middle>
          <Block
            row
            center
            space="between"
            style={{marginVertical: theme.SIZES.BASE * 1.875}}></Block>
        </Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 2.625,
            paddingHorizontal: 50,
          }}>
          <Text center color="white" size={24}>
            {intl.formatMessage({id: 'Login.header'})}
          </Text>
          <Text center color="white" size={14}>
            {intl.formatMessage({id: 'Login.header_desc'})}
          </Text>
        </Block>
        <Block flex={1} center space="between">
          <Block center>
            <Input
              borderless
              defaultValue={username}
              color="white"
              placeholder="Username"
              type="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              bgColor="transparent"
              placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
              onChangeText={props.handleUsernameChange}
              style={styles.input}
            />
            <Input
              password
              viewPass
              borderless
              defaultValue={password}
              color="white"
              iconColor="white"
              placeholder="Password"
              bgColor="transparent"
              placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
              onChangeText={props.handlePasswordChange}
              style={styles.input}
            />
            <Text style={{color: 'red'}}>{message}</Text>
          </Block>
          <Block flex top style={{marginTop: 20}}>
            <Button
              shadowless
              color={argonTheme.COLORS.ERROR}
              style={styles.button}
              loading={loading}
              onPress={props.processLogin}>
              {intl.formatMessage({id: 'Login.button'})}
            </Button>
            <Block center row>
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                <Text color="white">{intl.formatMessage({id: 'terms'})}</Text>
              </TouchableOpacity>
              <Text color="white"> and </Text>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
                <Text color="white">{intl.formatMessage({id: 'privacy'})}</Text>
              </TouchableOpacity>
            </Block>
            <Button
              color="transparent"
              shadowless
              style={styles.button}
              onPress={() => navigate({name: 'SignUp'})}>
              <Text
                center
                color={theme.COLORS.WHITE}
                size={18}
                style={{marginTop: 20}}>
                {intl.formatMessage({id: 'Login.signup_guide'})}
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>
    </LinearGradient>
  );
};

export {LoginScreen};

const styles = StyleSheet.create({
  signin: {
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
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
  inputActive: {
    borderBottomColor: 'white',
  },
});
