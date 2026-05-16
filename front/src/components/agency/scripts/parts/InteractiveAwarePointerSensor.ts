import { PointerSensor } from "@dnd-kit/core";

/**
 * A `PointerSensor` that ignores pointer-down events originating from interactive
 * elements (inputs, textareas, buttons, links, contenteditable). Lets users click
 * and type inside a draggable card without accidentally triggering a drag.
 */
export class InteractiveAwarePointerSensor extends PointerSensor {
    static activators = [{
        eventName: 'onPointerDown' as const,
        handler: ({ nativeEvent }: { nativeEvent: PointerEvent }) => {
            const target = nativeEvent.target as Element;
            return !target.closest('input, textarea, select, button, a, [contenteditable]');
        },
    }];
}
