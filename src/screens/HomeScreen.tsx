import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AddButton from '../components/AddButton';
import TodoCard from '../components/TodoCard';
import CompletedCard from '../components/CompletedCard';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS, SPACING } from '../constants/token';
import { TODOS, COMPLETED } from '../data/mockTodos';
import { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hasTodos = TODOS.length > 0;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText variant="homeDate" color={COLORS.dateText}>5월 19일</AppText>
            <View style={styles.headlineRow}>
              <AppText variant="homeHeadline" color={COLORS.textMain}>
                {hasTodos ? '오늘 할 일이 있어요!' : '오늘 할 일이 없네요!'}
              </AppText>
              {hasTodos ? (
                <View style={styles.countBadge}>
                  <AppText variant="countBadge" color={COLORS.countBadgeText}>{TODOS.length}</AppText>
                </View>
              ) : (
                <View style={styles.checkBadge}>
                  <CheckIcon width={20} height={20} color={COLORS.onAccent} />
                </View>
              )}
            </View>
          </View>
          <AddButton onPress={() => navigation.navigate('TaskCreate')} />
        </View>

        {hasTodos && (
          <View>
            <AppText variant="sectionLabelLg" color={COLORS.sectionLabel} style={styles.todayLabel}>오늘 할 일</AppText>
            <View style={styles.list}>
              {TODOS.map((todo) => (
                <TodoCard
                  key={todo.id}
                  title={todo.title}
                  category={todo.category}
                  estimateText={todo.estimateText}
                  onPressAction={() =>
                    navigation.navigate('Timer', {
                      task: { title: todo.title, category: todo.category, estimateText: todo.estimateText },
                    })
                  }
                />
              ))}
            </View>
          </View>
        )}

        <AppText variant="sectionLabelLg" color={COLORS.sectionLabel} style={styles.completedLabel}>완료 작업</AppText>
        <View style={styles.list}>
          {COMPLETED.map((item) => (
            <CompletedCard key={item.id} date={item.date} title={item.title} badgeText={item.badgeText} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.screenH },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  headlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  countBadge: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.countBadgeBg,
  },
  checkBadge: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.checkBadgeBg,
  },
  todayLabel: { marginTop: 26 },
  completedLabel: { marginTop: 32 },
  list: { marginTop: 14, gap: SPACING.cardGap },
});
