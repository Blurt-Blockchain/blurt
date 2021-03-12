import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';

// modal drop down
import ModalDropdown from 'react-native-modal-dropdown';

import {Block, Icon, Button, Input, theme} from 'galio-framework';
import {TouchableOpacity} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('screen');

interface Props {
  childIconWrapperStyle?;
  children?;
  defaultText;
  iconStyle?;
  iconName?;
  isHasChildIcon?;
  onSelect?;
  dropdownStyle?;
  dropdownTextStyle?;
  dropdownButtonStyle?;
  textStyle?;
  rowTextStyle?;
  selectedOptionIndex?;
  options?;
  style?;
  noHighlight?;
  isLoading?;
  dropdownRef?;
  dropdownRowWrapper?;
}

const DropdownModal = (props: Props): JSX.Element => {
  const _renderDropdownRow = (
    rowData,
    rowID,
    highlighted,
    rowTextStyle,
    noHighlight,
    dropdownRowWrapper,
  ) => (
    <TouchableOpacity style={styles.rowWrapper} underlayColor="#E9F2FC">
      <View
        style={[
          styles.dropdownRow,
          dropdownRowWrapper,
          !noHighlight && highlighted && styles.highlightedRow,
        ]}>
        <Text
          style={[
            rowTextStyle || styles.rowText,
            !noHighlight && highlighted && styles.highlightedRowText,
          ]}>
          {rowData}
        </Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={[styles.container, props.dropdownButtonStyle]}>
      <ModalDropdown
        ref={props.dropdownRef}
        style={[!props.style ? styles.button : props.style]}
        textStyle={[props.textStyle || styles.buttonText]}
        dropdownStyle={[
          styles.dropdown,
          props.dropdownStyle,
          {height: 35 * (props.options.length + 1)},
        ]}
        dropdownTextStyle={[props.dropdownTextStyle || styles.dropdownText]}
        dropdownTextHighlightStyle={styles.dropdownTextHighlight}
        options={props.options}
        onSelect={(e) => {
          props.onSelect && props.onSelect(e, props.options[e]);
        }}
        defaultIndex={props.selectedOptionIndex}
        defaultValue={props.defaultText}
        renderSeparator={() => null}
        renderRow={(rowData, rowID, highlighted) =>
          _renderDropdownRow(
            rowData,
            rowID,
            highlighted,
            props.rowTextStyle,
            props.noHighlight,
            props.dropdownRowWrapper,
          )
        }>
        {props.isHasChildIcon && !props.isLoading ? (
          <View
            style={[
              styles.iconWrapper,
              props.childIconWrapperStyle && props.childIconWrapperStyle,
            ]}>
            <Icon
              style={[styles.dropdownIcon, props.iconStyle]}
              family="material-icon"
              name={!props.iconName ? 'arrow-drop-down' : props.iconName}
            />
          </View>
        ) : (
          props.isHasChildIcon && <ActivityIndicator />
        )}
      </ModalDropdown>
      {!props.children && !props.isHasChildIcon && (
        <View style={styles.iconWrapper}>
          <Icon
            style={styles.dropdownIcon}
            family="material-icon"
            name={!props.iconName ? 'arrow-drop-down' : props.iconName}
          />
        </View>
      )}
    </View>
  );
};

export {DropdownModal};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 35,
  },
  dropdownIcon: {
    fontSize: 22,
    color: '#788187',
    marginLeft: -5,
  },
  dropdown: {
    marginTop: 5,
    marginLeft: -2,
    paddingTop: 10,
    paddingBottom: 10,
    minWidth: width / 2,
    borderColor: '#ffffff',
    borderRadius: 5,
    shadowOpacity: 0.3,
    shadowColor: '#b0b0b0',
    backgroundColor: '#f6f6f6',
    maxHeight: height / 2,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: 10,
    height: 40,
    left: -20,
  },
  dropdownText: {
    fontSize: 10,
    color: '#788187',
    padding: 5,
    borderColor: '#c5c5c5',
  },
  dropdownTextHighlight: {
    backgroundColor: '#357ce6',
    width: width / 3,
  },
  button: {
    marginLeft: 25,
  },
  buttonText: {
    fontSize: 10,
    alignSelf: 'center',
    color: '#788187',
    fontWeight: 'bold',
  },
  rowWrapper: {
    height: 35,
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: width / 2,
    padding: 5,
  },
  dropdownRow: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  highlightedRow: {
    borderRadius: 20,
    height: 35,
    backgroundColor: '#357ce6',
    alignSelf: 'flex-start',
    paddingLeft: 11,
    paddingRight: 11,
    marginLeft: 0,
  },
  highlightedRowText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rowText: {
    fontSize: 10,
    color: '#788187',
  },
});
