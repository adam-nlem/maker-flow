export function CircularProgress({
  value = 70,        // 0–100
  size = 80,         // outer size in px
  color = "text-primary",
}: {
  value?: number;
  size?: number;
  color?: string;
}) {
  const stroke = size * 0.15;               
  const radius = size / 2 - stroke / 2; 
  const circumference = 2 * Math.PI * radius;
  const safe = Math.min(100, Math.max(0, value));
  const offset = circumference - (safe / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        className="text-light-gray"
        stroke="currentColor"
        fill="none"
      />

      {/* progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeLinecap="round"
        className={color}
        stroke="currentColor"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
