import { useState, type ReactNode } from "react"
import { useFloating, offset, flip, shift, autoUpdate, useDismiss, useInteractions, FloatingPortal } from "@floating-ui/react"
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

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss])

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {renderTrigger({ onClick: () => setIsOpen(!isOpen) })}
      </div>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-70 border rounded-xl border-light-gray w-fit max-h-64 flex flex-col gap-3 p-3 shadow-lg bg-clear overflow-y-auto scrollbar-none"
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
                      setIsOpen(false)
                    },
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
                  <PlusIcon className="size-4" strokeWidth={2} />
                </div>
              </Button>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
