export const creditQueryKeys = {
    all: ['credits'] as const,
    balance: () => [...creditQueryKeys.all, 'balance'] as const,
};
