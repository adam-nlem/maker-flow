export default function AiTypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="px-2 py-2.5 rounded-xl bg-light-gray/30 border border-light-gray inline-flex flex-row gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="size-2 rounded-full bg-gray animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}
