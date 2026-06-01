export enum ContentsTab {
  Groups = 'groups',
  Posts = 'posts',
}

export const contentsTabOptions = Object.values(ContentsTab)

export const contentsTabTranslationKeys: Record<ContentsTab, string> = {
  [ContentsTab.Posts]: "enums:contentsTab.posts",
  [ContentsTab.Groups]: "enums:contentsTab.groups",
}
