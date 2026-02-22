import type { Integration } from "~/models/Integration";
import InsightTile from "../InsightTile";
import { IntegrationInsightType, integrationInsightTypeToFrenchTranslation, integrationInsightTypeToIcon } from "~/models/enums/IntegrationInsightType";
import { ArrowTrendingUpIcon, DocumentTextIcon, UserIcon } from "@heroicons/react/24/solid";
import { useInsightsFilterStore } from "~/stores/insightsFilterStore";
import { useShowIntegrationDetail } from "~/hooks/api/integrationInsights/useShowIntegrationDetail";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { IntegrationPlatform } from "~/models/enums/IntegrationPlatform";
import { CalendarHeatMap } from "~/components/ui/CalendarHeatMap";
import AreaChart from "~/components/ui/AreaChart";
import { timePeriodToDays } from "~/models/enums/TimePeriod";
import { computeTotalValue, getChartDataForInsightType, getFilteredPointsForType } from "~/helpers/insightChartDataHelper";
import ListPostsTable from "../posts/ListPostsTable";



interface IntegrationPageViewProps {
  integration: Integration
}

export default function IntegrationPageView({ integration }: IntegrationPageViewProps) {
  const timePeriod = useInsightsFilterStore((state) => state.timePeriod);

  const { detail, isLoading } = useShowIntegrationDetail({
    integrationUuid: integration.uuid,
  });

  const days = timePeriodToDays[timePeriod];

  if (isLoading || !detail) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3 mt-5 flex-1 min-h-0">
      {integration.platform === IntegrationPlatform.Instagram && (
        <div className="flex flex-row items-center bg-amber-300/10 p-3 gap-3 rounded-lg border border-amber-300">
          <ExclamationTriangleIcon className="size-5 text-amber-500" strokeWidth={2} />
          <p className="text-xs text-amber-500">
            Instagram ne nous permet pas d'acceder à l'historique de vos comptes Instagram. Nous construisons cet historique en interne à partir des données disponibles.
            Donc, plus votre compte est connecté depuis longtemps, plus l'historique sera complet.
          </p>
        </div>
      )}
      {detail.isYoutubeReportPending === true && (
        <div className="flex flex-row items-center bg-blue/10 p-3 gap-3 rounded-lg border border-blue">
          <ArrowPathIcon className="size-5 text-blue animate-spin" strokeWidth={2} />
          <p className="text-xs text-blue">
            Les rapports YouTube sont en cours de génération. Ce processus peut prendre entre 24 et 48 heures après la connexion de votre compte.
            Les données d'analyse seront disponibles automatiquement une fois les rapports prêts.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-1 items-center">
            {integration.profilePictureUrl && (
              <img
                src={integration.profilePictureUrl}
                alt="profile picture"
                className="size-10 rounded-full object-cover"
              />
            )}
            <div className="flex flex-col">
              <h1 className="text-heading-sm">{integration.name}</h1>
              <p className="text-body-sm text-gray">{integration.userName}</p>
            </div>
          </div>

          <div className="flex flex-wrap wrap-break-word gap-3">
            <InsightTile
              label={integrationInsightTypeToFrenchTranslation[IntegrationInsightType.TotalFollowers]}
              value={detail.totalFollowers}
              Icon={UserIcon}
              chart={<AreaChart color="var(--color-primary)" data={getChartDataForInsightType(detail.timelines, IntegrationInsightType.TotalFollowers, days)} />}
            />
            <InsightTile
              label="Contenus"
              value={detail.postCount}
              Icon={DocumentTextIcon}
            />
            <InsightTile
              label="Momentum"
              value={detail.streak}
              Icon={ArrowTrendingUpIcon}
            />
            {detail.timelines.map((timeline) => {
              if (timeline.type !== IntegrationInsightType.TotalFollowers) {
                return <InsightTile
                  key={timeline.type}
                  label={integrationInsightTypeToFrenchTranslation[timeline.type]}
                  value={computeTotalValue(getFilteredPointsForType(detail.timelines, timeline.type, days))}
                  Icon={integrationInsightTypeToIcon[timeline.type]}
                  chart={<AreaChart color="var(--color-primary)" data={getChartDataForInsightType(detail.timelines, timeline.type, days)} />}
                />
              }
              return null;
            })
            }
          </div>
        </div>

        {/* <CalendarHeatMap totalValue={computeTotalValue(getFilteredPointsForType(detail.timelines, IntegrationInsightType.Reach, days))} data={getChartDataForInsightType(detail.timelines, IntegrationInsightType.Reach, days)} daysToDisplay={timePeriodToDays[timePeriod]} /> */}

      </div>


      <ListPostsTable integrationUuid={integration.uuid} />
    </div>
  );
}
