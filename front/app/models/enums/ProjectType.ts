export enum ProjectType {
    Saas = 'saas',
    ContentCreation = 'content_creation',
    MobileApp = 'mobile_app',
    Extension = 'extension',
    Automation = 'automation',
    WebApp = 'web_app',
    LandingPage = 'landing_page',
    Blog = 'blog',
    Portfolio = 'portfolio',
    Hardware = 'hardware',
    Iot = 'iot',
}

export const projectTypeToFrenchTranslation: Record<ProjectType, string> = {
    [ProjectType.Saas]: "SaaS",
    [ProjectType.ContentCreation]: "Création de contenu",
    [ProjectType.MobileApp]: "Application mobile",
    [ProjectType.Extension]: "Extension",
    [ProjectType.Automation]: "Automatisation",
    [ProjectType.WebApp]: "Application web",
    [ProjectType.LandingPage]: "Landing page",
    [ProjectType.Blog]: "Blog",
    [ProjectType.Portfolio]: "Portfolio",
    [ProjectType.Hardware]: "Hardware",
    [ProjectType.Iot]: "IoT",
};