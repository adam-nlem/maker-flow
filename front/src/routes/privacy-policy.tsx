import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { homePath } from "~/routes/routePaths"

export default function PrivacyPolicyPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="bg-clear bg-dot-pattern h-screen relative overflow-y-auto scrollbar-none">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate(homePath)}
                    className="flex items-center gap-2 text-muted-2 hover:text-dark transition-colors mb-8 cursor-pointer"
                >
                    <ArrowLeftIcon className="size-4" />
                    <span className="text-body-sm">{t("common:actions.back")}</span>
                </button>

                <h1 className="text-heading-3xl text-dark mb-2">{t("privacy:title")}</h1>
                <p className="text-body-sm text-muted-2 mb-10">
                    {t("privacy:lastUpdated", { date: t("privacy:lastUpdatedDate") })}
                </p>

                <div className="flex flex-col gap-10">
                    <Section title={t("privacy:introduction.title")}>
                        <p>{t("privacy:introduction.p1")}</p>
                        <p>{t("privacy:introduction.p2")}</p>
                    </Section>

                    <Section title={t("privacy:dataCollected.title")}>
                        <p>{t("privacy:dataCollected.intro")}</p>

                        <Subsection title={t("privacy:dataCollected.instagram.title")}>
                            <SubsectionLabel>{t("privacy:dataCollected.instagram.profileLabel")}</SubsectionLabel>
                            <BulletList items={t("privacy:dataCollected.instagram.profileItems", { returnObjects: true }) as string[]} />
                            <SubsectionLabel>{t("privacy:dataCollected.instagram.contentLabel")}</SubsectionLabel>
                            <BulletList items={t("privacy:dataCollected.instagram.contentItems", { returnObjects: true }) as string[]} />
                            <SubsectionLabel>{t("privacy:dataCollected.instagram.analyticsLabel")}</SubsectionLabel>
                            <BulletList items={t("privacy:dataCollected.instagram.analyticsItems", { returnObjects: true }) as string[]} />
                        </Subsection>

                        <Subsection title={t("privacy:dataCollected.youtube.title")}>
                            <SubsectionLabel>{t("privacy:dataCollected.youtube.channelLabel")}</SubsectionLabel>
                            <BulletList items={t("privacy:dataCollected.youtube.channelItems", { returnObjects: true }) as string[]} />
                            <SubsectionLabel>{t("privacy:dataCollected.youtube.contentLabel")}</SubsectionLabel>
                            <BulletList items={t("privacy:dataCollected.youtube.contentItems", { returnObjects: true }) as string[]} />
                            <SubsectionLabel>{t("privacy:dataCollected.youtube.analyticsLabel")}</SubsectionLabel>
                            <BulletList items={t("privacy:dataCollected.youtube.analyticsItems", { returnObjects: true }) as string[]} />
                        </Subsection>

                        <Subsection title={t("privacy:dataCollected.auth.title")}>
                            <BulletList items={t("privacy:dataCollected.auth.items", { returnObjects: true }) as string[]} />
                        </Subsection>
                    </Section>

                    <Section title={t("privacy:dataUsage.title")}>
                        <p>{t("privacy:dataUsage.intro")}</p>
                        <BulletList items={t("privacy:dataUsage.items", { returnObjects: true }) as string[]} />
                        <p>{t("privacy:dataUsage.outro")}</p>
                    </Section>

                    <Section title={t("privacy:storage.title")}>
                        <p>{t("privacy:storage.intro")}</p>
                        <BulletList items={t("privacy:storage.items", { returnObjects: true }) as string[]} />
                    </Section>

                    <Section title={t("privacy:sharing.title")}>
                        <p>
                            <Trans
                                i18nKey="privacy:sharing.paragraph"
                                components={{
                                    metaLink: (
                                        <a
                                            href="https://developers.facebook.com/terms/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        />
                                    ),
                                    youtubeLink: (
                                        <a
                                            href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        />
                                    ),
                                }}
                            />
                        </p>
                    </Section>

                    <Section title={t("privacy:retention.title")}>
                        <p>{t("privacy:retention.intro")}</p>
                        <BulletList items={t("privacy:retention.items", { returnObjects: true }) as string[]} />
                    </Section>

                    <Section title={t("privacy:rights.title")}>
                        <p>{t("privacy:rights.intro")}</p>
                        <BulletList items={t("privacy:rights.items", { returnObjects: true }) as string[]} />
                    </Section>

                    <Section title={t("privacy:contact.title")}>
                        <p>{t("privacy:contact.paragraph")}</p>
                        <a href="mailto:contact@maker-flow.com" className="text-primary">contact@maker-flow.com</a>
                    </Section>
                </div>

                <div className="mt-12 pt-6 border-t border-pale-gray">
                    <Button
                        style="outline"
                        width="w-auto"
                        onClick={() => navigate(homePath)}
                    >
                        {t("privacy:backToHome")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-heading-xl text-dark">{title}</h2>
            <div className="flex flex-col gap-3 text-body-base text-muted-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
                {children}
            </div>
        </section>
    )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-heading-sm text-dark">{title}</h3>
            {children}
        </div>
    )
}

function SubsectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-heading-xs text-dark/60 uppercase tracking-wide">{children}</p>
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul>
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    )
}
