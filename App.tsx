import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FONTS } from './src/constants/fonts';
import { RootStackParamList } from './src/navigation/types';
import MainScreen from './src/screens/MainScreen';
import TimerScreen from './src/screens/TimerScreen';
import SessionCompleteScreen from './src/screens/SessionCompleteScreen';
import TaskCreateScreen from './src/screens/TaskCreateScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts(FONTS);
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="TaskCreate" component={TaskCreateScreen} options={{ gestureEnabled: true, fullScreenGestureEnabled: true }} />
          <Stack.Screen name="Timer" component={TimerScreen} options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} options={{ animation: 'fade' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
