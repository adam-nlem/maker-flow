import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useResendOtp } from "~/hooks/api/users/useResendOtp"
import { useVerifyOtp } from "~/hooks/api/users/useVerifyOtp"
import { OtpType, otpTypeToFrenchTranslation } from "~/models/enums/OtpType"
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions"

interface VerifyOtpState {
    pendingOtpToken: string
    purpose: OtpType
    email: string
}

export default function VerifyOtpPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const state = location.state as VerifyOtpState | null

    const [code, setCode] = useState("")
    const [pendingOtpToken, setPendingOtpToken] = useState(state?.pendingOtpToken ?? "")
    const [error, setError] = useState<string | null>(null)
    const [resendCooldown, setResendCooldown] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const { verifyOtp, isPending: isVerifying } = useVerifyOtp()
    const { resendOtp, isPending: isResending } = useResendOtp()

    useEffect(() => {
        if (!state) {
            navigate("/login", { replace: true })
        }
    }, [state, navigate])

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

    if (!state) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (code.length !== 6) {
            setError("Veuillez entrer un code à 6 chiffres.")
            return
        }

        try {
            await verifyOtp({
                pendingOtpToken,
                code,
                purpose: state.purpose,
            })
            navigate("/")
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

    const title = otpTypeToFrenchTranslation[state.purpose]

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-dark">
                    {title}
                </h2>
                <p className="mt-2 text-center text-body-sm text-medium-gray">
                    Un code à 6 chiffres a été envoyé à{" "}
                    <span className="font-semibold text-dark">{state.email}</span>
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {error && (
                    <div className="mb-4 rounded-md bg-danger/10 p-4">
                        <div className="flex">
                            <div className="text-body-sm text-danger">{error}</div>
                        </div>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                        fullWidth
                    />

                    <div>
                        <Button
                            type="submit"
                            style="primary"
                            isLoading={isVerifying}
                            disabled={isVerifying || code.length !== 6}
                        >
                            Vérifier
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isResending}
                        className="text-body-sm font-semibold text-primary disabled:text-medium-gray disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0
                            ? `Renvoyer le code (${resendCooldown}s)`
                            : "Renvoyer le code"
                        }
                    </button>
                </div>

                <p className="mt-10 text-center text-body-sm">
                    <Link to="/login" className="font-semibold leading-6 text-primary">
                        Retour à la connexion
                    </Link>
                </p>
            </div>
        </div>
    )
}
