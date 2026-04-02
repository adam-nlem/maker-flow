export enum ContentTab {
    Groups = 'groups',
    Posts = 'posts',
}

export const contentTabOptions = Object.values(ContentTab)

export const contentTabToFrenchTranslation: Record<ContentTab, string> = {
    [ContentTab.Groups]: "Groupes",
    [ContentTab.Posts]: "Posts",
}
