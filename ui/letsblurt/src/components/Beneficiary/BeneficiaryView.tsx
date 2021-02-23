//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import Modal from 'react-native-modal';
import Autocomplete from 'react-native-autocomplete-input';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
import {BeneficiaryItem} from './BeneficiaryContainer';
import {UIContext} from '~/contexts';

//// constants
import {WEIGHT_OPTIONS} from './BeneficiaryContainer';
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
interface Props {
  showModal: boolean;
  author: string;
  weight: string;
  beneficiaries: BeneficiaryItem[];
  refresh: boolean;
  errorMessage: string;
  imageServer: string;
  handleChangeAccount: () => void;
  handleChangeWeight: (weight: string) => void;
  handlePressAdd: () => void;
  handlePressRemove: (beneficiary: BeneficiaryItem) => void;
  handlePressSave: () => void;
  handleCancelModal: () => void;
}
const BeneficiaryView = (props: Props): JSX.Element => {
  //// props
  const {
    author,
    weight,
    beneficiaries,
    refresh,
    errorMessage,
    showModal,
  } = props;
  //// language
  const intl = useIntl();

  ////
  const _renderBeneficiaries = () => {
    console.log('bene list', beneficiaries);
    return beneficiaries.map((item, index) => {
      const {account, weight} = item;
      const avatar = `${props.imageServer}/u/${account}/avatar`;
      return (
        <Block
          key={account}
          row
          space="between"
          style={{
            marginBottom: 5,
            marginHorizontal: 10,
            padding: 5,
            height: 50,
            backgroundColor:
              BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          }}>
          <Block row middle>
            <Image
              source={{
                uri: avatar || null,
              }}
              style={styles.avatar}
            />
            <Text size={14} style={{marginHorizontal: 5}}>
              {account}
            </Text>
          </Block>
          <Block row right style={{width: '50%', top: -0}}>
            <Block center>
              <Input
                editable={index === 0 ? false : true}
                placeholder={intl.formatMessage({
                  id: 'Beneficiary.weight_placeholder',
                })}
                type="number-pad"
                value={(weight / 100).toString()}
                onChangeText={() => {}}
              />
            </Block>
            <Block row center style={{marginLeft: 10}}>
              <Text>%</Text>
              <Button
                disabled={index < 2 ? true : false}
                onPress={() => props.handlePressRemove(item)}
                onlyIcon
                icon="trash"
                iconFamily="font-awesome"
                iconSize={14}
                color={
                  index < 2 ? argonTheme.COLORS.MUTED : argonTheme.COLORS.ERROR
                }
              />
            </Block>
          </Block>
        </Block>
      );
    });
  };

  const _renderHeader = () => {
    return (
      <Block
        row
        space="between"
        style={{
          marginBottom: 5,
          marginHorizontal: 10,
          padding: 5,
          height: 50,
        }}>
        <Block middle style={{width: '45%'}}>
          <Input
            placeholder={intl.formatMessage({
              id: 'Beneficiary.account_placeholder',
            })}
            placeholderTextColor={argonTheme.COLORS.PLACEHOLDER}
            onFocus={props.handleChangeAccount}
            defaultValue={author}
          />
        </Block>
        <Block row right style={{width: '50%', top: -0}}>
          <Block center>
            <Input
              placeholder={intl.formatMessage({
                id: 'Beneficiary.weight_placeholder',
              })}
              placeholderTextColor={argonTheme.COLORS.PLACEHOLDER}
              type="number-pad"
              value={weight}
              onChangeText={props.handleChangeWeight}
            />
          </Block>
          <Block row center style={{marginLeft: 10}}>
            <Text>%</Text>
            <Button
              onPress={props.handlePressAdd}
              onlyIcon
              icon="plus"
              iconFamily="font-awesome"
              iconSize={14}
              color={argonTheme.COLORS.FACEBOOK}
            />
          </Block>
        </Block>
      </Block>
    );
  };

  const _renderFooter = () => (
    <Block>
      <Block row center>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.ERROR}
          onPress={props.handlePressSave}>
          {intl.formatMessage({id: 'Beneficiary.save_button'})}
        </Button>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.MUTED}
          onPress={props.handleCancelModal}>
          {intl.formatMessage({id: 'Beneficiary.cancel_button'})}
        </Button>
      </Block>
      <Block center>
        <Text size={16} color="red">
          {errorMessage}
        </Text>
      </Block>
    </Block>
  );

  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={props.handleCancelModal}>
      <Block style={styles.listContainer}>
        <Block center>
          <Text
            style={{
              borderBottomColor: 'red',
              borderBottomWidth: 5,
              marginBottom: 10,
            }}>
            {intl.formatMessage({id: 'Beneficiary.list_header'})}
          </Text>
        </Block>
        {refresh && _renderBeneficiaries()}
        {_renderHeader()}
        {_renderFooter()}
      </Block>
    </Modal>
  );
};

export {BeneficiaryView};

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
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  list: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
});
