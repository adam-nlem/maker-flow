export default function ContentMetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 flex-1 border border-pale-gray min-w-30 max-h-fit rounded-lg bg-pale-gray-2/30 p-2">
            <span className="text-body-xs text-muted-2">{label}</span>
            <span className="text-heading-sm">{value}</span>
        </div>
    )
}