import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { WindowMessageType } from "~/models/enums/WindowMessageType";
import { OAuthCallbackReponseDTO } from "~/models/dtos/OAuthCallbackReponseDTO";

// After the Integration OAuth Connection, the API redirects to this URL
export default function IntegrationsCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const payload = OAuthCallbackReponseDTO.fromSearchParams(searchParams);

        const message = {
            type: WindowMessageType.OAuthCallback,
            payload,
        };

        // We send a message in the Javascript Channel Messaging API
        // and the useOAuthMessageListener will handle it properly
        if (window.opener) {
            window.opener.postMessage(message, window.location.origin);
            // Close the popup
            window.close();
            return;
        }

        navigate("/");
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center">
            <p className="text-body-md text-secondary">Finalisation de la connexion...</p>
        </div>
    );
}
