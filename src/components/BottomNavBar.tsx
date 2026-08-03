import { View, Pressable, StyleSheet } from 'react-native';
import HomeIcon from '../assets/icon/home.svg';
import TodoIcon from '../assets/icon/todo.svg';
import ChartIcon from '../assets/icon/chart.svg';
import ProfileIcon from '../assets/icon/profile.svg';
import { COLORS } from '../constants/token';

const TABS = [
  { key: 'home', Icon: HomeIcon },
  { key: 'todo', Icon: TodoIcon },
  { key: 'stats', Icon: ChartIcon },
  { key: 'profile', Icon: ProfileIcon },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

interface BottomNavBarProps {
  active?: TabKey;
  onChange?: (key: TabKey) => void;
}

/** 플로팅 하단 네비게이션 */
export default function BottomNavBar({ active = 'home', onChange }: BottomNavBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map(({ key, Icon }) => {
        const isActive = key === active;
        return (
          <Pressable key={key} style={styles.tab} onPress={() => onChange?.(key)}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon
                width={26}
                height={26}
                color={isActive ? COLORS.navIconActive : COLORS.navIconInactive}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    paddingHorizontal: 10,
    borderRadius: 46.5,
    backgroundColor: COLORS.navBarBg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 56,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  iconWrapActive: { backgroundColor: COLORS.navActiveBg },
});
