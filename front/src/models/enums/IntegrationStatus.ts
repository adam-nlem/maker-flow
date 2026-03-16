export enum IntegrationStatus {
    Active = 'active',
    Revoked = 'revoked',
    Error = 'error',
}

export const integrationStatusToFrenchTranslation: Record<IntegrationStatus, string> = {
    [IntegrationStatus.Active]: "Connecté",
    [IntegrationStatus.Revoked]: "Expiré",
    [IntegrationStatus.Error]: "Erreur",
}

export const integrationStatusToBgClass: Record<IntegrationStatus, string> = {
    [IntegrationStatus.Active]: "bg-primary/10",
    [IntegrationStatus.Revoked]: "bg-yellow/10",
    [IntegrationStatus.Error]: "bg-danger/10",
}

export const integrationStatusToBorderClass: Record<IntegrationStatus, string> = {
    [IntegrationStatus.Active]: "border border-primary/30",
    [IntegrationStatus.Revoked]: "border border-yellow/30",
    [IntegrationStatus.Error]: "border border-danger/30",
}

export const integrationStatusToTextClass: Record<IntegrationStatus, string> = {
    [IntegrationStatus.Active]: "text-primary",
    [IntegrationStatus.Revoked]: "text-yellow",
    [IntegrationStatus.Error]: "text-danger",
}
