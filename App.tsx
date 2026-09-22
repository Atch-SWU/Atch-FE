import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform } from 'react-native';

import { FONTS } from './src/constants/fonts';
import { MAX_APP_WIDTH } from './src/constants/token';
import { RootStackParamList } from './src/navigation/types';
import MainScreen from './src/screens/MainScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SignUpCompleteScreen from './src/screens/SignUpCompleteScreen';
import FindPasswordScreen from './src/screens/FindPasswordScreen';
import TimerScreen from './src/screens/TimerScreen';
import SessionCompleteScreen from './src/screens/SessionCompleteScreen';
import TaskCreateScreen from './src/screens/TaskCreateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileManageScreen from './src/screens/ProfileManageScreen';
import MyInfoScreen from './src/screens/MyInfoScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import PushSettingsScreen from './src/screens/PushSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// TODO: 실제 로그인/인증 연동 전까지 쓰는 임시 값.
const IS_LOGGED_IN = false;

export default function App() {
  const [fontsLoaded] = useFonts(FONTS);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <View style={styles.webBackground}>
        <View style={styles.mobileContainer}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName={IS_LOGGED_IN ? 'Main' : 'Onboarding'}
            >
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
              />

              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />

              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
              />

              <Stack.Screen
                name="SignUpComplete"
                component={SignUpCompleteScreen}
              />

              <Stack.Screen
                name="FindPassword"
                component={FindPasswordScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="Main"
                component={MainScreen}
              />

              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="ProfileManage"
                component={ProfileManageScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="MyInfo"
                component={MyInfoScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="AppSettings"
                component={AppSettingsScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="PushSettings"
                component={PushSettingsScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="TaskCreate"
                component={TaskCreateScreen}
                options={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />

              <Stack.Screen
                name="Timer"
                component={TimerScreen}
                options={{
                  animation: 'slide_from_bottom',
                }}
              />

              <Stack.Screen
                name="SessionComplete"
                component={SessionCompleteScreen}
                options={{
                  animation: 'fade',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webBackground: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },

  mobileContainer: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_APP_WIDTH,
    backgroundColor: '#FFFFFF',

    // 웹 브라우저에서만 모바일 화면처럼 보이게 하기 위한 설정
    ...(Platform.OS === 'web'
      ? {
          minHeight: '100%',
        }
      : {}),
  },
});