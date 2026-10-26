import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import useAppDimensions from '../hooks/useAppDimensions';
import { COLORS } from '../constants/token';

const RADIUS = 10;
const TAIL_WIDTH = 20;
const TAIL_HEIGHT = 10;
const H_PADDING = 16;
const V_PADDING = 10;
const SHADOW_MARGIN = 0;

interface MessageBubbleProps {
  children: React.ReactNode;
  textStyle?: any;
}

export default function MessageBubble({ children, textStyle }: MessageBubbleProps) {
  const [textSize, setTextSize] = useState<{ width: number; height: number } | null>(null);
  const { width: screenWidth } = useAppDimensions();
  const maxBubbleWidth = screenWidth - 32;
  const maxTextWidth = maxBubbleWidth - H_PADDING * 2;

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
            fontFamily: 'SUIT-Bold',
            fontSize: 13,
            fontWeight: '600',
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
        <Path d={path} fill="#FFFFFF" />
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
    fontFamily: 'SUIT-Bold',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    letterSpacing: -0.2,
    color: COLORS.gray700,
  },
});