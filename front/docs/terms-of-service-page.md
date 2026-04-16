# Terms of Service Page (CGU)

## Overview

Public-facing terms of service page ("Conditions Générales d'Utilisation") in French. Accessible without authentication at `/terms-of-service`.

## Route

- **Path**: `/terms-of-service` (constant: `termsOfServicePath` in `routePaths.ts`)
- **Component**: `TermsOfServicePage` in `routes/terms-of-service.tsx`
- **Access**: Public — registered outside `PrelaunchGuardLayout` and `ProtectedLayout` so it's always accessible

## Content

The page covers:

1. **Objet** — scope of the CGU, what MakerFlow is, acceptance clause
2. **Accès et inscription** — account creation, age requirement (16 ans minimum)
3. **Description des services** — Instagram/YouTube analytics, scripts
4. **Abonnements et paiements** — subscription plans, Stripe payments, auto-renewal, cancellation, credits and refills
5. **Compte utilisateur** — credentials security, account responsibility
6. **Obligations de l'utilisateur** — acceptable use, prohibited behaviors
7. **Propriété intellectuelle** — MakerFlow owns the platform, user owns their content
8. **Limitation de responsabilité** — service "as is", no third-party API availability guarantee
9. **Données personnelles** — cross-link to privacy policy page via React Router `<Link>`
10. **Modification des CGU** — right to update terms, continued use as acceptance
11. **Droit applicable et contact** — French law, French courts, contact email

## Maintenance

- Update `LAST_UPDATED` constant in `terms-of-service.tsx` when content changes
- Update the contact email if needed
- If new services are added, update section 3
- The privacy policy link in section 8 uses `privacyPolicyPath` from `routePaths.ts`
