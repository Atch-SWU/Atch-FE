import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FONTS } from './src/constants/fonts';
import { RootStackParamList } from './src/navigation/types';
import MainScreen from './src/screens/MainScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TimerScreen from './src/screens/TimerScreen';
import SessionCompleteScreen from './src/screens/SessionCompleteScreen';
import TaskCreateScreen from './src/screens/TaskCreateScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// TODO: 실제 로그인/인증 연동 전까지 쓰는 임시 값.
// 로그인 상태를 들고 있는 로직이 붙으면 이 상수 대신 그 값을 사용하도록 교체.
// true 면 온보딩을 건너뛰고 바로 홈(Main)으로 진입.
const IS_LOGGED_IN = false;

export default function App() {
  const [fontsLoaded] = useFonts(FONTS);
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={IS_LOGGED_IN ? 'Main' : 'Onboarding'}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="TaskCreate" component={TaskCreateScreen} options={{ gestureEnabled: true, fullScreenGestureEnabled: true }} />
          <Stack.Screen name="Timer" component={TimerScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} options={{ animation: 'fade' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
