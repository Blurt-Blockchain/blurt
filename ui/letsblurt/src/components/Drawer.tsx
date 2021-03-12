import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Block, Text, theme, Icon} from 'galio-framework';
import {materialTheme} from '../constants/materialTheme';
import {navigate} from '../navigation/service';
import {useIntl} from 'react-intl';

interface Props {
  title: string;
  focused: boolean;
}
const DrawerItem = (props: Props) => {
  const intl = useIntl();

  const {title, focused} = props;

  const renderIcon = () => {
    const {title, focused} = props;
    switch (title) {
      case 'Feed':
        return (
          <Icon
            size={15}
            name="feed"
            family="font-awesome"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'Settings':
        return (
          <Icon
            size={15}
            name="gears"
            family="font-awesome"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'Login':
        return (
          <Icon
            size={15}
            name="ios-log-in"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'SignUp':
        return (
          <Icon
            size={15}
            name="md-person-add"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      default:
        return null;
    }
  };

  const _navigate = (route: string) => {
    if (route === 'Add') {
      navigate({name: route, params: {addingAccount: true}});
    } else {
      navigate({name: route});
    }
  };

  return (
    <TouchableOpacity style={{height: 55}} onPress={() => _navigate(title)}>
      <Block
        flex
        row
        style={[
          styles.defaultStyle,
          focused ? [styles.activeStyle, styles.shadow] : null,
        ]}>
        <Block middle flex={0.1} style={{marginRight: 28}}>
          {renderIcon()}
        </Block>
        <Block flex={0.9}>
          <Text size={15} color={focused ? 'white' : 'black'}>
            {intl.formatMessage({id: `${title.toLowerCase()}`})}
          </Text>
        </Block>
      </Block>
    </TouchableOpacity>
  );
};

export default DrawerItem;

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  activeStyle: {
    backgroundColor: materialTheme.COLORS.ACTIVE,
    borderRadius: 4,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
  },
});

/*
class DrawerItem extends React.Component<Props> {
  
  renderIcon = () => {
    const {title, focused} = this.props;

    switch (title) {
      case 'Feed':
        return (
          <Icon
            size={15}
            name="feed"
            family="font-awesome"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'Settings':
        return (
          <Icon
            size={15}
            name="gears"
            family="font-awesome"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'Login':
        return (
          <Icon
            size={15}
            name="ios-log-in"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'SignUp':
        return (
          <Icon
            size={15}
            name="md-person-add"
            family="ionicon"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      default:
        return null;
    }
  };

  _navigate = (route: string) => {
    if (route === 'Add') {
      navigate({name: route, params: {addingAccount: true}});
    } else {
      navigate({name: route});
    }
  };

  render() {
    const {title, focused} = this.props;
    return (
      <TouchableOpacity
        style={{height: 55}}
        onPress={() => this._navigate(title)}>
        <Block
          flex
          row
          style={[
            styles.defaultStyle,
            focused ? [styles.activeStyle, styles.shadow] : null,
          ]}>
          <Block middle flex={0.1} style={{marginRight: 28}}>
            {this.renderIcon()}
          </Block>
          <Block flex={0.9}>
            <Text size={15} color={focused ? 'white' : 'black'}>
              {intl.formatMessage({id: `${title.toLowerCase()}`})}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

*/
