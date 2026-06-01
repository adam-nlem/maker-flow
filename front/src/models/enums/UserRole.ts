export enum UserRole {
    User = 'ROLE_USER',
    Admin = 'ROLE_ADMIN',
    Editor = 'ROLE_EDITOR',
    Viewer = 'ROLE_VIEWER',
    Client = 'ROLE_CLIENT',
}

export const userRoleOptions = Object.values(UserRole);

export const userRolePrecedence: UserRole[] = [
    UserRole.Admin,
    UserRole.Editor,
    UserRole.Viewer,
    UserRole.Client,
];

export const invitableUserRoles: UserRole[] = [
    UserRole.Editor,
    UserRole.Viewer,
];

export const userRoleTranslationKeys: Record<UserRole, string> = {
    [UserRole.User]: "userRoles:user",
    [UserRole.Admin]: "userRoles:admin",
    [UserRole.Editor]: "userRoles:editor",
    [UserRole.Viewer]: "userRoles:viewer",
    [UserRole.Client]: "userRoles:client",
};
