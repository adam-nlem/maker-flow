import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import {
    PrelaunchRewardTier,
    prelaunchRewardTierLabelKeys,
    prelaunchRewardTierDescriptionKeys,
    prelaunchRewardTierToThreshold,
    prelaunchRewardTierToBgClass,
    prelaunchRewardTierToTextClass,
    prelaunchRewardTierToBorderClass,
} from "~/models/enums/PrelaunchRewardTier"
import Pill from "../ui/Pill"

interface PrelaunchRewardTierCardProps {
    tier: PrelaunchRewardTier
    isUnlocked: boolean
}

export default function PrelaunchRewardTierCard({ tier, isUnlocked }: PrelaunchRewardTierCardProps) {
    const { t } = useTranslation()
    const label = t(prelaunchRewardTierLabelKeys[tier])
    const description = t(prelaunchRewardTierDescriptionKeys[tier])
    const threshold = prelaunchRewardTierToThreshold[tier]
    const textClass = isUnlocked ? prelaunchRewardTierToTextClass[tier] : ""
    const borderClass = isUnlocked ? prelaunchRewardTierToBorderClass[tier] : "border-pale-gray"
    const bgClass = isUnlocked ? prelaunchRewardTierToBgClass[tier] : "bg-clear"

    return (
        <div
            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${borderClass} ${bgClass}`}
        >
            <div className="shrink-0 mt-0.5">
                {isUnlocked ? (
                    <CheckCircleIcon className={`h-6 w-6 ${prelaunchRewardTierToTextClass[tier]}`} />
                ) : (
                    <LockClosedIcon className="h-6 w-6 text-muted-2" />
                )}
            </div>
            <div className="flex flex-col items-start w-full">
                <div className="flex w-full items-center justify-between gap-2">
                    <h3 className={`text-heading-sm ${textClass}`}>
                        {label}
                    </h3>
                    <Pill
                        label={t("prelaunch:rewards.tierThreshold", { count: threshold })}
                        bgColorClassName={prelaunchRewardTierToBgClass[tier]}
                        borderColorClassName={prelaunchRewardTierToBorderClass[tier]}
                        textColorClassName={prelaunchRewardTierToTextClass[tier]}
                        isSelected
                    />

                </div>
                <p className="text-body-sm mt-1">{description}</p>
            </div>
        </div>
    )
}
