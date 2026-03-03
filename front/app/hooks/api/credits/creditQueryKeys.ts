export const creditQueryKeys = {
    all: ['credits'] as const,
    balance: () => [...creditQueryKeys.all, 'balance'] as const,
    transactions: (page: number, limit: number) => [...creditQueryKeys.all, 'transactions', page, limit] as const,
};
