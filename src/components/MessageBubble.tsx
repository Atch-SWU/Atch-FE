import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Defs, Filter, FeDropShadow } from 'react-native-svg';
import useAppDimensions from '../hooks/useAppDimensions';

const RADIUS = 10;
const TAIL_WIDTH = 20;
const TAIL_HEIGHT = 10;
const H_PADDING = 16;
const V_PADDING = 10;
const SHADOW_MARGIN = 12;

interface MessageBubbleProps {
  children: React.ReactNode;
  textStyle?: any;
}

export default function MessageBubble({ children, textStyle }: MessageBubbleProps) {
  const [textSize, setTextSize] = useState<{ width: number; height: number } | null>(null);
  const { width: screenWidth } = useAppDimensions();
  const maxBubbleWidth = screenWidth - 32;
  const maxTextWidth = maxBubbleWidth - H_PADDING * 2;

  // ⬇️ children이 바뀌면 다시 측정 단계로
  useEffect(() => {
    setTextSize(null);
  }, [children]);

  const handleTextLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setTextSize({ width, height });
  };

  if (!textSize) {
    return (
      <Text
        style={[
          styles.hiddenMeasure,
          {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: 12,
            lineHeight: 17,
            letterSpacing: -0.2, 
            maxWidth: maxTextWidth, 
          },
          textStyle,
        ]}
        onLayout={handleTextLayout}
      >
        {children}
      </Text>
    );
  }

  // onLayout으로 측정한 값이 실제 텍스트 렌더링 폭보다 아주 살짝(1px 미만) 작게
  // 반올림되는 경우가 있어서, 그 측정값을 그대로 텍스트 width로 다시 지정하면
  // 웹에서만 마지막 글자가 다음 줄로 밀려나면서 말풍선 배경 밖으로 튀어나오는
  // 버그가 있었음 — 올림 처리 + 여유 픽셀을 더해 항상 한 줄에 들어가도록 보정.
  const MEASURE_SAFETY_PADDING = 2;
  const measuredTextWidth = Math.ceil(textSize.width) + MEASURE_SAFETY_PADDING;
  const measuredTextHeight = Math.ceil(textSize.height);

  const bubbleWidth = measuredTextWidth + H_PADDING * 2;
  const bubbleHeight = measuredTextHeight + V_PADDING * 2;

  const svgWidth = bubbleWidth + SHADOW_MARGIN * 2;
  const svgHeight = bubbleHeight + TAIL_HEIGHT + SHADOW_MARGIN * 2;

  const bodyTop = TAIL_HEIGHT + SHADOW_MARGIN;
  const left = SHADOW_MARGIN;
  const right = left + bubbleWidth;
  const bottom = bodyTop + bubbleHeight;
  const tailCenterX = left + bubbleWidth / 2;

  const path = `
    M ${left + RADIUS} ${bodyTop}
    L ${tailCenterX - TAIL_WIDTH / 2} ${bodyTop}
    L ${tailCenterX} ${bodyTop - TAIL_HEIGHT}
    L ${tailCenterX + TAIL_WIDTH / 2} ${bodyTop}
    L ${right - RADIUS} ${bodyTop}
    Q ${right} ${bodyTop} ${right} ${bodyTop + RADIUS}
    L ${right} ${bottom - RADIUS}
    Q ${right} ${bottom} ${right - RADIUS} ${bottom}
    L ${left + RADIUS} ${bottom}
    Q ${left} ${bottom} ${left} ${bottom - RADIUS}
    L ${left} ${bodyTop + RADIUS}
    Q ${left} ${bodyTop} ${left + RADIUS} ${bodyTop}
    Z
  `;

  return (
    <View style={{ width: svgWidth, height: svgHeight }}>
      <Svg width={svgWidth} height={svgHeight}>
        <Defs>
          <Filter id="bubbleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <FeDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.12" />
          </Filter>
        </Defs>
        <Path d={path} fill="#FFFFFF" filter="url(#bubbleShadow)" />
      </Svg>

      <Text
        style={[
          styles.messageText,
          textStyle,
          {
            position: 'absolute',
            top: bodyTop + V_PADDING,
            left: left + H_PADDING,
            width: measuredTextWidth,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenMeasure: {
    position: 'absolute',
    opacity: 0,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: -0.2,
    color: '#303030',
  },
});