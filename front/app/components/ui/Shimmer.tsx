// Shimmer.tsx
export default function Shimmer({
    width = "w-full",
    height = "h-4",
    radius = "rounded-md",
}) {
    return (
        <div
            className={`relative overflow-hidden bg-gray-200 ${width} ${height} ${radius}`}
        >
            <div
                className="
          absolute inset-0 
          animate-pulse 
          bg-linear-to-r 
          from-gray-200 
          via-gray-300 
          to-gray-200
        "
            />
        </div>
    );
}
