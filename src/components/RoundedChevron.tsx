import Svg, { Path } from 'react-native-svg';

interface RoundedChevronProps {
    /** 화살표가 가리키는 방향 */
    direction: 'left' | 'right';
    color: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
}

export default function RoundedChevron({
    direction,
    color,
    width = 7,
    height = 12,
    strokeWidth = 2,
}: RoundedChevronProps) {

    const margin = strokeWidth / 2;
    const midY = height / 2;

    const d =
        direction === 'left'
            ? `M${width - margin} ${margin} L${margin} ${midY} L${width - margin} ${height - margin}`
            : `M${margin} ${margin} L${width - margin} ${midY} L${margin} ${height - margin}`;

    return (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
            <Path
                d={d}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}
