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
                className="absolute inset-y-0 -left-full w-[200%] animate-[shimmer_1.5s_linear_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent"
            />
        </div>
    );
}
