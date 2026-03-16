/**
 * Formats a price in euros with French locale: "9,99 €"
 */
export function formatPriceEur(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}
