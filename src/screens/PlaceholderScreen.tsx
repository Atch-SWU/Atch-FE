import { View, StyleSheet } from 'react-native';
import AppText from '../components/AppText';
import { COLORS } from '../constants/token';

interface PlaceholderScreenProps {
  label: string;
}

export default function PlaceholderScreen({ label }: PlaceholderScreenProps) {
  return (
    <View style={styles.root}>
      <AppText variant="titleCore" color={COLORS.textSub}>{label} 준비 중</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
});
