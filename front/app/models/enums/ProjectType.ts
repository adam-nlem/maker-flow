export enum ProjectType {
    Saas = 'saas',
    ContentCreation = 'content_creation',
}

export const projectTypeToFrenchTranslation: Record<ProjectType, string> = {
    [ProjectType.Saas]: "SaaS",
    [ProjectType.ContentCreation]: "Création de contenu",
};