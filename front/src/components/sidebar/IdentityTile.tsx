import { useState } from "react";
import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import AgencyLogo from "~/components/agency/AgencyLogo";
import IdentityModal from "./IdentityModal";
import type { Agency } from "~/models/Agency";

interface IdentityTileProps {
    agency: Agency;
}

export default function IdentityTile({ agency }: IdentityTileProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "right-end",
        middleware: [offset(20), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    return (
        <>
            <div
                ref={refs.setReference}
                onClick={() => setIsOpen((open) => !open)}
                {...getReferenceProps()}
                className="m-3 flex flex-row items-center gap-3 cursor-pointer rounded-lg p-1 hover:bg-surface-hover border border-transparent min-w-0"
            >
                <AgencyLogo agency={agency} className="size-9 shrink-0" />
                <span className="text-heading-sm font-semibold whitespace-nowrap truncate text-left">
                    {agency.name}
                </span>
            </div>
            {isOpen && (
                <IdentityModal
                    agency={agency}
                    floatingRef={refs.setFloating}
                    floatingStyles={floatingStyles}
                    getFloatingProps={getFloatingProps}
                />
            )}
        </>
    );
}
