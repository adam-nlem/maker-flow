import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import {
    PrelaunchRewardTier,
    prelaunchRewardTierToLabel,
    prelaunchRewardTierToDescription,
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
    const label = prelaunchRewardTierToLabel[tier]
    const description = prelaunchRewardTierToDescription[tier]
    const threshold = prelaunchRewardTierToThreshold[tier]
    const textClass = isUnlocked ? prelaunchRewardTierToTextClass[tier] : ""
    const borderClass = isUnlocked ? prelaunchRewardTierToBorderClass[tier] : "border-light-gray"
    const bgClass = isUnlocked ? prelaunchRewardTierToBgClass[tier] : "bg-clear"

    return (
        <div
            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${borderClass} ${bgClass}`}
        >
            <div className="shrink-0 mt-0.5">
                {isUnlocked ? (
                    <CheckCircleIcon className={`h-6 w-6 ${prelaunchRewardTierToTextClass[tier]}`} />
                ) : (
                    <LockClosedIcon className="h-6 w-6 text-gray" />
                )}
            </div>
            <div className="flex flex-col items-start w-full">
                <div className="flex w-full items-center justify-between gap-2">
                    <h3 className={`text-heading-sm ${textClass}`}>
                        {label}
                    </h3>
                    <Pill
                        label={`${threshold} parrainages`}
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
