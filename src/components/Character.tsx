import { Image, StyleProp, ImageStyle } from 'react-native';
import Metchi from '../assets/character/metchi.png';

/** 원본(피그마 export) 비율 768 x 642 */
const RATIO = 642 / 768;

interface CharacterProps {
  /** 가로 크기 (세로는 원본 비율로 자동) */
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** 멧치 캐릭터 (피그마 image 38 export) */
export default function Character({ size = 160, style }: CharacterProps) {
  return <Image source={Metchi} style={[{ width: size, height: size * RATIO }, style]} resizeMode="contain" />;
}
