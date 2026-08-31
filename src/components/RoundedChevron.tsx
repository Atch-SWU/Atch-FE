import Svg, { Path } from 'react-native-svg';

interface RoundedChevronProps {
    /** 화살표가 가리키는 방향 */
    direction: 'left' | 'right';
    color: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
}

// 좌우 획 끝(linecap)과 가운데 꼭짓점(linejoin)을 모두 round 처리해서
// 뾰족한 부분 없이 전부 둥글게 보이는 셰브런.
// viewBox 를 width x height 에 맞춰 그때그때 만들기 때문에 정사각형이 아니어도 비율이 안 깨진다.
export default function RoundedChevron({
    direction,
    color,
    width = 7,
    height = 12,
    strokeWidth = 2,
}: RoundedChevronProps) {
    // 획 끝이 둥글게 튀어나오는 만큼(strokeWidth 절반) 안쪽으로 여백을 둬서
    // viewBox 경계에서 잘리지 않도록 함.
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
