import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { useAuthenticatePrelaunch } from "~/hooks/api/prelaunch/useAuthenticatePrelaunch"
import { OtpType } from "~/models/enums/OtpType"
import { verifyOtpPath } from "~/routes/routePaths"
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions"
import {
    ChartBarIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline"
import Pill from "../ui/Pill"
import { prelaunchRewardTierOptions } from "~/models/enums/PrelaunchRewardTier"
import PrelaunchRewardTierCard from "./PrelaunchRewardTierCard"

interface PrelaunchAuthenticateStepProps {
    referralCodeFromUrl: string | null
}

export default function PrelaunchAuthenticateStep({ referralCodeFromUrl }: PrelaunchAuthenticateStepProps) {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { authenticatePrelaunch, isPending } = useAuthenticatePrelaunch()

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError(null)

        if (!email.trim()) {
            setError("Veuillez entrer votre adresse email.")
            return
        }

        try {
            const response = await authenticatePrelaunch({
                email: email.trim(),
                referralCode: referralCodeFromUrl,
            })
            navigate(verifyOtpPath, {
                state: {
                    pendingOtpToken: response.pendingOtpToken,
                    purpose: OtpType.PrelaunchVerification,
                    email: response.email,
                },
            })
        } catch (err) {
            if (err instanceof CustomHttpException) {
                const message = err.data?.message ?? err.errorMessage
                setError(message)
            }
        }
    }

    const features = [
        {
            icon: ClipboardDocumentListIcon,
            title: "Un seul espace, zéro friction",
            description: "Idées, scripts, planning et stats réunis dans un workspace unique. Fini les allers-retours entre 7 outils.",
        },
        {
            icon: SparklesIcon,
            title: "Des scripts prêts en 60 secondes",
            description: "L'IA analyse votre style et génère des scripts qui vous ressemblent vraiment. Vous ajustez, vous publiez.",
        },
        {
            icon: ChartBarIcon,
            title: "Vos stats, enfin lisibles",
            description: "Un seul dashboard pour toutes vos plateformes. Comparez les performances d'une même vidéo sur différents réseaux, en un coup d'œil.",
        },
        {
            icon: CalendarDaysIcon,
            title: "Planifiez sans vous prendre la tête",
            description: "Visualisez votre calendrier de publication et gardez le rythme sans stress.",
        },
    ]

    return (
        <div className="flex flex-col items-center min-h-screen w-full pb-20">
            <div className="flex flex-row items-center justify-between w-full border-b border-light-gray py-2 px-4">
                <h1 className="text-heading-xl">MakerFlow</h1>
                <Pill label="ACCÈS ANTICIPÉ OUVERT" bgColorClassName="bg-yellow/10" borderColorClassName="border border-yellow/30" textColorClassName="text-yellow" isSelected />
            </div>

            <div className="mt-12 sm:mt-20 md:mt-30 flex flex-col max-w-2xl w-full text-center items-center px-4 sm:px-6">
                {referralCodeFromUrl && (
                    <div className="animate-fade-in-up">
                        <Pill label="Vous avez été invité par un ami !" bgColorClassName="bg-primary/10" borderColorClassName="border border-primary/30" textColorClassName="text-primary" isSelected />
                    </div>
                )}
                <h2 className="text-heading-2xl sm:text-heading-3xl my-3 animate-fade-in-up">
                    Arrêtez de jongler entre 7 onglets pour publier <span className="text-primary">un seul contenu.</span>
                </h2>

                <p className="text-body-sm sm:text-body-md mb-8 sm:mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <span className="text-primary">MakerFlow</span> centralise tout votre workflow créatif en un seul endroit pour que vous passiez moins de temps à gérer des outils, et plus de temps à créer ce qui compte vraiment.
                </p>

                <form className="flex flex-col sm:flex-row gap-2 sm:gap-1 justify-center mb-1 w-full sm:w-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }} onSubmit={handleSubmit}>
                    <Input
                        id="prelaunch-email"
                        name="email"
                        type="email"
                        placeholder="votre@mail.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        width="w-full sm:w-2/3"
                    />

                    <Button
                        type="submit"
                        style="primary"
                        isLoading={isPending}
                        disabled={isPending}
                        width="w-full sm:w-1/3"
                    >
                        Réserver ma place
                    </Button>
                </form>

                {error && (
                    <p className="text-heading-sm text-danger">{error}</p>
                )}

                <div className="border-t border-light-gray rounded w-full my-8 sm:my-10"></div>

                <p className="text-body-xs mb-3">
                    CE QUE ÇA CHANGE CONCRÈTEMENT
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="flex flex-col items-start p-4 sm:p-5 rounded-xl border border-light-gray text-left bg-clear animate-fade-in-up"
                            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                            <feature.icon className="h-6 w-6 text-primary mb-3" />
                            <h3 className="text-heading-sm mb-1">{feature.title}</h3>
                            <p className="text-body-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-light-gray rounded w-full my-8 sm:my-10"></div>

                <h3 className="text-heading-lg sm:text-heading-xl mb-3 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                    Invitez des amis. Débloquez des <span className="text-primary">récompenses.</span>
                </h3>

                <p className="text-body-sm sm:text-body-md mb-8 sm:mb-10 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
                    Plus vous invitez de créateurs dans l'aventure, plus vos avantages augmentent.
                </p>

                <div className="space-y-3 mb-8 sm:mb-10 w-full">
                    {prelaunchRewardTierOptions.map((tier, index) => (
                        <div key={tier} className="animate-fade-in-up" style={{ animationDelay: `${0.9 + index * 0.1}s` }}>
                            <PrelaunchRewardTierCard
                                tier={tier}
                                isUnlocked={false}
                            />
                        </div>
                    ))}
                </div>

                <Pill label="Inscrivez-vous d'abord, puis recevez votre lien de parrainage unique." bgColorClassName="bg-primary/10" borderColorClassName="border border-primary/30" textColorClassName="text-primary" isSelected />
            </div>
        </div>
    )
}
