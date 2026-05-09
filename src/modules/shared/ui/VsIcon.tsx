// src/modules/shared/ui/VsIcon.tsx - SVG иконка VS для карточек матчей
interface VsIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function VsIcon({
  className = 'w-12 h-14 md:w-16 md:h-20',
  width = 120,
  height = 140,
}: VsIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 140"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Диагональная линия */}
      <line
        x1="40"
        y1="130"
        x2="85"
        y2="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Буква V — курсив, жирный */}
      <text
        x="15"
        y="95"
        fontFamily="'Inter Tight', 'Arial Black', sans-serif"
        fontSize="55"
        fontStyle="italic"
        fontWeight="900"
        fill="currentColor"
        letterSpacing="-3"
      >
        V
      </text>
      {/* Буква S — курсив, жирный */}
      <text
        x="50"
        y="105"
        fontFamily="'Inter Tight', 'Arial Black', sans-serif"
        fontSize="55"
        fontStyle="italic"
        fontWeight="900"
        fill="currentColor"
        letterSpacing="-3"
      >
        S
      </text>
    </svg>
  );
}
