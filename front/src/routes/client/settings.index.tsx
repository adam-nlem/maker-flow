import { Navigate } from "react-router-dom";
import { clientSettingsGeneralPath } from "~/routes/routePaths";

export default function ClientSettingsIndex() {
    return <Navigate to={clientSettingsGeneralPath} replace />;
}
