import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"

import { Button } from "~/components/ui/Button"
import { homePath } from "~/routes/routePaths"

const LAST_UPDATED = "8 avril 2026"

export default function PrivacyPolicyPage() {
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

                <h1 className="text-heading-3xl text-dark mb-2">Politique de Confidentialité</h1>
                <p className="text-body-sm text-gray mb-10">Dernière mise à jour : {LAST_UPDATED}</p>

                <div className="flex flex-col gap-10">
                    <Section title="1. Introduction">
                        <p>
                            MakerFlow est une application destinée aux créateurs de contenu. Elle
                            permet de connecter des comptes de réseaux sociaux (Instagram, YouTube)
                            afin de consulter des statistiques de performance sur vos publications,
                            et de rédiger des scripts pour vos contenus.
                        </p>
                        <p>
                            La présente politique de confidentialité décrit les données que nous collectons,
                            comment nous les utilisons, les stockons et les protégeons, ainsi que vos droits
                            en tant qu'utilisateur.
                        </p>
                    </Section>

                    <Section title="2. Données collectées">
                        <p>
                            Lorsque vous connectez un compte de réseau social à MakerFlow via le
                            protocole OAuth, nous collectons et stockons les données suivantes
                            selon la plateforme :
                        </p>

                        <Subsection title="Instagram">
                            <p className="text-heading-xs text-dark/60 uppercase tracking-wide">Profil</p>
                            <ul>
                                <li>Identifiant utilisateur, nom d'utilisateur, nom d'affichage</li>
                                <li>Photo de profil (URL)</li>
                            </ul>
                            <p className="text-heading-xs text-dark/60 uppercase tracking-wide">Contenu</p>
                            <ul>
                                <li>Identifiants des publications</li>
                                <li>Type de média (image, vidéo, carrousel)</li>
                                <li>Légendes, miniatures (URL), liens permanents</li>
                                <li>Date de publication</li>
                            </ul>
                            <p className="text-heading-xs text-dark/60 uppercase tracking-wide">Analyse</p>
                            <ul>
                                <li>Portée, vues, mentions J'aime, commentaires, partages, sauvegardes</li>
                                <li>Temps de visionnage moyen et total (vidéos)</li>
                                <li>Nombre d'abonnés</li>
                            </ul>
                        </Subsection>

                        <Subsection title="YouTube">
                            <p className="text-heading-xs text-dark/60 uppercase tracking-wide">Chaîne</p>
                            <ul>
                                <li>Identifiant de chaîne, nom de la chaîne, URL personnalisée</li>
                                <li>Photo de profil (miniature)</li>
                            </ul>
                            <p className="text-heading-xs text-dark/60 uppercase tracking-wide">Contenu</p>
                            <ul>
                                <li>Identifiants des vidéos</li>
                                <li>Titres, miniatures (URL), liens permanents</li>
                                <li>Durée des vidéos</li>
                                <li>Date de publication</li>
                            </ul>
                            <p className="text-heading-xs text-dark/60 uppercase tracking-wide">Analyse</p>
                            <ul>
                                <li>Vues, mentions J'aime, commentaires, partages</li>
                                <li>Temps de visionnage moyen et total</li>
                                <li>Impressions de miniatures et taux de clics</li>
                                <li>Abonnés gagnés et perdus</li>
                                <li>Répartition par pays, statut d'abonnement et type de contenu (en direct / à la demande)</li>
                            </ul>
                        </Subsection>

                        <Subsection title="Données d'authentification (toutes plateformes)">
                            <ul>
                                <li>
                                    Jetons d'accès et de rafraîchissement OAuth (chiffrés au repos,
                                    jamais exposés au navigateur)
                                </li>
                            </ul>
                        </Subsection>
                    </Section>

                    <Section title="3. Utilisation des données">
                        <p>Les données collectées sont utilisées exclusivement pour :</p>
                        <ul>
                            <li>
                                Afficher vos statistiques de performance dans votre tableau de bord
                                personnel
                            </li>
                            <li>
                                Synchroniser périodiquement vos données afin de maintenir vos
                                analyses à jour
                            </li>
                            <li>
                                Vous notifier en cas d'expiration ou de révocation de votre
                                connexion à une plateforme
                            </li>
                        </ul>
                        <p>
                            Vos données sont uniquement accessibles par vous. Nous ne vendons, ne
                            louons et ne partageons vos données avec aucun tiers à des fins
                            commerciales ou publicitaires.
                        </p>
                    </Section>

                    <Section title="4. Stockage et sécurité">
                        <p>
                            Nous mettons en œuvre des mesures techniques appropriées pour protéger
                            vos données :
                        </p>
                        <ul>
                            <li>
                                Les jetons d'accès OAuth sont chiffrés au repos
                            </li>
                            <li>
                                Les données sont stockées dans une base de données sécurisée à
                                accès restreint
                            </li>
                            <li>
                                Les communications entre votre navigateur et nos serveurs sont
                                chiffrées via HTTPS
                            </li>
                        </ul>
                    </Section>

                    <Section title="5. Partage des données">
                        <p>
                            MakerFlow ne partage vos données avec aucun tiers. Les données obtenues
                            via les API des plateformes sont traitées conformément aux{" "}
                            <a
                                href="https://developers.facebook.com/terms/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Conditions de la Plateforme Meta
                            </a>
                            {" "}et aux{" "}
                            <a
                                href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Conditions d'utilisation des services API YouTube
                            </a>.
                        </p>
                    </Section>

                    <Section title="6. Conservation et suppression">
                        <p>
                            Vos données sont conservées tant que votre compte MakerFlow est actif.
                        </p>
                        <ul>
                            <li>
                                Lorsque vous déconnectez un compte (Instagram ou YouTube) de
                                MakerFlow, les données d'analyse déjà collectées sont conservées
                                afin de préserver votre historique de statistiques
                            </li>
                            <li>
                                Lorsque vous supprimez votre compte MakerFlow, l'ensemble de vos
                                données est supprimé définitivement
                            </li>
                        </ul>
                    </Section>

                    <Section title="7. Vos droits">
                        <p>En tant qu'utilisateur, vous avez le droit de :</p>
                        <ul>
                            <li>
                                Accéder aux données que nous détenons à votre sujet
                            </li>
                            <li>
                                Demander la suppression de vos données à tout moment
                            </li>
                            <li>
                                Déconnecter vos comptes (Instagram, YouTube) depuis les paramètres
                                de l'application
                            </li>
                            <li>
                                Révoquer l'accès de MakerFlow depuis les paramètres de votre compte
                                Instagram ou YouTube
                            </li>
                        </ul>
                    </Section>

                    <Section title="8. Contact">
                        <p>
                            Pour toute question relative à cette politique de confidentialité ou à
                            vos données personnelles, vous pouvez nous contacter à l'adresse
                            suivante :
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-heading-sm text-dark">{title}</h3>
            {children}
        </div>
    )
}
