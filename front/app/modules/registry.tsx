import type { ComponentType } from "react";
import { ModuleIdentifier } from "~/models/enums/ModuleIdentifier";
import SocialAnalyticsDashboardView from "./socialAnalytics/components/SocialAnalyticsDashboardView";
import TodoListDashboardView from "./todoList/components/TodoListDashboardView";
import SocialAnalyticsPageView from "./socialAnalytics/components/SocialAnalyticsPageView";

export interface ModuleWidgetProps {
    userModuleUuid: string;
}

type ModuleWidgetComponent = ComponentType<ModuleWidgetProps>;

interface ModuleRegistryItem {
    dashboardView: ModuleWidgetComponent;
    pageView: ModuleWidgetComponent;
}

const moduleRegistry: Record<ModuleIdentifier, ModuleRegistryItem | null> = {
    [ModuleIdentifier.TodoList]: {
        dashboardView: TodoListDashboardView,
        pageView: TodoListDashboardView,
    },
    [ModuleIdentifier.GithubStats]: null,
    [ModuleIdentifier.Stripe]: null,
    [ModuleIdentifier.SocialAnalytics]: {
        dashboardView: SocialAnalyticsDashboardView,
        pageView: SocialAnalyticsPageView,
    },
};

export function getDashboardView(identifier: ModuleIdentifier): ModuleWidgetComponent | null {
    return moduleRegistry[identifier]?.dashboardView ?? null;
}

export function getPageView(identifier: ModuleIdentifier): ModuleWidgetComponent | null {
    return moduleRegistry[identifier]?.pageView ?? null;
}

export function hasDashboardView(identifier: ModuleIdentifier): boolean {
    return moduleRegistry[identifier]?.dashboardView !== null;
}
