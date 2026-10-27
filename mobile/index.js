/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Hide "open debugger to view warnings" popup from phone screen
LogBox.ignoreAllLogs();
enableScreens(false);

AppRegistry.registerComponent(appName, () => App);
