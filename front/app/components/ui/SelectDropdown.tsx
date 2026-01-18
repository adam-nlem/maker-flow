import { useState, type ReactNode } from "react"
import { Button } from "./Button"
import { PlusIcon } from "@heroicons/react/24/outline"

interface SelectDropdownProps<T> {
    items: T[]
    selectedItemId?: string | null
    getItemId: (item: T) => string
    onSelect: (item: T) => void
    onClickCreateButton?: () => void
    createButtonLabel?: string
    renderTrigger: (args: { onClick: () => void }) => ReactNode
    renderItem: (args: { item: T; isSelected: boolean; onSelect: () => void }) => ReactNode
}

export default function SelectDropdown<T>({
    items,
    selectedItemId,
    getItemId,
    onSelect,
    onClickCreateButton,
    createButtonLabel,
    renderTrigger,
    renderItem,
}: SelectDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            {renderTrigger({ onClick: () => setIsOpen(!isOpen) })}

            {isOpen && (


                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div
                        className="absolute top-full left-0 mt-1 z-30 border rounded-xl border-light-gray w-fit max-h-64 flex flex-col gap-3 p-3 shadow-lg bg-white overflow-y-auto scrollbar-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {items.map((item) => {
                            const itemId = getItemId(item)
                            const isSelected = selectedItemId ? selectedItemId === itemId : false

                            return (
                                <div key={itemId}>
                                    {renderItem({
                                        item,
                                        isSelected,
                                        onSelect: () => { 
                                            onSelect(item) 
                                            setIsOpen(false) },
                                    })}
                                </div>
                            )
                        })}

                        {onClickCreateButton && createButtonLabel && (
                            <Button
                                type="button"
                                onClick={onClickCreateButton}
                                className="shrink-0"
                            >
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <p className="text-sm whitespace-nowrap">{createButtonLabel}</p>
                                    <PlusIcon className="size-4 text-clear" strokeWidth={2} />
                                </div>
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
