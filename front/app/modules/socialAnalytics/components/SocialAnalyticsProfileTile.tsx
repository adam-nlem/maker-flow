// import type { Integration } from "~/models/Integration"
// import { useShowIntegrationProviderIcon } from "~/hooks/api/integrations/useShowIntegrationProviderIcon"
// import { socialAnalyticsInsightTypeToFrenchTranslation } from "../models/enums/SocialAnalyticsInsightType"
// import type { SocialAnalyticsInsightType } from "../models/enums/SocialAnalyticsInsightType"
// import type { SocialAnalyticsTimePeriod } from "../models/enums/SocialAnalyticsTimePeriod"
// import { socialAnalyticsTimePeriodToFrenchTranslation } from "../models/enums/SocialAnalyticsTimePeriod"
// import { useSelectLogMetric } from "../hooks/useSelectLogMetric"

// interface SocialAnalyticsProfileTileProps {
//     integration: Integration
//     metric: SocialAnalyticsInsightType
//     timePeriod: SocialAnalyticsTimePeriod
//     onClick?: () => void
// }

// function formatMetricValue(value: number): string {
//     if (value >= 1_000_000) {
//         return `${(value / 1_000_000).toFixed(1)}M`;
//     }
//     if (value >= 1_000) {
//         return `${(value / 1_000).toFixed(1)}k`;
//     }
//     return value.toString();
// }

// export default function SocialAnalyticsProfileTile({
//     integration,
//     metric,
//     timePeriod,
//     onClick,
// }: SocialAnalyticsProfileTileProps) {
//     const { iconUrl } = useShowIntegrationProviderIcon(integration.provider)
//     const { value, isLoading } = useSelectLogMetric({
//         integrationUuid: integration.uuid,
//         metric,
//         timePeriod,
//     })

//     return (
//         <div
//             className="border bg-clear border-light-gray rounded-lg p-2 flex flex-col gap-3 w-fit cursor-pointer"
//             onClick={onClick}
//         >
//             <div className="flex flex-row gap-10 justify-between">
//                 <div className="flex flex-row gap-1 items-center">
//                     {integration.profilePictureUrl && (
//                         <img
//                             src={integration.profilePictureUrl}
//                             alt={integration.displayName}
//                             className="size-10 rounded-full object-cover"
//                         />
//                     )}
//                     <div className="flex flex-col">
//                         <h1 className="text-heading-sm">{integration.name}</h1>
//                         <p className="text-body-sm text-gray">{integration.userName}</p>
//                     </div>
//                 </div>

//                 {iconUrl && (
//                     <img
//                         src={iconUrl}
//                         alt={integration.displayName}
//                         className="ml-20 size-7 rounded-md object-cover"
//                     />
//                 )}
//             </div>
//             <div className="border-t border-light-gray rounded w-full"></div>

//             <div>
//                 <h1 className="text-heading-sm">
//                     {isLoading ? '...' : value !== null ? formatMetricValue(value) : '-'}
//                 </h1>
//                 <p className="text-body-sm text-gray whitespace-nowrap">
//                     {socialAnalyticsInsightTypeToFrenchTranslation[metric]} ({socialAnalyticsTimePeriodToFrenchTranslation[timePeriod]})
//                 </p>
//             </div>
//         </div>
//     )
// }
