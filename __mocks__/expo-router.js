const React = require('react');
const { Pressable } = require('react-native');

module.exports = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children, onPress, testID, ...props }) =>
    React.createElement(Pressable, {
      ...props,
      testID: testID || 'expo-router-link',
      onPress: (e) => {
        const event = e || {};
        event.preventDefault = event.preventDefault || jest.fn();
        if (onPress) onPress(event);
      },
    }, children),
  Stack: {
    Screen: ({ children }) => children || null,
  },
};
