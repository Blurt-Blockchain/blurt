//// react
import React from 'react';
//// react native
import {View, StyleSheet, Dimensions} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import Modal from 'react-native-modal';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
//// blockchain
//// components

interface Props {
  username: string;
  message: string;
  showModal: boolean;
  loading: boolean;
  handlePasswordChange: (password: string) => void;
  handlePressConfirm: () => void;
  cancelModal: () => void;
}
const SecureKeyView = (props: Props): JSX.Element => {
  //// props
  const {username, message, showModal, loading} = props;
  //// language
  const intl = useIntl();

  const _renderForms = () => {
    return (
      <Block center>
        <Block center style={{margin: 10}}>
          <Block row center space="between">
            <Input
              style={styles.input}
              editable={false}
              defaultValue={username}
              autoCapitalize="none"
              autoCorrect={false}
              left
              icon="at"
              family="font-awesome"
            />
          </Block>
          <Block row center space="between">
            <Input
              style={styles.input}
              left
              password
              viewPass
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={intl.formatMessage({
                id: 'SecureKey.password_placeholder',
              })}
              onChangeText={props.handlePasswordChange}
            />
          </Block>
          <Text color="red">
            {intl.formatMessage({id: 'SecureKey.password_guide'})}
          </Text>
        </Block>
      </Block>
    );
  };

  const _renderFooter = () => (
    <Block>
      <Block row center>
        <Button
          loading={loading}
          size="small"
          shadowless
          color={argonTheme.COLORS.ERROR}
          onPress={props.handlePressConfirm}>
          {intl.formatMessage({id: 'SecureKey.confirm_button'})}
        </Button>
      </Block>
      <Block center>
        <Text size={20} color="red">
          {message}
        </Text>
      </Block>
    </Block>
  );

  ////
  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={props.cancelModal}>
      <Block style={styles.listContainer}>
        <Block center>
          <Text
            h5
            style={{
              borderBottomColor: 'red',
              borderBottomWidth: 5,
              marginBottom: 10,
            }}>
            {intl.formatMessage({id: 'SecureKey.title'})}
          </Text>
        </Block>
        {_renderForms()}
        {_renderFooter()}
      </Block>
    </Modal>
  );
};

export {SecureKeyView};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: 'auto',
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  listContainer: {
    marginHorizontal: 10,
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  text: {
    width: 50,
    textAlign: 'left',
    marginRight: 10,
  },
  input: {
    width: width * 0.8,
    marginRight: 10,
  },
});
