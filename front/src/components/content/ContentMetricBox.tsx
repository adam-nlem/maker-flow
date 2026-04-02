export default function ContentMetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 flex-1 border border-light-gray min-w-30 max-h-fit rounded-lg bg-light-gray/30 p-2">
            <span className="text-body-xs text-gray">{label}</span>
            <span className="text-heading-sm">{value}</span>
        </div>
    )
}