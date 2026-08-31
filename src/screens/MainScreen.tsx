import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNavBar, { TabKey } from '../components/BottomNavBar';
import HomeScreen from './HomeScreen';
import ToDoListScreen from './ToDoListScreen';
import PlaceholderScreen from './PlaceholderScreen';
import ReportScreen from './ReportScreen';

/** 하단 탭(홈/투두/통계/프로필)을 즉시 전환하는 컨테이너 + 플로팅 네비 */
export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('home');

  return (
    <View style={styles.root}>
      <View style={styles.scene}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'todo' && <ToDoListScreen />}
        {tab === 'stats' && <ReportScreen />}
        {tab === 'profile' && <PlaceholderScreen label="프로필" />}
      </View>
      <View style={[styles.navWrap, { bottom: insets.bottom + 8 }]}>
        <BottomNavBar active={tab} onChange={setTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scene: { flex: 1 },
  navWrap: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 40, alignItems: 'stretch' },
});
