import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { Link, useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { homePath, privacyPolicyPath } from "~/routes/routePaths"

export default function TermsOfServicePage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className="bg-clear bg-dot-pattern h-screen relative overflow-y-auto scrollbar-none">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate(homePath)}
                    className="flex items-center gap-2 text-gray hover:text-dark transition-colors mb-8 cursor-pointer"
                >
                    <ArrowLeftIcon className="size-4" />
                    <span className="text-body-sm">{t("common:actions.back")}</span>
                </button>

                <h1 className="text-heading-3xl text-dark mb-2">{t("terms:title")}</h1>
                <p className="text-body-sm text-gray mb-10">
                    {t("terms:lastUpdated", { date: t("terms:lastUpdatedDate") })}
                </p>

                <div className="flex flex-col gap-10">
                    <Section title={t("terms:purpose.title")}>
                        <p>{t("terms:purpose.p1")}</p>
                        <p>{t("terms:purpose.p2")}</p>
                        <p>{t("terms:purpose.p3")}</p>
                    </Section>

                    <Section title={t("terms:access.title")}>
                        <p>{t("terms:access.intro")}</p>
                        <BulletList items={t("terms:access.items", { returnObjects: true }) as string[]} />
                    </Section>

                    <Section title={t("terms:services.title")}>
                        <p>{t("terms:services.intro")}</p>
                        <BulletList items={t("terms:services.items", { returnObjects: true }) as string[]} />
                        <p>{t("terms:services.outro")}</p>
                    </Section>

                    <Section title={t("terms:billing.title")}>
                        <p>{t("terms:billing.intro")}</p>
                        <BulletList items={t("terms:billing.items", { returnObjects: true }) as string[]} />
                        <p>{t("terms:billing.outro")}</p>
                    </Section>

                    <Section title={t("terms:account.title")}>
                        <p>{t("terms:account.intro")}</p>
                        <ul>
                            <li>{t("terms:account.item1")}</li>
                            <li>{t("terms:account.item2")}</li>
                            <li>
                                <Trans
                                    i18nKey="terms:account.item3"
                                    components={{
                                        contactLink: (
                                            <a
                                                href="mailto:contact@maker-flow.com"
                                                className="text-primary hover:underline"
                                            />
                                        ),
                                    }}
                                />
                            </li>
                        </ul>
                    </Section>

                    <Section title={t("terms:obligations.title")}>
                        <p>{t("terms:obligations.intro")}</p>
                        <BulletList items={t("terms:obligations.items", { returnObjects: true }) as string[]} />
                    </Section>

                    <Section title={t("terms:intellectualProperty.title")}>
                        <p>{t("terms:intellectualProperty.p1")}</p>
                        <p>{t("terms:intellectualProperty.p2")}</p>
                    </Section>

                    <Section title={t("terms:liability.title")}>
                        <p>{t("terms:liability.intro")}</p>
                        <BulletList items={t("terms:liability.items", { returnObjects: true }) as string[]} />
                        <p>{t("terms:liability.outro")}</p>
                    </Section>

                    <Section title={t("terms:personalData.title")}>
                        <p>
                            <Trans
                                i18nKey="terms:personalData.p1"
                                components={{
                                    privacyLink: (
                                        <Link
                                            to={privacyPolicyPath}
                                            className="text-primary hover:underline"
                                        />
                                    ),
                                }}
                            />
                        </p>
                        <p>{t("terms:personalData.p2")}</p>
                    </Section>

                    <Section title={t("terms:modifications.title")}>
                        <p>{t("terms:modifications.p1")}</p>
                        <p>{t("terms:modifications.p2")}</p>
                    </Section>

                    <Section title={t("terms:contact.title")}>
                        <p>{t("terms:contact.p1")}</p>
                        <p>{t("terms:contact.p2")}</p>
                        <a href="mailto:contact@maker-flow.com" className="text-primary">contact@maker-flow.com</a>
                    </Section>
                </div>

                <div className="mt-12 pt-6 border-t border-light-gray">
                    <Button
                        style="outline"
                        width="w-auto"
                        onClick={() => navigate(homePath)}
                    >
                        {t("terms:backToHome")}
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
            <div className="flex flex-col gap-3 text-body-base text-gray [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
                {children}
            </div>
        </section>
    )
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
