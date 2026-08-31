import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Defs, Filter, FeDropShadow } from 'react-native-svg';

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
  const { width: screenWidth } = useWindowDimensions();
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

  const bubbleWidth = textSize.width + H_PADDING * 2;
  const bubbleHeight = textSize.height + V_PADDING * 2;

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
            width: textSize.width, 
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