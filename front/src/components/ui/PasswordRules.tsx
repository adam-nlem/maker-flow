import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { PasswordRule } from "~/utils/passwordValidation";

interface PasswordRulesProps {
    rules: PasswordRule[];
}

export default function PasswordRules({ rules }: PasswordRulesProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {rules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2">
                    {rule.isValid ? (
                        <CheckIcon className="size-3.5 text-primary" strokeWidth={2} />
                    ) : (
                        <XMarkIcon className="size-3.5 text-danger" strokeWidth={2} />
                    )}
                    <p className={`text-body-xs ${rule.isValid ? 'text-primary' : 'text-danger'}`}>
                        {rule.label}
                    </p>
                </div>
            ))}
        </div>
    );
}
