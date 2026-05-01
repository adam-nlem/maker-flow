import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "~/components/ui/Button"
import PrelaunchRewardTierCard from "~/components/prelaunch/PrelaunchRewardTierCard"
import { usePrelaunchStatus } from "~/hooks/api/prelaunch/usePrelaunchStatus"
import { prelaunchRewardTierOptions } from "~/models/enums/PrelaunchRewardTier"
import Shimmer from "~/components/ui/Shimmer"

interface PrelaunchDashboardProps {
  referralCode: string
}

export default function PrelaunchDashboard({ referralCode }: PrelaunchDashboardProps) {
  const { t } = useTranslation()
  const { status, isLoading } = usePrelaunchStatus()
  const [copied, setCopied] = useState(false)

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/prelaunch?ref=${referralCode}`
    : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(t("prelaunch:dashboard.twitterShareText"))
    const url = encodeURIComponent(referralLink)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  if (isLoading || !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <Shimmer width="w-3/4" height="h-8" radius="rounded-lg" />
          <Shimmer width="w-full" height="h-5" />

          <div className="rounded-xl border border-light-gray p-4 space-y-3">
            <Shimmer width="w-1/3" height="h-4" />
            <Shimmer width="w-full" height="h-10" radius="rounded-lg" />
            <div className="flex gap-3">
              <Shimmer width="w-full" height="h-10" radius="rounded-lg" />
              <Shimmer width="w-full" height="h-10" radius="rounded-lg" />
            </div>
          </div>

          <div className="rounded-xl border border-light-gray p-4 space-y-2">
            <Shimmer width="w-1/3" height="h-4" />
            <Shimmer width="w-1/4" height="h-8" />
          </div>

          <div className="space-y-3">
            <Shimmer width="w-1/4" height="h-5" />
            <Shimmer width="w-full" height="h-16" radius="rounded-xl" />
            <Shimmer width="w-full" height="h-16" radius="rounded-xl" />
            <Shimmer width="w-full" height="h-16" radius="rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-heading-2xl mb-2">{t("prelaunch:dashboard.title")}</h1>
        <p className="text-body-base mb-8">
          {t("prelaunch:dashboard.subtitle")}
        </p>

        <div className="rounded-xl border border-light-gray bg-clear p-4 mb-6">
          <p className="text-heading-xs mb-2">{t("prelaunch:dashboard.linkLabel")}</p>

          <div className="flex-1 min-w-0 rounded-lg bg-dark/5 px-3 py-2 mb-5">
            <p className="text-body-sm truncate select-text">{referralLink}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCopyLink}
              style="primary"
              width="w-full"
            >
              {copied ? t("prelaunch:dashboard.linkCopied") : t("prelaunch:dashboard.copyLink")}
            </Button>
            <Button
              onClick={handleShareTwitter}
              style="outline"
              width="w-full"
            >
              {t("prelaunch:dashboard.shareTwitter")}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-light-gray bg-clear p-4 mb-6 text-center">
          <p className="text-body-sm mb-1">{t("prelaunch:dashboard.verifiedReferrals")}</p>
          <p className="text-heading-2xl text-primary">{status.referralCount}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-heading-md mb-4 text-left">{t("prelaunch:dashboard.rewardsTitle")}</h2>
          <div className="space-y-3">
            {prelaunchRewardTierOptions.map((tier) => (
              <PrelaunchRewardTierCard
                key={tier}
                tier={tier}
                isUnlocked={status.unlockedTiers.includes(tier)}
              />
            ))}
          </div>
        </div>


      </div>
    </div>
  )
}
