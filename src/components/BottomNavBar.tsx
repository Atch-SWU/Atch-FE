import { View, Pressable, StyleSheet } from 'react-native';
import HomeIcon from '../assets/icon/home.svg';
import HomeActiveIcon from '../assets/icon/home-active.svg';
import TodoIcon from '../assets/icon/todo.svg';
import TodoActiveIcon from '../assets/icon/todo-active.svg';
import ChartIcon from '../assets/icon/chart.svg';
import ChartActiveIcon from '../assets/icon/chart-active.svg';
import ProfileIcon from '../assets/icon/profile.svg';
import ProfileActiveIcon from '../assets/icon/profile-active.svg';
import { COLORS } from '../constants/token';

const TABS = [
  {
    key: 'home',
    Icon: HomeIcon,
    ActiveIcon: HomeActiveIcon,
  },
  {
    key: 'todo',
    Icon: TodoIcon,
    ActiveIcon: TodoActiveIcon,
  },
  {
    key: 'stats',
    Icon: ChartIcon,
    ActiveIcon: ChartActiveIcon,
  },
  {
    key: 'profile',
    Icon: ProfileIcon,
    ActiveIcon: ProfileActiveIcon,
  },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

interface BottomNavBarProps {
  active?: TabKey;
  onChange?: (key: TabKey) => void;
}

/** 플로팅 하단 네비게이션 */
export default function BottomNavBar({
  active = 'home',
  onChange,
}: BottomNavBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map(({ key, Icon, ActiveIcon }) => {
        const isActive = key === active;
        const CurrentIcon = isActive ? ActiveIcon : Icon;

        return (
          <Pressable
            key={key}
            style={styles.tab}
            onPress={() => onChange?.(key)}
          >
            <View style={styles.iconWrap}>
              <CurrentIcon width={26} height={26} />
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
    borderRadius: 40,
    backgroundColor: COLORS.gray800,
    elevation: 8,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrap: {
    width: 56,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
});