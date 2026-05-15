
interface SimpleTextButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  color?: string;
  hoverColor?: string;
}
export default function SimpleTextButton({ onClick, children, color = 'text-muted-2', hoverColor = 'text-dark' }: SimpleTextButtonProps) {
  return <div
    onClick={onClick}
    className={`flex flex-row justify-start items-center gap-1 shrink-0 cursor-pointer ${color} hover:${hoverColor} text-xs`}
  >
    {children}
  </div>
}
