import React from 'react';
import {
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
//// language
import {useIntl} from 'react-intl';
import {Block, Text, theme, Icon} from 'galio-framework';
import {Drawer as DrawerCustomItem} from '../components/';
import {argonTheme, Images, materialTheme} from '../constants/';
import {navigate} from '../navigation/service';

const {width} = Dimensions.get('screen');

function CustomDrawerContent({
  drawerPosition,
  profile,
  focused,
  state,
  ...rest
}) {
  const screens = ['Feed', 'Settings'];
  // language
  const intl = useIntl();
  return (
    <Block
      style={styles.container}
      forceInset={{top: 'always', horizontal: 'never'}}>
      <Block flex={0.6} style={styles.header}>
        <TouchableWithoutFeedback onPress={() => navigate({name: 'Profile'})}>
          <Block center style={styles.profile}>
            <Image
              source={{uri: profile.avatar || null}}
              style={styles.avatar}
            />
            <Text h5 color={'white'}>
              @{profile.name}
            </Text>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
      <Block flex style={{paddingLeft: 7, paddingRight: 14}}>
        <ScrollView
          contentContainerStyle={[
            {
              paddingTop: 0,
              paddingLeft: drawerPosition === 'left' ? 0 : 0,
              paddingRight: drawerPosition === 'right' ? 0 : 0,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          {screens.map((item, index) => {
            return (
              <DrawerCustomItem
                title={item}
                key={index}
                focused={state.index === index ? true : false}
              />
            );
          })}
        </ScrollView>
      </Block>
      <Block
        flex={0.4}
        style={{paddingLeft: 7, paddingRight: 14, marginBottom: 50}}>
        <DrawerCustomItem
          title="Login"
          focused={state.index === 8 ? true : false}
        />
        <DrawerCustomItem
          title="SignUp"
          focused={state.index === 9 ? true : false}
        />
      </Block>
    </Block>
  );
}

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: argonTheme.COLORS.FACEBOOK,
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
  },
  profile: {
    marginBottom: theme.SIZES.BASE / 2,
  },
  avatar: {
    height: 150,
    width: 150,
    borderRadius: 150 / 2,
  },
});
