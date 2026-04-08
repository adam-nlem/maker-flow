# Privacy Policy Page

## Overview

Public-facing privacy policy page required for Meta/Instagram API app review. Accessible without authentication at `/privacy-policy`.

## Route

- **Path**: `/privacy-policy` (constant: `privacyPolicyPath` in `routePaths.ts`)
- **Component**: `PrivacyPolicyPage` in `routes/privacy-policy.tsx`
- **Access**: Public — registered outside `PrelaunchGuardLayout` and `ProtectedLayout` so it's always accessible

## Content

The page covers:

1. **Introduction** — what MakerFlow is and scope of the policy
2. **Donnees collectees** — Instagram profile, content, analytics, and OAuth token data
3. **Utilisation des donnees** — analytics dashboard for the user's own content only
4. **Stockage et securite** — token encryption (sodium), secured database, HTTPS
5. **Partage des donnees** — no third-party sharing, Meta Platform Terms compliance
6. **Conservation et suppression** — data lifecycle on disconnect/account deletion
7. **Vos droits** — access, deletion, disconnection rights
8. **Contact** — contact email

## Maintenance

- Update `LAST_UPDATED` constant in `privacy-policy.tsx` when content changes
- Update the contact email placeholder if needed
- If new data types are collected (e.g., YouTube, TikTok), add them to section 2
