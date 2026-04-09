import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "~/components/ui/Button"
import { homePath, privacyPolicyPath } from "~/routes/routePaths"

const LAST_UPDATED = "9 avril 2026"

export default function TermsOfServicePage() {
    const navigate = useNavigate()

    return (
        <div className="bg-clear bg-dot-pattern h-screen relative overflow-y-auto scrollbar-none">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate(homePath)}
                    className="flex items-center gap-2 text-gray hover:text-dark transition-colors mb-8 cursor-pointer"
                >
                    <ArrowLeftIcon className="size-4" />
                    <span className="text-body-sm">Retour</span>
                </button>

                <h1 className="text-heading-3xl text-dark mb-2">Conditions Générales d'Utilisation</h1>
                <p className="text-body-sm text-gray mb-10">Dernière mise à jour : {LAST_UPDATED}</p>

                <div className="flex flex-col gap-10">
                    <Section title="1. Objet">
                        <p>
                            Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour
                            objet de définir les modalités et conditions d'utilisation de l'application
                            MakerFlow, accessible en ligne.
                        </p>
                        <p>
                            MakerFlow est une application destinée aux créateurs de contenu. Elle permet
                            de connecter des comptes de réseaux sociaux (Instagram, YouTube), de consulter
                            des statistiques de performance et de rédiger des scripts
                            pour vos contenus.
                        </p>
                        <p>
                            L'utilisation de MakerFlow implique l'acceptation pleine et entière des
                            présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser
                            l'application.
                        </p>
                    </Section>

                    <Section title="2. Accès et inscription">
                        <p>
                            L'accès à MakerFlow nécessite la création d'un compte utilisateur. Lors de
                            l'inscription, vous devez fournir des informations exactes et à jour.
                        </p>
                        <ul>
                            <li>
                                L'utilisation de MakerFlow est réservée aux personnes âgées d'au moins
                                16 ans
                            </li>
                            <li>
                                Vous êtes responsable de la véracité des informations fournies lors de
                                votre inscription
                            </li>
                            <li>
                                MakerFlow se réserve le droit de refuser ou de suspendre l'accès à tout
                                utilisateur ne respectant pas les présentes CGU
                            </li>
                        </ul>
                    </Section>

                    <Section title="3. Description des services">
                        <p>MakerFlow propose les fonctionnalités suivantes :</p>
                        <ul>
                            <li>
                                Connexion de comptes Instagram et YouTube via le protocole OAuth pour
                                la collecte de statistiques de performance
                            </li>
                            <li>
                                Tableau de bord analytique permettant de visualiser les performances
                                de vos publications
                            </li>
                            <li>
                                Rédaction et organisation de scripts pour vos contenus
                            </li>
                        </ul>
                        <p>
                            MakerFlow se réserve le droit de faire évoluer, modifier ou supprimer
                            certaines fonctionnalités à tout moment, sans préavis.
                        </p>
                    </Section>

                    <Section title="4. Abonnements et paiements">
                        <p>
                            MakerFlow propose différentes formules d'abonnement payant offrant
                            des fonctionnalités et des limites d'utilisation variées. Les détails
                            des offres (prix, crédits inclus, limites) sont consultables depuis
                            l'application.
                        </p>
                        <ul>
                            <li>
                                Les paiements sont gérés par Stripe, prestataire de paiement
                                sécurisé. MakerFlow ne stocke aucune donnée bancaire
                            </li>
                            <li>
                                Les abonnements sont renouvelés automatiquement à chaque période
                                de facturation, sauf résiliation préalable par l'utilisateur
                            </li>
                            <li>
                                Vous pouvez résilier votre abonnement à tout moment depuis les
                                paramètres de l'application. La résiliation prend effet à la fin
                                de la période de facturation en cours
                            </li>
                            <li>
                                En cas de résiliation, vous conservez l'accès aux fonctionnalités
                                payantes jusqu'à la fin de la période déjà réglée
                            </li>
                            <li>
                                Chaque abonnement inclut un nombre de crédits mensuels. Des
                                recharges de crédits supplémentaires peuvent être achetées
                                séparément
                            </li>
                        </ul>
                        <p>
                            MakerFlow se réserve le droit de modifier les tarifs et les conditions
                            des abonnements. Les utilisateurs seront informés de toute modification
                            avant le prochain renouvellement.
                        </p>
                    </Section>

                    <Section title="5. Compte utilisateur">
                        <p>
                            Vous êtes entièrement responsable de la sécurité de votre compte et de la
                            confidentialité de vos identifiants de connexion.
                        </p>
                        <ul>
                            <li>
                                Vous ne devez pas partager vos identifiants avec des tiers
                            </li>
                            <li>
                                Toute activité réalisée depuis votre compte est réputée avoir été
                                effectuée par vous
                            </li>
                            <li>
                                En cas de suspicion d'utilisation non autorisée de votre compte,
                                vous devez nous en informer immédiatement à l'adresse{" "}
                                <a href="mailto:contact@maker-flow.com" className="text-primary hover:underline">
                                    contact@maker-flow.com
                                </a>
                            </li>
                        </ul>
                    </Section>

                    <Section title="6. Obligations de l'utilisateur">
                        <p>En utilisant MakerFlow, vous vous engagez à :</p>
                        <ul>
                            <li>
                                Respecter les présentes CGU ainsi que la législation en vigueur
                            </li>
                            <li>
                                Ne pas utiliser l'application à des fins illicites, frauduleuses ou
                                portant atteinte aux droits de tiers
                            </li>
                            <li>
                                Ne pas tenter d'accéder de manière non autorisée aux systèmes ou
                                données de MakerFlow
                            </li>
                            <li>
                                Ne pas perturber le fonctionnement normal de l'application
                            </li>
                            <li>
                                Respecter les conditions d'utilisation des plateformes tierces
                                connectées (Instagram, YouTube)
                            </li>
                        </ul>
                    </Section>

                    <Section title="7. Propriété intellectuelle">
                        <p>
                            L'ensemble des éléments composant MakerFlow (interface, design, code source,
                            logos, textes) sont la propriété exclusive de MakerFlow et sont protégés par
                            les lois relatives à la propriété intellectuelle.
                        </p>
                        <p>
                            Vous conservez l'intégralité de vos droits sur les contenus que vous créez
                            via l'application (scripts). MakerFlow ne revendique aucun droit de
                            propriété sur vos contenus.
                        </p>
                    </Section>

                    <Section title="8. Limitation de responsabilité">
                        <p>
                            MakerFlow est fourni « en l'état ». Nous nous efforçons d'assurer la
                            disponibilité et le bon fonctionnement de l'application, mais ne pouvons
                            garantir :
                        </p>
                        <ul>
                            <li>
                                L'absence d'interruptions ou d'erreurs dans le fonctionnement du service
                            </li>
                            <li>
                                La disponibilité permanente des API tierces (Instagram, YouTube) dont
                                dépendent certaines fonctionnalités
                            </li>
                            <li>
                                L'exactitude absolue des données statistiques collectées auprès des
                                plateformes tierces
                            </li>
                        </ul>
                        <p>
                            MakerFlow ne saurait être tenu responsable des dommages directs ou indirects
                            résultant de l'utilisation ou de l'impossibilité d'utilisation de
                            l'application.
                        </p>
                    </Section>

                    <Section title="9. Données personnelles">
                        <p>
                            MakerFlow collecte et traite des données personnelles dans le cadre de son
                            fonctionnement. Le détail de la collecte, de l'utilisation et de la protection
                            de vos données est décrit dans notre{" "}
                            <Link
                                to={privacyPolicyPath}
                                className="text-primary hover:underline"
                            >
                                Politique de Confidentialité
                            </Link>.
                        </p>
                        <p>
                            En utilisant MakerFlow, vous reconnaissez avoir pris connaissance de cette
                            politique et en acceptez les termes.
                        </p>
                    </Section>

                    <Section title="10. Modification des CGU">
                        <p>
                            MakerFlow se réserve le droit de modifier les présentes CGU à tout moment.
                            Les utilisateurs seront informés de toute modification substantielle.
                        </p>
                        <p>
                            La poursuite de l'utilisation de l'application après modification des CGU
                            vaut acceptation des nouvelles conditions.
                        </p>
                    </Section>

                    <Section title="11. Droit applicable et contact">
                        <p>
                            Les présentes CGU sont régies par le droit français. En cas de litige relatif
                            à l'interprétation ou à l'exécution des présentes, les tribunaux français
                            seront seuls compétents.
                        </p>
                        <p>
                            Pour toute question relative aux présentes CGU, vous pouvez nous contacter
                            à l'adresse suivante :
                        </p>
                        <a href="mailto:contact@maker-flow.com" className="text-primary">contact@maker-flow.com</a>
                    </Section>
                </div>

                <div className="mt-12 pt-6 border-t border-light-gray">
                    <Button
                        style="outline"
                        width="w-auto"
                        onClick={() => navigate(homePath)}
                    >
                        Retour à l'accueil
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
