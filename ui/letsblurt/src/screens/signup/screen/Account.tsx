//// react
import React, {useState, useContext} from 'react';
//// react native
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// navigation
import {navigate} from '~/navigation/service';
//// UI
import {Block, Button, Text, theme, Checkbox} from 'galio-framework';
import LinearGradient from 'react-native-linear-gradient';
import {argonTheme, materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';

const {width, height} = Dimensions.get('window');

interface Props {
  account: string;
  password: string;
  keyCopied: boolean;
  loading: boolean;
  finalized: boolean;
  createAccount: () => void;
  copyPasswordToClipboard: () => void;
  handleKeyCheckChange: () => void;
}

const AccountScreen = (props: Props): JSX.Element => {
  //// props
  const {account, password, keyCopied, loading, finalized} = props;
  //// language
  const intl = useIntl();

  const _renderKey = () => {
    return (
      <Block flex={1} center space="between">
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
            {`${intl.formatMessage({id: 'account'})}: ${account}`}
          </Text>
          <Text color="red" center size={theme.SIZES.FONT * 0.875}>
            {intl.formatMessage({id: 'Signup.key_guide'})}
          </Text>
        </Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 0.625,
            paddingHorizontal: 50,
          }}>
          <Text color="orange" center size={theme.SIZES.FONT * 0.875}>
            {password}
          </Text>
        </Block>
        <Block flex center style={{marginTop: 20}}>
          <Button
            shadowless
            style={styles.button}
            color={materialTheme.COLORS.BUTTON_COLOR}
            onPress={props.copyPasswordToClipboard}>
            {intl.formatMessage({id: 'Signup.copy_key'})}
          </Button>
          <Block style={{marginTop: 20}}>
            <Checkbox
              color="primary"
              labelStyle={{color: 'red'}}
              initialValue={false}
              flexDirection="row-reverse"
              label={intl.formatMessage({id: 'Signup.confirm_check'})}
              onChange={props.handleKeyCheckChange}
            />
          </Block>
          <Button
            shadowless
            disabled={!keyCopied}
            loading={loading}
            style={styles.button}
            color={
              keyCopied
                ? materialTheme.COLORS.ERROR
                : materialTheme.COLORS.MUTED
            }
            onPress={props.createAccount}>
            {intl.formatMessage({id: 'Signup.finish_button'})}
          </Button>
        </Block>
      </Block>
    );
  };

  const _renderWelcome = () => {
    return (
      <Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 0.625,
            paddingHorizontal: 50,
          }}>
          <Text color="pink" center size={theme.SIZES.FONT * 1.475}>
            {intl.formatMessage({id: 'Signup.welcome_header'})}
          </Text>
          <Text color="white" center size={theme.SIZES.FONT * 0.875}>
            {intl.formatMessage({id: 'Signup.welcome_guide'})}
          </Text>
        </Block>
        <Block flex center style={{marginTop: 20}}>
          <Button
            shadowless
            style={styles.button}
            color={argonTheme.COLORS.ERROR}
            onPress={() => navigate({name: 'Login'})}>
            {intl.formatMessage({id: 'Signup.login_button'})}
          </Button>
        </Block>
      </Block>
    );
  };

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signup, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      {finalized ? _renderWelcome() : _renderKey()}
    </LinearGradient>
  );
};

export {AccountScreen};

const styles = StyleSheet.create({
  signup: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight + 70 : 0,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
  },
});
