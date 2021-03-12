import React, {Component} from 'react';
import {
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {LogBox} from 'react-native';

const {height, width} = Dimensions.get('screen');

interface Props {
  duration: number;
  onHide: () => void;
  text: string;
}

interface State {
  animatedValue: Animated.Value;
}
class Toast extends Component<Props, State> {
  closeTimer: ReturnType<typeof setTimeout>;
  constructor(props: Props) {
    super(props);
    this.state = {
      animatedValue: new Animated.Value(0),
    };
  }

  // Component Functions
  _showToast() {
    const {duration} = this.props;
    const animatedValue = new Animated.Value(0);

    this.setState({animatedValue});

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    if (duration) {
      this.closeTimer = setTimeout(() => {
        this._hideToast();
      }, duration);
    }
  }

  _hideToast() {
    const {animatedValue} = this.state;
    const {onHide} = this.props;

    Animated.timing(animatedValue, {
      toValue: 0.0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      if (onHide) {
        onHide();
      }
    });

    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  // Component Life Cycles
  UNSAFE_componentWillMount() {
    this._showToast();
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
  }

  render() {
    const {text} = this.props;
    const {animatedValue} = this.state;
    const outputRange = [50, 0];
    const y = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange,
    });
    const position = {bottom: 150};

    return (
      <TouchableOpacity disabled={true}>
        <Animated.View
          style={{
            ...styles.container,
            ...position,
            opacity: animatedValue,
            transform: [{translateY: y}],
          }}>
          <Text style={styles.text}>{text}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

export {Toast};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: width,
    minWidth: width / 1.9,
    height: 44,
    borderRadius: 30,
    backgroundColor: '#788187',
    margin: 5,
    shadowOffset: {
      height: 5,
      width: 0,
    },
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    elevation: 3,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
  },
});
