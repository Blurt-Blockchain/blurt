//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {StyleSheet, Dimensions, Image, TouchableOpacity} from 'react-native';
//// config
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import Modal from 'react-native-modal';
import Slider from '@react-native-community/slider';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
//// coponents
import {DropdownModal} from '~/components';

interface Props {
  showModal: boolean;
  availableVoices: string[];
  languageIndex: number;
  handleSpeedComplete: (speed: number) => void;
  handlePitchComplete: (pitch: number) => void;
  handleLanguageChange: (index: number, value: string) => void;
  handleSpeakPress: () => void;
  handlePausePress?: () => void;
  handleStopPress?: () => void;
  cancelModal: () => void;
}
const TTSView = (props: Props): JSX.Element => {
  //// props
  const {showModal, availableVoices, languageIndex} = props;
  //// language
  const intl = useIntl();

  //// render language dropdown
  const _renderLanguageDropdown = () => {
    return (
      <Block row center space="between">
        <Text>{intl.formatMessage({id: 'TTS.language'})}</Text>
        <DropdownModal
          defaultText={availableVoices[languageIndex]}
          dropdownButtonStyle={styles.dropdownButtonStyle}
          selectedOptionIndex={languageIndex}
          rowTextStyle={styles.rowTextStyle}
          style={styles.dropdown}
          dropdownStyle={styles.dropdownStyle}
          textStyle={styles.dropdownText}
          options={availableVoices || []}
          onSelect={props.handleLanguageChange}
        />
      </Block>
    );
  };
  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={props.cancelModal}>
      <Block style={styles.container}>
        <Block center>
          {_renderLanguageDropdown()}
          <Block row space="around">
            <Icon
              style={{margin: 10}}
              size={50}
              color={argonTheme.COLORS.ERROR}
              name="play"
              family="antdesign"
              onPress={props.handleSpeakPress}
            />
            {/* <Icon
              style={{margin: 10}}
              size={50}
              color={argonTheme.COLORS.BLACK}
              name="pause"
              family="antdesign"
              onPress={props.handlePausePress}
            />
            <Icon
              style={{margin: 10}}
              size={50}
              color={argonTheme.COLORS.ERROR}
              name="close"
              family="antdesign"
              onPress={props.handleStopPress}
            /> */}
          </Block>
          <Block row center space="between">
            <Text>{intl.formatMessage({id: 'TTS.speed'})}</Text>
            <Slider
              style={{width: width * 0.5, height: 40}}
              value={0.6}
              onValueChange={props.handleSpeedComplete}
              minimumValue={0.01}
              maximumValue={0.99}
              step={0.1}
            />
          </Block>
          <Block row center space="between">
            <Text>{intl.formatMessage({id: 'TTS.pitch'})}</Text>
            <Slider
              style={{width: width * 0.5, height: 40}}
              value={1.5}
              onValueChange={props.handlePitchComplete}
              minimumValue={0}
              maximumValue={2}
              step={0.1}
            />
          </Block>
        </Block>
      </Block>
    </Modal>
  );
};

export {TTSView};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '#788187',
  },
  rowTextStyle: {
    fontSize: 12,
    color: '#788187',
    padding: 5,
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 150,
    width: 200,
    backgroundColor: argonTheme.COLORS.DEFAULT,
  },
  // dropdown container
  dropdownButtonStyle: {
    width: 180,
    marginRight: 10,
    //    borderColor: '#f5f5f5',
  },
  // modal dropdown's button style
  dropdown: {
    width: 180,
    marginLeft: 10,
  },
  text: {
    width: 70,
    textAlign: 'left',
    marginRight: 10,
  },
  input: {
    width: width * 0.5,
    marginRight: 10,
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
