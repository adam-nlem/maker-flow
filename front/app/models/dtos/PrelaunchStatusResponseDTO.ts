import type { PrelaunchRewardTier } from "~/models/enums/PrelaunchRewardTier"

interface PrelaunchStatusResponseJSON {
    email: string
    referralCode: string
    referralCount: number
    unlockedTiers: PrelaunchRewardTier[]
    nextTier: PrelaunchRewardTier | null
    referralsNeeded: number | null
}

export class PrelaunchStatusResponseDTO {
    constructor(
        public readonly email: string,
        public readonly referralCode: string,
        public readonly referralCount: number,
        public readonly unlockedTiers: PrelaunchRewardTier[],
        public readonly nextTier: PrelaunchRewardTier | null,
        public readonly referralsNeeded: number | null,
    ) {}

    static fromJSON(json: PrelaunchStatusResponseJSON): PrelaunchStatusResponseDTO {
        return new PrelaunchStatusResponseDTO(
            json.email,
            json.referralCode,
            json.referralCount,
            json.unlockedTiers,
            json.nextTier,
            json.referralsNeeded,
        )
    }
}
