import { ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon, HomeIcon, LifebuoyIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";

export default function SideBar() {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-start bg-light-gray bg-opacity-50">
            <div className="border rounded-r-xl h-full  border-light-gray flex flex-col justify-between w-1/5 lg:w-1/6 xl:w-[280px] bg-white">
                {/* TOP SECTION */}
                <div className="p-3">
                    {/* PROJECT SELECTOR */}
                    <div className="flex flex-row justify-between hover:bg-light-gray cursor-pointer rounded-md p-2">
                        <div className="flex flex-row gap-3">
                            <div className="rounded-md bg-primary flex items-center justify-center h-10 w-10 text-heading-md">N</div>
                            <div className="flex flex-col">
                                <h1 className="text-heading-sm">Nom du projet</h1>
                                <p className="text-body-xs">25 Modules Actifs</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center leading-none">
                            <ChevronUpIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} />
                            <ChevronDownIcon className="size-3.5 text-gray -mt-0.5" strokeWidth={2} />
                        </div>
                    </div>

                    {/* NAVIGATION SECTION */}
                    <div className="mt-10 flex flex-col">
                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <HomeIcon className="size-5 text-dark" strokeWidth={2} />
                            <h1 className="text-heading-sm">Accueil</h1>
                        </div>

                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <Square3Stack3DIcon className="size-5 text-gray" strokeWidth={2} />
                            <h1 className="text-heading-sm text-gray ">Bibliothèque</h1>
                        </div>

                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <Cog6ToothIcon className="size-5 text-gray" strokeWidth={2} />
                            <h1 className="text-heading-sm text-gray ">Paramètres</h1>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-light-gray rounded mx-2"></div>

                    {/* MODULES SECTION */}
                    <div className="mt-5 flex flex-col">
                        <h1 className="text-heading-xs text-gray pl-2 pb-1">Modules Actifs</h1>
                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <img
                                src="https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082"
                                alt="Stripe logo"
                                className="size-5 rounded-sm"
                            />
                            <h1 className="text-heading-sm">Github</h1>
                        </div>

                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <img
                                src="https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082"
                                alt="Stripe logo"
                                className="size-5 rounded-sm"
                            />
                            <h1 className="text-heading-sm">Stripe</h1>
                        </div>

                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div>

                    {/* NAVIGATION SECTION */}
                    <div className="mb-5 flex flex-col p-3">

                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <Cog6ToothIcon className="size-5 text-gray" strokeWidth={1} />
                            <h1 className="text-body-sm text-gray ">Paramètres</h1>
                        </div>

                        <div className="flex flex-row items-center gap-3 hover:bg-light-gray cursor-pointer rounded-md p-2">
                            <LifebuoyIcon className="size-5 text-gray" strokeWidth={1} />
                            <h1 className="text-body-sm text-gray ">Aide</h1>
                        </div> 
                    </div>

                    <div className="border-t border-light-gray rounded"></div>

                    {/* USER SECTION */}
                    <div className="flex flex-row justify-between hover:bg-light-gray cursor-pointer rounded-md m-3 p-2">
                            <div className="flex flex-col">
                            <h1 className="text-heading-sm">Adam Rafik</h1>
                                <p className="text-body-xs">adam@gmail.com</p>
                            </div>
                        <div className="flex flex-col justify-center leading-none">
                            <ChevronUpIcon className="size-3.5 text-gray -mb-0.5" strokeWidth={2} />
                            <ChevronDownIcon className="size-3.5 text-gray -mt-0.5" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}