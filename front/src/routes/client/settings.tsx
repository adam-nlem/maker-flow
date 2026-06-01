import SettingsPageView from "~/components/settings/SettingsPageView";
import { clientSettingsPath } from "~/routes/routePaths";

export default function ClientSettingsLayout() {
    return <SettingsPageView basePath={clientSettingsPath} />;
}
