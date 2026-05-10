import { Navigate } from "react-router-dom";
import { agencySettingsGeneralPath } from "~/routes/routePaths";

export default function AgencySettingsIndex() {
    return <Navigate to={agencySettingsGeneralPath} replace />;
}
