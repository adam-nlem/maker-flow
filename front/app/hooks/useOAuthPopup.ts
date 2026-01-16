import { useCallback, useEffect, useRef, useState } from "react";
import { OAuthErrorCode } from "~/models/enums/OAuthErrorCode";
import { IntegrationProvider } from "~/models/enums/IntegrationProvider";
import { useOAuthMessageListener } from "~/hooks/useOAuthMessageListener";

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_CHECK_INTERVAL_MS = 500;

interface UseOAuthPopupProps {
    provider: IntegrationProvider;
    onSuccess?: () => void;
}

/**
 * Utility hook to manage OAuth popup window and listen for callback messages
 *
 * @param provider - The integration provider (e.g., Instagram)
 * @returns Object with openPopup function, isOpen state, integrationUuid, oauthError, and reset function
 */
export function useOAuthPopup({ provider, onSuccess }: UseOAuthPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popupError, setPopupError] = useState<OAuthErrorCode | null>(null);
    const popupRef = useRef<Window | null>(null);

    const {
        integrationUuid,
        oauthError: messageError,
        reset: resetMessageListener,
    } = useOAuthMessageListener({ provider });

    useEffect(() => {
        if (integrationUuid || messageError) {
            setIsOpen(false);
            popupRef.current = null;
        }
    }, [integrationUuid, messageError]);

    useEffect(() => {
        if (integrationUuid && onSuccess) {
            onSuccess();
        }
    }, [integrationUuid, onSuccess]);

    const openPopup = useCallback((url: string) => {
        if (isOpen) return;

        setIsOpen(true);
        setPopupError(null);
        resetMessageListener();

        const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
        const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

        popupRef.current = window.open(
            url,
            `${provider}_oauth`,
            `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},popup=yes`
        );

        if (!popupRef.current) {
            setIsOpen(false);
            setPopupError(OAuthErrorCode.PopupBlocked);
            return;
        }

        const checkPopupClosed = setInterval(() => {
            if (popupRef.current?.closed) {
                clearInterval(checkPopupClosed);
                setIsOpen(false);
                popupRef.current = null;
            }
        }, POPUP_CHECK_INTERVAL_MS);
    }, [isOpen, provider, resetMessageListener]);

    const reset = useCallback(() => {
        setPopupError(null);
        resetMessageListener();
    }, [resetMessageListener]);

    return {
        openPopup,
        isOpen,
        integrationUuid,
        oauthError: popupError ?? messageError,
        reset,
    };
}
