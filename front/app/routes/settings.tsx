import SideBar from "~/components/sidebar/SideBar";
import SettingsPageView from "~/components/settings/SettingsPageView";

export default function SettingsLayout() {
    return (
        <div className="w-full">
            <SideBar />
            <div className="w-full pl-16">
                <SettingsPageView />
            </div>
        </div>
    );
}
