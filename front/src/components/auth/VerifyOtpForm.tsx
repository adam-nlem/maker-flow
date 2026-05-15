import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowRightIcon, ClockIcon, EnvelopeIcon } from "@heroicons/react/24/outline"

import { Button } from "~/components/ui/Button"
import OtpDigitsInput from "~/components/ui/OtpDigitsInput"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useVerifyOtp } from "~/hooks/api/users/useVerifyOtp"
import { useResendOtp } from "~/hooks/api/users/useResendOtp"
import type { OtpType } from "~/models/enums/OtpType"
import { HttpException } from "~/services/httpClient/HttpException"
import { resolveErrorMessage } from "~/services/apiErrorHandler/errorCodeMessages"

interface VerifyOtpFormProps {
    pendingOtpToken: string
    type: OtpType
    email: string
    onVerified?: () => void
}

export default function VerifyOtpForm({ pendingOtpToken: initialToken, type, email, onVerified }: VerifyOtpFormProps) {
    const { t } = useTranslation()
    const [code, setCode] = useState("")
    const [pendingOtpToken, setPendingOtpToken] = useState(initialToken)
    const [error, setError] = useState<string | null>(null)
    const [resendCooldown, setResendCooldown] = useState(0)

    const { verifyOtp, isPending: isVerifying } = useVerifyOtp()
    const { resendOtp, isPending: isResending } = useResendOtp()

    useEffect(() => {
        if (resendCooldown <= 0) return

        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [resendCooldown])

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError(null)

        if (code.length !== 6) {
            setError(t("auth:validation.otpDigitsRequired"))
            return
        }

        try {
            await verifyOtp({ pendingOtpToken, code, type })
            onVerified?.()
        } catch (err) {
            if (err instanceof HttpException) {
                setError(resolveErrorMessage(err))
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
            if (err instanceof HttpException) {
                setError(resolveErrorMessage(err))
            }
        }
    }

    const isResendDisabled = resendCooldown > 0 || isResending
    const formatted = resendCooldown > 0
        ? `0:${resendCooldown.toString().padStart(2, "0")}`
        : null

    return (
        <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-pale-gray-2 bg-clear-2 px-3 py-1.5 text-body-xs text-muted">
                <EnvelopeIcon className="size-3.5 text-primary" />
                <span>{t("auth:verify.codeSentTo")}</span>
                <span className="text-dark font-medium">{email}</span>
            </div>

            {error && (
                <div className="rounded-md bg-danger/10 p-3">
                    <p className="text-body-sm text-danger">{error}</p>
                </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <OtpDigitsInput value={code} onChange={setCode} error={Boolean(error)} />

                <Button
                    type="submit"
                    style="primary"
                    width="w-full"
                    height="h-11"
                    isLoading={isVerifying}
                    disabled={isVerifying || code.length !== 6}
                >
                    <span>{t("auth:verify.submit")}</span>
                    <ArrowRightIcon className="size-4" />
                </Button>
            </form>

            <div className="flex justify-center items-center gap-1.5 text-body-xs text-muted">
                {formatted ? (
                    <>
                        <ClockIcon className="size-3.5" />
                        <span>{t("auth:verify.resendCountdown", { time: formatted })}</span>
                    </>
                ) : (
                    <SimpleTextButton
                        onClick={handleResend}
                        color={isResendDisabled ? "text-muted-2" : "text-dark"}
                        hoverColor={isResendDisabled ? "hover:text-muted-2" : "hover:text-primary"}
                    >
                        <span className="underline underline-offset-2">{t("auth:verify.resend")}</span>
                    </SimpleTextButton>
                )}
            </div>
        </div>
    )
}
