import { Navigate } from "react-router-dom";
import { settingsGeneralPath } from "~/routes/routePaths";

export default function SettingsIndex() {
    return <Navigate to={settingsGeneralPath} replace />;
}
