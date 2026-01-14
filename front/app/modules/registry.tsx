import type { ComponentType } from "react";
import { ModuleIdentifier } from "~/models/enums/ModuleIdentifier";
import SocialAnalyticsDashboardView from "./socialAnalytics/components/SocialAnalyticsDashboardView";
import TodoListDashboardView from "./todoList/components/TodoListDashboardView";

export interface ModuleWidgetProps {
    userModuleUuid: string;
}

type ModuleWidgetComponent = ComponentType<ModuleWidgetProps>;

const moduleRegistry: Record<ModuleIdentifier, ModuleWidgetComponent | null> = {
    [ModuleIdentifier.TodoList]: TodoListDashboardView,
    [ModuleIdentifier.GithubStats]: null,
    [ModuleIdentifier.Stripe]: null,
    [ModuleIdentifier.SocialAnalytics]: SocialAnalyticsDashboardView,
};

export function getModuleWidget(identifier: ModuleIdentifier): ModuleWidgetComponent | null {
    return moduleRegistry[identifier] ?? null;
}

export function hasModuleWidget(identifier: ModuleIdentifier): boolean {
    return moduleRegistry[identifier] !== null;
}
