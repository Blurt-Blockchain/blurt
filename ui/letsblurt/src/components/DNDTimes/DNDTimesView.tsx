//// react
import React from 'react';
//// react native
import {Dimensions} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// UIs
import {Block} from 'galio-framework';
const {height, width} = Dimensions.get('window');
//// times
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Props {
  showStartClock: boolean;
  startTime: number;
  showEndClock: boolean;
  endTime: number;
  onConfirmTime: (date: Date, isStart: boolean) => void;
  onCancelTime: (isStart: boolean) => void;
}
const DNDTimesView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();

  // render a clock
  const renderClock = (isStart: boolean) => {
    return (
      <DateTimePickerModal
        headerTextIOS={
          isStart
            ? intl.formatMessage({id: 'Settings.start_clock_header'})
            : intl.formatMessage({id: 'Settings.end_clock_header'})
        }
        isVisible={isStart ? props.showStartClock : props.showEndClock}
        mode="time"
        onConfirm={(date: Date) => props.onConfirmTime(date, isStart)}
        onCancel={() => props.onCancelTime(isStart)}
        cancelTextIOS={intl.formatMessage({id: 'cancel'})}
        confirmTextIOS={intl.formatMessage({id: 'confirm'})}
      />
    );
  };

  return (
    <Block>
      {renderClock(true)}
      {renderClock(false)}
    </Block>
  );
};

export {DNDTimesView};
