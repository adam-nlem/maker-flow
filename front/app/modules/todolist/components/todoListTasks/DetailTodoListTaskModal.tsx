import ModalOverlay from "~/components/ui/ModalOverlay";
import type { TodoListTask } from "../../models/TodoListTask";
import { Input } from "~/components/ui/Input";
import { TextArea } from "~/components/ui/TextArea";
import { Badge } from "~/components/ui/Badge";
import { useState } from "react";
import { selectTodoListStatusDropdownOptions, todoListStatusToBgClass, todoListStatusToFrenchTranslation, todoListStatusToTextClass } from "../../models/enums/TodoListStatus";
import { selectTodoListPriorityDropdownOptions, todoListPriorityToFrenchTranslation } from "../../models/enums/TodoListPriority";
import { useUpdateTodoListTask } from "../../hooks/todoListTasks/useUpdateTodoListTask";
import { TagIcon, ExclamationTriangleIcon, CheckBadgeIcon, CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { colorToTextClass, colorToBgClass } from "~/models/enums/Color";
import { todoListPriorityToTextClass, todoListPriorityToBgClass } from "../../models/enums/TodoListPriority";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import SelectEnumDropdown from "~/components/ui/SelectEnumDropdown";
import ListTodoListTagsDropdown from "../todoListTags/ListTodoListTagsDropdown";
import type { TodoListTag } from "../../models/TodoListTag";
import AddDueDateDropdown from "./AddDueDateDropdown";
import { useDeleteTodoListTask } from "../../hooks/todoListTasks/useDeleteTodoListTask";
import { TrashIcon } from "@heroicons/react/24/outline";

interface DetailTodoListTaskModalProps {
    todoListUuid: string;
    task: TodoListTask;
    showModal: boolean;
    onClose: () => void;
    onTaskDeleted: () => void;
}

export default function DetailTodoListTaskModal({ todoListUuid, task, showModal, onClose, onTaskDeleted }: DetailTodoListTaskModalProps) {
    const [title, setTitle] = useState(task.title)
    const [content, setContent] = useState(task.content)
    const [status, setStatus] = useState(task.status)
    const [priority, setPriority] = useState(task.priority)
    const [dueDate, setDueDate] = useState(task.dueDate)
    const [tags, setTags] = useState(task.tags)

    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);

    const { updateTodoListTask } = useUpdateTodoListTask()
    const { deleteTodoListTask } = useDeleteTodoListTask()

    const hasChanges = () => {
        const tagsChanged = tags.length !== task.tags.length ||
            tags.some((t, i) => t.uuid !== task.tags[i]?.uuid)

        return title !== task.title ||
            content !== task.content ||
            status !== task.status ||
            priority !== task.priority ||
            dueDate?.getTime() !== task.dueDate?.getTime() ||
            tagsChanged
    }

    const handleClose = async () => {
        if (hasChanges()) {
            await updateTodoListTask({
                taskUuid: task.uuid,
                todoListUuid,
                data: {
                    title,
                    content,
                    status,
                    priority: priority ?? null,
                    dueDate: dueDate ?? null,
                    tags,
                }
            })
        }
        onClose()
    }

    return (
        <ModalOverlay isOpen={showModal} onClose={handleClose} className="justify-center items-center">
            <div className="border rounded-xl border-light-gray w-1/2 h-3/4 flex flex-col min-h-0 min-w-0 gap-5 shadow-lg bg-white"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 py-5 scroll-pb-5">
                    <div className="flex flex-row justify-around items-start">
                        <TextArea
                            placeholder="Titre de la tâche"
                            id="title"
                            name="title"

                            required
                            fullWidth
                            simple
                            textStyle="text-heading-xl"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <SimpleTextButton onClick={async () => {
                            await deleteTodoListTask({ taskUuid: task.uuid, todoListUuid });
                            onTaskDeleted();
                        }}
                            hoverColor={"hover:text-danger"} children={
                                <>
                                    <TrashIcon className="size-3.5" strokeWidth={2} />
                                    <p>Supprimer</p>
                                </>
                            } />
                    </div>

                    <p className="text-body-xs mb-1.5">Crée le {task.createdAt.toLocaleDateString('fr-FR')} à {task.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}{task.updatedAt && ` • Modifié le ${task.updatedAt.toLocaleDateString('fr-FR')} à ${task.updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}</p>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">Tags</h2>
                        <div className="flex flex-col gap-1 relative min-w-fit">
                            <SimpleTextButton onClick={() => setShowTagsDropdown(!showTagsDropdown)}>
                                <TagIcon className="size-3.5" strokeWidth={2} />
                                <p>Ajouter un tag</p>
                            </SimpleTextButton>

                            {showTagsDropdown && <ListTodoListTagsDropdown
                                todoListUuid={todoListUuid}
                                selectedTags={tags}
                                onClose={() => setShowTagsDropdown(false)}
                                onTagSelected={(selectedTag: TodoListTag) => {
                                    setTags([...tags, selectedTag])
                                }}
                                onTagDeleted={(deletedTagUuid) => setTags(tags.filter(t => t.uuid !== deletedTagUuid))}
                            />}

                            {tags.length > 0 && tags.map((tag) => (
                                <Badge
                                    key={tag.uuid}
                                    icon={TagIcon}
                                    label={tag.title}
                                    textColor={colorToTextClass[tag.color]}
                                    bgColor={colorToBgClass[tag.color]}
                                    onRemoveClick={() => setTags(tags.filter(t => t.uuid !== tag.uuid))}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">Priorité</h2>
                        <div className="relative flex flex-col gap-1">
                            {priority ? (
                                <Badge
                                    icon={ExclamationTriangleIcon}
                                    label={todoListPriorityToFrenchTranslation[priority]}
                                    textColor={todoListPriorityToTextClass[priority]}
                                    bgColor={todoListPriorityToBgClass[priority]}
                                    onRemoveClick={() => setPriority(undefined)}
                                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                                />
                            ) : (
                                <SimpleTextButton onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}>
                                    <ExclamationTriangleIcon className="size-3.5" strokeWidth={2} />
                                    <p>Ajouter une priorité</p>
                                </SimpleTextButton>
                            )}

                            {showPriorityDropdown && (
                                <SelectEnumDropdown
                                    selectedValue={priority}
                                    options={selectTodoListPriorityDropdownOptions}
                                    onClose={() => setShowPriorityDropdown(false)}
                                    onSelect={(selectedPriority) => setPriority(selectedPriority)}
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">Statut</h2>
                        <div className="relative flex flex-col gap-1">

                            <Badge
                                icon={CheckBadgeIcon}
                                label={todoListStatusToFrenchTranslation[status]}
                                textColor={todoListStatusToTextClass[status]}
                                bgColor={todoListStatusToBgClass[status]}
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            />


                            {showStatusDropdown && (
                                <SelectEnumDropdown
                                    selectedValue={status}
                                    options={selectTodoListStatusDropdownOptions}
                                    onClose={() => setShowStatusDropdown(false)}
                                    onSelect={(selectedStatus) => setStatus(selectedStatus)}
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">Date d'échéance</h2>
                        <div className="relative flex flex-col gap-1">

                            {dueDate ? (
                                <Badge
                                    icon={CalendarDateRangeIcon}
                                    label={dueDate.toLocaleDateString('fr-FR')}
                                    textColor="text-gray"
                                    onRemoveClick={() => setDueDate(undefined)}
                                    onClick={() => setShowDueDateDropdown(!showDueDateDropdown)}
                                />
                            ) : (
                                <SimpleTextButton onClick={() => setShowDueDateDropdown(!showDueDateDropdown)}>
                                    <CalendarDateRangeIcon className="size-3.5" strokeWidth={2} />
                                    <p>Ajouter une date</p>
                                </SimpleTextButton>
                            )}

                            {showDueDateDropdown && (
                                <AddDueDateDropdown
                                    selectedDueDate={dueDate}
                                    onClose={() => setShowDueDateDropdown(false)}
                                    onDueDateSelected={(selectedDate) => setDueDate(selectedDate)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="border-t border-light-gray rounded w-full my-5"></div>

                    <TextArea
                        placeholder="Contenu de la tâche"
                        id="content"
                        name="content"
                        fullWidth
                        simple
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                </div>
            </div>
        </ModalOverlay>
    );
}