type TagColor = 'primary' | 'gray' | 'yellow' | 'danger';

interface TagProps {
    label: string;
    color?: TagColor;
    className?: string;
}

const tagColorClasses: Record<TagColor, string> = {
    primary: 'bg-primary/10 text-primary',
    gray: 'bg-pale-gray-2 text-muted-2',
    yellow: 'bg-yellow/10 text-yellow',
    danger: 'bg-danger/10 text-danger',
};

export function Tag({ label, color = 'gray', className = '' }: TagProps) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-body-xs ${tagColorClasses[color]} ${className}`}>
            {label}
        </span>
    );
}
