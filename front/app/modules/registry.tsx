import type { ComponentType } from "react";
import { ModuleIdentifier } from "~/models/enums/ModuleIdentifier";
import SocialAnalyticsDashboardView from "./socialAnalytics/components/SocialAnalyticsDashboardView";
import SocialAnalyticsRouter from "./socialAnalytics/SocialAnalyticsRouter";
import TodoListDashboardView from "./todoList/components/TodoListDashboardView";
import TodoListRouter from "./todoList/TodoListRouter";

export interface ModuleWidgetProps {
    userModuleUuid: string;
}

type ModuleWidgetComponent = ComponentType<ModuleWidgetProps>;

interface ModuleRegistryItem {
    dashboardView: ModuleWidgetComponent;
    router: ModuleWidgetComponent;
}

const moduleRegistry: Record<ModuleIdentifier, ModuleRegistryItem | null> = {
    [ModuleIdentifier.TodoList]: {
        dashboardView: TodoListDashboardView,
        router: TodoListRouter,
    },
    [ModuleIdentifier.GithubStats]: null,
    [ModuleIdentifier.Stripe]: null,
    [ModuleIdentifier.SocialAnalytics]: {
        dashboardView: SocialAnalyticsDashboardView,
        router: SocialAnalyticsRouter,
    },
};

export function getDashboardView(identifier: ModuleIdentifier): ModuleWidgetComponent | null {
    return moduleRegistry[identifier]?.dashboardView ?? null;
}

export function getRouter(identifier: ModuleIdentifier): ModuleWidgetComponent | null {
    return moduleRegistry[identifier]?.router ?? null;
}

export function hasDashboardView(identifier: ModuleIdentifier): boolean {
    return moduleRegistry[identifier]?.dashboardView !== null;
}
