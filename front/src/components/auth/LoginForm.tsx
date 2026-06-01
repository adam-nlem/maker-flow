import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowRightIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useLogin } from "~/hooks/api/users/useLogin"
import { OtpType } from "~/models/enums/OtpType"
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore"

interface LoginFormProps {
  onLoginSuccess: () => void
  onOtpRequired: (data: { pendingOtpToken: string; otpType: OtpType; email: string }) => void
  onForgotPassword?: () => void
  initialEmail?: string
}

export default function LoginForm({ onLoginSuccess, onOtpRequired, onForgotPassword, initialEmail = "" }: LoginFormProps) {
  const { t } = useTranslation()
  const setStoredEmail = useAuthPrefillStore((s) => s.setEmail)

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")

  const { login, isPending } = useLogin()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setStoredEmail(email)
    const response = await login({ email, password })

    if (response.requiresOtp) {
      onOtpRequired({
        pendingOtpToken: response.pendingOtpToken,
        otpType: OtpType.Login,
        email,
      })
    } else if (response.requiresEmailVerification) {
      onOtpRequired({
        pendingOtpToken: response.pendingOtpToken,
        otpType: OtpType.EmailVerification,
        email: response.email ?? email,
      })
    } else {
      onLoginSuccess()
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label={t("auth:fields.email")}
        id="email"
        name="email"
        type="email"
        className="size-12"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<EnvelopeIcon className="size-4 text-muted-2" />}
      />

      <Input
        label={t("auth:fields.password")}
        labelRight={onForgotPassword && (
          <SimpleTextButton onClick={onForgotPassword} color="text-muted" hoverColor="hover:text-dark">
            <span className="text-body-xs">{t("auth:login.forgotPassword")}</span>
          </SimpleTextButton>
        )}
        id="password"
        name="password"
        type="password"
        className="size-12"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<LockClosedIcon className="size-4 text-muted-2" />}
      />

      <Button
        type="submit"
        style="primary"
        width="w-full"
        height="h-11"
        isLoading={isPending}
        disabled={isPending}
      >
        <span>{t("auth:login.submit")}</span>
        <ArrowRightIcon className="size-4" />
      </Button>
    </form>
  )
}
