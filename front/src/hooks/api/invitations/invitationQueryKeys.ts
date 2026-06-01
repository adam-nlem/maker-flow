export const invitationQueryKeys = {
    all: ['invitations'] as const,
    show: (token: string) => [...invitationQueryKeys.all, 'show', token] as const,
}
