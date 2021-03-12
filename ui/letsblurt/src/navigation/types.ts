import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import {createCompatNavigatorFactory} from '@react-navigation/compat';
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import {RouteProp} from '@react-navigation/native';

// root stack params list
export type RootParams = {
  Intro: undefined;
  Drawer: undefined;
};

// drawer stack params list
export type DrawerParams = {
  Feed: {category: string; tag: string; author?: string};
  AuthorProfile: undefined;
  Login: undefined;
  Logout: undefined;
  SignUp: undefined;
  Posting: undefined;
  PostDetails: undefined;
  Wallet: undefined;
  Settings: undefined;
};

// tab navigator params list
export type BottomTabParams = {
  Feed: {category: string; tag: string; author?: string};
  Profile: {author: string};
  Posting: undefined;
  Wallet: {author: string};
  Notification: undefined;
};

//// intro
export type IntroParams = {
  ResolveAuth: undefined;
  Intro: undefined;
};

//// feed stack
// feed stack params list
export type FeedStackParams = {
  // @todo consider tag, category
  Feed: undefined;
  // @todo consider post author, permlink
  PostDetails: undefined;
  // @todo consider search keyword
  Search: undefined;
};
// route prop
//type FeedScreenRouteProp = RouteProp<FeedStackParams, 'Feed'>;
// feed prop
//type FeedScreenNavigationProp = StackNavigationProp<FeedStackParams, 'Feed'>;
// export type FeedNavigationProp = {
//  route: FeedScreenRouteProp;
//  navigation: FeedScreenNavigationProp;
//};
export type FeedNavigationProp = StackNavigationProp<FeedStackParams, 'Feed'>;
export type FeedNavProp = {
  navigation: FeedNavigationProp;
};

// notification
export type NotificationStackParams = {
  Notification: undefined;
};
export type NotificationNavigationProp = StackNavigationProp<
  NotificationStackParams,
  'Notification'
>;
export type NotificationNavProp = {
  navigation: NotificationNavigationProp;
};

// profile stack params list
export type ProfileStackParams = {
  Profile: undefined;
  ProfileEdit: undefined;
};
//
export type ProfileRouteProp = RouteProp<ProfileStackParams, 'Profile'>;

export type PostingStackParams = {
  Posting: undefined;
  PostingEdit: undefined;
};

export type WalletStackParams = {
  Wallet: undefined;
};

//
export type SignupStackParams = {
  SignUp: undefined;
  PhoneVerify: undefined;
  AccountCreation: undefined;
};
