import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/token';

interface CharacterProps {
  size?: number;
}

/**
 * 멧취 캐릭터 자리표시자.
 * TODO: 실제 멧취 PNG 확보 시 아래 View 를 <Image source={...} /> 로 교체하면 끝.
 *   예) import Metchi from '../assets/character/metchi.png';
 *       return <Image source={Metchi} style={{ width: size, height: size }} resizeMode="contain" />;
 */
export default function Character({ size = 160 }: CharacterProps) {
  return <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.grey200,
    borderWidth: 1,
    borderColor: COLORS.grey300,
  },
});
