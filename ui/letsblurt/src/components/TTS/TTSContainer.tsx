//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {View} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// context
import {AuthContext, UIContext, SettingsContext} from '~/contexts';
import {AuthorList} from '~/components';
//// views
import {TTSView} from './TTSView';

interface Props {
  text: string;
}
const TTSContainer = (props: Props): JSX.Element => {
  //// props
  const {text} = props;
  //// contexts
  const {
    uiState,
    setTTSRate,
    setTTSPitch,
    setTTSLanguageIndex,
    speakBody,
    pauseTTS,
    resumeTTS,
    stopTTS,
  } = useContext(UIContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [showModal, setShowModal] = useState(false);
  const [languageIndex, setLanguageIndex] = useState(0);
  //// effects
  useEffect(() => {
    setShowModal(true);
    // set index for default language
    const _index = uiState.availableVoices.indexOf(
      settingsState.languages.locale,
    );
    console.log('available voices, index', uiState.availableVoices, _index);
    setLanguageIndex(_index);
  }, []);

  ////
  const _handleSpeedComplete = (_speed: number) => {
    // set speed
    setTTSRate(_speed);
  };

  ////
  const _handlePitchComplete = (_pitch: number) => {
    // set pitch
    setTTSPitch(_pitch);
  };

  ////
  const _handleLanguageChange = (index: number, value: string) => {
    setLanguageIndex(index);
    // set default TTS language
    setTTSLanguageIndex(index);
  };

  ////
  const _handleSpeakPress = () => {
    console.log('TTS. speak pressed. text', text);
    // dimiss modal
    setShowModal(false);
    speakBody(text);
  };
  const _handlePausePress = () => {
    pauseTTS();
  };
  const _handleStopPress = () => {
    stopTTS();
  };

  const _cancelModal = () => {
    setShowModal(false);
  };
  return (
    <TTSView
      showModal={showModal}
      availableVoices={uiState.availableVoices}
      languageIndex={languageIndex}
      handleLanguageChange={_handleLanguageChange}
      handleSpeedComplete={_handleSpeedComplete}
      handlePitchComplete={_handlePitchComplete}
      handleSpeakPress={_handleSpeakPress}
      handlePausePress={_handlePausePress}
      handleStopPress={_handleStopPress}
      cancelModal={_cancelModal}
    />
  );
};

export {TTSContainer};
