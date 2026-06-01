import { useRef } from "react"

interface OtpDigitsInputProps {
    value: string
    onChange: (next: string) => void
    length?: number
    error?: boolean
    autoFocus?: boolean
}

export default function OtpDigitsInput({
    value,
    onChange,
    length = 6,
    error = false,
    autoFocus = true,
}: OtpDigitsInputProps) {
    const refs = useRef<(HTMLInputElement | null)[]>([])

    const focusBox = (index: number) => {
        const clamped = Math.max(0, Math.min(length - 1, index))
        refs.current[clamped]?.focus()
        refs.current[clamped]?.select()
    }

    const handleChange = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, "").slice(-1)
        if (!digit) return

        const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, length)
        onChange(next)
        if (index < length - 1) {
            focusBox(index + 1)
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault()
            if (value[index]) {
                onChange(value.slice(0, index) + value.slice(index + 1))
            } else if (index > 0) {
                onChange(value.slice(0, index - 1) + value.slice(index))
                focusBox(index - 1)
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            focusBox(index - 1)
        } else if (e.key === "ArrowRight") {
            e.preventDefault()
            focusBox(index + 1)
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
        if (!pasted) return
        onChange(pasted)
        focusBox(Math.min(pasted.length, length - 1))
    }

    const focusRing = error
        ? "focus:border-danger focus:ring-danger/30"
        : "focus:border-primary focus:ring-primary/30"
    const borderColor = error ? "border-danger" : "border-pale-gray-2"

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }, (_, i) => {
                const digit = value[i] ?? ""
                return (
                    <input
                        key={i}
                        ref={(el) => { refs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        autoFocus={autoFocus && i === 0}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        className={`size-12 rounded-lg border ${borderColor} bg-clear text-center text-heading-xl font-medium text-dark outline-none transition-colors focus:ring-2 ${focusRing}`}
                    />
                )
            })}
        </div>
    )
}
