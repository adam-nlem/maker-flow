
interface SimpleTextButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
}
export default function SimpleTextButton({ onClick, children }: SimpleTextButtonProps) {
    return <div
        onClick={onClick}
        className="flex flex-row justify-start items-center gap-1 shrink-0 cursor-pointer text-gray hover:text-dark text-xs "
    >
        {children}
    </div>
}