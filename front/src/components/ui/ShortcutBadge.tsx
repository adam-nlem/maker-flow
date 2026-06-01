import { useIsMac } from "~/hooks/useIsMac";

interface ShortcutBadgeProps {
  label: string;
  simple?: boolean;
  bgClassName?: string;
  borderClassName?: string;
  textClassName?: string;
}

export function ShortcutBadge({
  label,
  simple = false,
  bgClassName = "bg-clear",
  borderClassName = "border-pale-gray-2",
  textClassName = "text-dark",
}: ShortcutBadgeProps) {
  const isMac = useIsMac();
  const prefix = isMac ? "⌘" : "Ctrl+";

  const containerClasses = simple
    ? `shrink-0 text-xs ${textClassName}`
    : `shrink-0 rounded-md border px-1.5 py-0.5 text-xs ${bgClassName} ${borderClassName} ${textClassName}`;

  return (
    <span className={containerClasses}>
      {prefix}{label}
    </span>
  );
}
