import { ChatBubbleLeftRightIcon, ClockIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ChatHeaderProps {
  title: string;
  onClose: () => void;
}

export function ChatHeader({ title, onClose }: ChatHeaderProps) {
  function onOpenHistory() {

  }

  function onCreateChat() {

  }

  return (
    <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-light-gray">
      <div className="flex flex-row items-center gap-2">
        <ChatBubbleLeftRightIcon className="size-5 text-primary" strokeWidth={2} />
        <h2 className="text-heading-md">{title}</h2>
      </div>
      <div className="flex flex-row items-center gap-3 text-gray">
        <button onClick={onOpenHistory} className="shrink-0 hover:text-dark transition-colors cursor-pointer" title="Ouvrir l'historique de conversations">
          <ClockIcon className="size-4" strokeWidth={2} />
        </button>
        <button onClick={onCreateChat} className="shrink-0 hover:text-dark transition-colors cursor-pointer" title="Créer une nouvelle conversation">
          <PlusIcon className="size-4" strokeWidth={2} />
        </button>
        <button onClick={onClose} className="shrink-0 hover:text-dark transition-colors cursor-pointer" title="Fermer">
          <XMarkIcon className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
