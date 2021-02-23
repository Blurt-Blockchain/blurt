import React, {useContext} from 'react';
import {Platform, Dimensions} from 'react-native';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import {Icon} from 'galio-framework';
import {injectIntl, useIntl} from 'react-intl';

import {AuthContext, SettingsContext} from '~/contexts';

// screens
import {
  Feed,
  PostDetails,
  SearchFeed,
  Profile,
  AuthorProfile,
  Posting,
  Wallet,
  Notification,
  Login,
  ResolveAuth,
  WelcomeScreen,
  Settings,
  Signup,
} from '../screens';
import CustomDrawerContent from './Menu';

import {Header} from '../components/';
// themes
import {materialTheme} from '~/constants/';
import {argonTheme} from '~/constants';

const {width} = Dimensions.get('screen');

// navigation
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
// navigation params
import {BottomTabParams, DrawerParams} from './types';

//// create navigators
//
const Stack = createStackNavigator();
// top navigator: Drawer
const Drawer = createDrawerNavigator<DrawerParams>();
// the drawer includes Bottom Tab
//const Tab = createBottomTabNavigator<BottomTabParams>();
const Tab = createMaterialBottomTabNavigator<BottomTabParams>();

//// navigation props

const LandingStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="none">
      <Stack.Screen
        name="ResolveAuth"
        component={ResolveAuth}
        options={{
          headerTransparent: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
};

// use the navigators
const TabFeedStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={{
          header: ({navigation}) => {
            return <Header title="Feed" navigation={navigation} back={false} />;
          },
        }}
      />
      <Stack.Screen
        name="SearchFeed"
        component={SearchFeed}
        options={{
          header: ({navigation}) => {
            return (
              <Header title="Search" navigation={navigation} back={true} />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabNotificationStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          header: ({navigation}) => {
            return (
              <Header
                title="Notification"
                navigation={navigation}
                back={false}
              />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabProfileStack = (props): JSX.Element => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({navigation}) => {
            return (
              <Header title="Profile" navigation={navigation} back={false} />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabPostingStack = (): JSX.Element => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Posting"
        component={Posting}
        options={{
          header: ({navigation}) => {
            return (
              <Header title="Posting" navigation={navigation} back={false} />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabWalletStack = (): JSX.Element => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{
          header: ({navigation}) => {
            return (
              <Header title="Wallet" navigation={navigation} back={false} />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabIconSize: number = 22;
const TabNavigator = (props) => {
  // get route name
  const {route} = props;
  //// language
  const intl = useIntl();
  // check loggedin for profile, wallet, notification, posting
  const {authState} = useContext(AuthContext);
  const {loggedIn} = authState;
  let disable = true;
  // if (route !== 'Feed' && !loggedIn) return?
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      labeled={true}
      barStyle={{
        backgroundColor: argonTheme.COLORS.ERROR,
      }}>
      <Tab.Screen
        name="Feed"
        component={TabFeedStack}
        options={{
          tabBarLabel: intl.formatMessage({id: 'feed'}),
          tabBarIcon: ({focused}) => (
            <Icon
              name="feed"
              family="font-awesome"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={TabNotificationStack}
        options={{
          tabBarLabel: intl.formatMessage({id: 'notification'}),
          tabBarIcon: ({focused}) => (
            <Icon
              name="notifications"
              family="ionicon"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Posting"
        component={TabPostingStack}
        options={{
          tabBarLabel: intl.formatMessage({id: 'posting'}),
          tabBarIcon: ({focused}) => (
            <Icon
              name="pencil"
              family="font-awesome"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={TabProfileStack}
        listeners={({navigation, route}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Profile');
          },
        })}
        options={{
          tabBarLabel: intl.formatMessage({id: 'profile'}),
          tabBarIcon: ({focused}) => (
            <Icon
              name="user-alt"
              family="font-awesome-5"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={TabWalletStack}
        options={{
          tabBarLabel: intl.formatMessage({id: 'wallet'}),
          tabBarIcon: ({focused}) => (
            <Icon
              name="wallet"
              family="entypo"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const profile = {
  username: 'etainclub',
};

const PostDetailsStack = () => (
  <Stack.Navigator mode="card" headerMode="screen">
    <Stack.Screen
      name="PostDetails"
      component={PostDetails}
      options={{
        header: ({navigation}) => {
          return <Header title="Post" navigation={navigation} back={true} />;
        },
      }}
    />
  </Stack.Navigator>
);

const AuthorStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="AuthorProfile"
        component={AuthorProfile}
        options={{
          header: ({navigation}) => {
            return (
              <Header title="Author" navigation={navigation} back={true} />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

// const AuthorListStack = () => {
//   return (
//     <Stack.Navigator mode="card" headerMode="screen">
//       <Stack.Screen
//         name="AuthorList"
//         component={AuthorList}
//         options={{
//           header: ({navigation}) => {
//             return <Header title="Author List" navigation={navigation} />;
//           },
//         }}
//       />
//     </Stack.Navigator>
//   );
// };

const SettingsStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          header: ({navigation}) => {
            return (
              <Header title="Settings" navigation={navigation} back={true} />
            );
          },
        }}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigator = (props) => {
  const {authState} = useContext(AuthContext);
  const {settingsState} = useContext(SettingsContext);
  const profile = {
    avatar: `${settingsState.blockchains.image}/u/${authState.currentCredentials.username}/avatar`,
    name: authState.currentCredentials.username,
  };
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} profile={profile} />
      )}
      drawerStyle={{
        backgroundColor: 'white',
        width: width * 0.6,
      }}
      drawerContentOptions={{
        activeTintColor: 'white',
        inactiveTintColor: '#000',
        activeBackgroundColor: materialTheme.COLORS.ACTIVE,
        inactiveBackgroundColor: 'transparent',
        itemStyle: {
          width: width * 0.74,
          paddingHorizontal: 12,
          // paddingVertical: 4,
          justifyContent: 'center',
          alignContent: 'center',
          // alignItems: 'center',
          overflow: 'hidden',
        },
        labelStyle: {
          fontSize: 18,
          fontWeight: 'normal',
        },
      }}
      initialRouteName="Feed">
      <Drawer.Screen name="Feed" component={TabNavigator} />
      <Drawer.Screen name="Login" component={Login} />
      <Drawer.Screen name="SignUp" component={Signup} />
      <Drawer.Screen name="AuthorProfile" component={AuthorStack} />
      <Drawer.Screen name="PostDetails" component={PostDetailsStack} />
      {!authState.loggedIn ? (
        <Drawer.Screen name="Logout" component={Login} />
      ) : (
        <>
          {/* <Drawer.Screen name="Login" component={Login} />

          <Drawer.Screen name="SignUp" component={Signup} /> */}
        </>
      )}
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </Drawer.Navigator>
  );
};

const NavigationStack = ({intl}) => {
  const {authState} = useContext(AuthContext);

  return (
    <Stack.Navigator mode="card" headerMode="none">
      {!authState.authResolved && (
        <Stack.Screen
          name="Landing"
          component={LandingStack}
          options={{
            headerTransparent: true,
          }}
        />
      )}
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

export default injectIntl(NavigationStack);
