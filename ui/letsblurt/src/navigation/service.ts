import {CommonActions} from '@react-navigation/native';
import {NavigationContainerRef} from '@react-navigation/native';

interface Props {
  name: string;
  params?: object;
}

let _navigator: NavigationContainerRef;
let navigationStack: Props[] = [];

const setTopLevelNavigator = (navigatorRef: NavigationContainerRef) => {
  _navigator = navigatorRef;
  if (navigationStack.length > 0) {
    navigationStack.forEach((item) => navigate(item));
    navigationStack = [];
  }
};

const navigate = (navigationProps: Props) => {
  console.log('[navigate] props', navigationProps);
  if (!_navigator) {
    console.log('[navigate] navigator', _navigator);
    navigationStack.push(navigationProps);
  } else {
    console.log('[navigate] dispatching');
    _navigator.dispatch(
      CommonActions.navigate({
        name: navigationProps.name,
        params: navigationProps.params,
      }),
    );
  }
};

export {navigate, setTopLevelNavigator};
