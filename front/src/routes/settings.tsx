import SideBar from "~/components/sidebar/SideBar";
import SettingsPageView from "~/components/settings/SettingsPageView";

export default function SettingsLayout() {
    return (
        <div className="flex w-full">
            <SideBar />
            <div className="flex-1 min-w-0">
                <SettingsPageView />
            </div>
        </div>
    );
}
