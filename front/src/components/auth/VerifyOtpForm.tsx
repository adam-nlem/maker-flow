import { useEffect, useRef, useState } from "react"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useVerifyOtp } from "~/hooks/api/users/useVerifyOtp"
import { useResendOtp } from "~/hooks/api/users/useResendOtp"
import type { OtpType } from "~/models/enums/OtpType"
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions"

interface VerifyOtpFormProps {
    pendingOtpToken: string
    type: OtpType
    onVerified?: () => void
    formSpacing?: string
}

export default function VerifyOtpForm({ pendingOtpToken: initialToken, type, onVerified, formSpacing = "space-y-4" }: VerifyOtpFormProps) {
    const [code, setCode] = useState("")
    const [pendingOtpToken, setPendingOtpToken] = useState(initialToken)
    const [error, setError] = useState<string | null>(null)
    const [resendCooldown, setResendCooldown] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const { verifyOtp, isPending: isVerifying } = useVerifyOtp()
    const { resendOtp, isPending: isResending } = useResendOtp()

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        if (resendCooldown <= 0) return

        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [resendCooldown])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (code.length !== 6) {
            setError("Veuillez entrer un code à 6 chiffres.")
            return
        }

        try {
            await verifyOtp({ pendingOtpToken, code, purpose: type })
            onVerified?.()
        } catch (err) {
            if (err instanceof CustomHttpException) {
                const message = err.data?.message ?? err.errorMessage
                setError(message)
            }
            setCode("")
        }
    }

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending) return
        setError(null)

        try {
            const response = await resendOtp({ pendingOtpToken })
            setPendingOtpToken(response.pendingOtpToken)
            setResendCooldown(60)
            setCode("")
        } catch (err) {
            if (err instanceof CustomHttpException) {
                const message = err.data?.message ?? err.errorMessage
                setError(message)
            }
        }
    }

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6)
        setCode(value)
    }

    const isResendDisabled = resendCooldown > 0 || isResending

    return (
        <>
            {error && (
                <div className="mb-4 rounded-md bg-danger/10 p-4">
                    <div className="text-body-sm text-danger">{error}</div>
                </div>
            )}

            <form className={formSpacing} onSubmit={handleSubmit}>
                <Input
                    ref={inputRef}
                    label="Code de vérification"
                    id="otp-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                />

                <Button
                    type="submit"
                    style="primary"
                    isLoading={isVerifying}
                    disabled={isVerifying || code.length !== 6}
                >
                    Vérifier
                </Button>
            </form>

            <div className="mt-6 flex justify-center">
                <SimpleTextButton
                    onClick={handleResend}
                    color={isResendDisabled ? "text-gray" : "text-primary"}
                    hoverColor={isResendDisabled ? "hover:text-gray" : "hover:text-dark"}
                >
                    {resendCooldown > 0
                        ? `Renvoyer le code (${resendCooldown}s)`
                        : "Renvoyer le code"
                    }
                </SimpleTextButton>
            </div>
        </>
    )
}
