export enum ContentsTab {
    Groups = 'groups',
    Posts = 'posts',
}

export const contentsTabOptions = Object.values(ContentsTab)

export const contentsTabToFrenchTranslation: Record<ContentsTab, string> = {
    [ContentsTab.Groups]: "Groupes",
    [ContentsTab.Posts]: "Posts",
}
