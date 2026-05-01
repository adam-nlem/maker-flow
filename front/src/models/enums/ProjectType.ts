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

export const projectTypeTranslationKeys: Record<ProjectType, string> = {
    [ProjectType.Saas]: "enums:projectType.saas",
    [ProjectType.ContentCreation]: "enums:projectType.contentCreation",
    [ProjectType.MobileApp]: "enums:projectType.mobileApp",
    [ProjectType.Extension]: "enums:projectType.extension",
    [ProjectType.Automation]: "enums:projectType.automation",
    [ProjectType.WebApp]: "enums:projectType.webApp",
    [ProjectType.LandingPage]: "enums:projectType.landingPage",
    [ProjectType.Blog]: "enums:projectType.blog",
    [ProjectType.Portfolio]: "enums:projectType.portfolio",
    [ProjectType.Hardware]: "enums:projectType.hardware",
    [ProjectType.Iot]: "enums:projectType.iot",
};

export const projectTypeOptions = Object.values(ProjectType);