import type { Integration } from "~/models/Integration"

interface IntegrationProfileInfoProps {
    integration: Integration
}

export default function IntegrationProfileInfo({ integration }: IntegrationProfileInfoProps) {
    return (
        <div className="flex flex-row gap-1 items-center">
            {integration.profilePictureUrl && (
                <img
                    src={integration.profilePictureUrl}
                    alt={integration.displayName}
                    className="size-10 rounded-full object-cover"
                />
            )}
            <div className="flex flex-col">
                <h1 className="text-heading-sm">{integration.name}</h1>
                <p className="text-body-sm text-gray">{integration.userName}</p>
            </div>
        </div>
    )
}
