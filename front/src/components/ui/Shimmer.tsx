// Shimmer.tsx
export default function Shimmer({
    width = "w-full",
    height = "h-4",
    radius = "rounded-md",
}) {
    return (
        <div
            className={`relative overflow-hidden bg-light-gray ${width} ${height} ${radius}`}
        >
            <div
                className="absolute inset-y-0 -left-full w-[200%] animate-[shimmer_1.5s_linear_infinite] bg-linear-to-r from-transparent via-[var(--shimmer-highlight)] to-transparent"
            />
        </div>
    );
}
