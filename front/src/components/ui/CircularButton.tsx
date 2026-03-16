export function CircularButton({ children, type = 'button', onClick }: { children: React.ReactNode, type?: 'button' | 'submit' | 'reset', onClick?: () => void }) {
    return (<button
        type={type}
        onClick={onClick}
        className="rounded-full cursor-pointer bg-primary p-1.5 text-clear shadow-xs hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
        {children}
    </button>)
}