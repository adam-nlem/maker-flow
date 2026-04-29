import ModalOverlay from "~/components/ui/ModalOverlay";
import type { TodoListTask } from "~/models/TodoListTask";
import { TextArea } from "~/components/ui/TextArea";
import { Badge } from "~/components/ui/Badge";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TodoListStatus, todoListStatusOptions, todoListStatusToBgClass, todoListStatusToFrenchTranslation, todoListStatusToTextClass } from "~/models/enums/TodoListStatus";
import { TodoListPriority, todoListPriorityOptions, todoListPriorityToFrenchTranslation } from "~/models/enums/TodoListPriority";
import { useUpdateTodoListTask } from "~/hooks/api/todoListTasks/useUpdateTodoListTask";
import { TagIcon, ExclamationTriangleIcon, CheckBadgeIcon, CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { colorToTextClass, colorToBgClass } from "~/models/enums/Color";
import { todoListPriorityToTextClass, todoListPriorityToBgClass } from "~/models/enums/TodoListPriority";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import SelectDropdown from "~/components/ui/SelectDropdown";
import ListTodoListTagsDropdown from "../todoListTags/ListTodoListTagsDropdown";
import type { TodoListTag } from "~/models/TodoListTag";
import AddDueDateDropdown from "./AddDueDateDropdown";
import { useDeleteTodoListTask } from "~/hooks/api/todoListTasks/useDeleteTodoListTask";
import { TrashIcon } from "@heroicons/react/24/outline";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";

interface DetailTodoListTaskModalProps {
    todoListUuid: string;
    task: TodoListTask;
    showModal: boolean;
    onClose: () => void;
    onTaskDeleted: () => void;
}

export default function DetailTodoListTaskModal({ todoListUuid, task, showModal, onClose, onTaskDeleted }: DetailTodoListTaskModalProps) {
    const { t } = useTranslation()
    const [title, setTitle] = useState(task.title)
    const [content, setContent] = useState(task.content)
    const [status, setStatus] = useState(task.status)
    const [priority, setPriority] = useState(task.priority)
    const [dueDate, setDueDate] = useState(task.dueDate)
    const [tags, setTags] = useState(task.tags)

    const [showTagsDropdown, setShowTagsDropdown] = useState(false);
    const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const tagButtonRef = useRef<HTMLDivElement>(null);
    const dueDateButtonRef = useRef<HTMLDivElement>(null);

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
        <>
        <ModalOverlay isOpen={showModal} onClose={handleClose}>
            <div className="flex flex-col gap-5 flex-1 min-h-0"
                onMouseDown={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 py-5 scroll-pb-5">
                    <div className="flex flex-row justify-around items-start">
                        <TextArea
                            placeholder={t("tasks:task.detail.titlePlaceholder")}
                            id="title"
                            name="title"

                            required
                            simple
                            textStyle="text-heading-xl"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <SimpleTextButton
                            onClick={() => setShowDeleteConfirm(true)}
                            hoverColor={"hover:text-danger"}
                        >
                            <TrashIcon className="size-3.5" strokeWidth={2} />
                            <p>{t("tasks:task.detail.delete")}</p>
                        </SimpleTextButton>
                    </div>

                    <p className="text-body-xs mb-1.5">
                        {t("tasks:task.detail.createdAt", { date: task.createdAt.toLocaleDateString('fr-FR'), time: task.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) })}
                        {task.updatedAt && ` • ${t("tasks:task.detail.modifiedAt", { date: task.updatedAt.toLocaleDateString('fr-FR'), time: task.updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) })}`}
                    </p>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">{t("tasks:task.detail.tagsHeader")}</h2>
                        <div className="flex flex-col gap-1 min-w-fit">
                            <div ref={tagButtonRef}>
                                <SimpleTextButton onClick={() => setShowTagsDropdown(!showTagsDropdown)}>
                                    <TagIcon className="size-3.5" strokeWidth={2} />
                                    <p>{t("tasks:task.addTag")}</p>
                                </SimpleTextButton>
                            </div>
                            {showTagsDropdown && <ListTodoListTagsDropdown
                                anchorRef={tagButtonRef}
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
                        <h2 className="text-heading-sm mb-1.5">{t("tasks:task.detail.priorityHeader")}</h2>
                        <div className="flex flex-col gap-1">
                            <SelectDropdown<TodoListPriority>
                                items={todoListPriorityOptions}
                                selectedItemId={priority}
                                getItemId={(item) => item}
                                onSelect={(item) => setPriority(item)}
                                renderTrigger={({ onClick }) => (
                                    priority ? (
                                        <Badge
                                            icon={ExclamationTriangleIcon}
                                            label={todoListPriorityToFrenchTranslation[priority]}
                                            textColor={todoListPriorityToTextClass[priority]}
                                            bgColor={todoListPriorityToBgClass[priority]}
                                            onRemoveClick={() => setPriority(undefined)}
                                            onClick={onClick}
                                        />
                                    ) : (
                                        <SimpleTextButton onClick={onClick}>
                                            <ExclamationTriangleIcon className="size-3.5" strokeWidth={2} />
                                            <p>{t("tasks:task.addPriority")}</p>
                                        </SimpleTextButton>
                                    )
                                )}
                                renderItem={({ item, onSelect }) => (
                                    <Badge
                                        icon={ExclamationTriangleIcon}
                                        label={todoListPriorityToFrenchTranslation[item]}
                                        textColor={todoListPriorityToTextClass[item]}
                                        bgColor={todoListPriorityToBgClass[item]}
                                        onClick={onSelect}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">{t("tasks:task.detail.statusHeader")}</h2>
                        <div className="flex flex-col gap-1">
                            <SelectDropdown<TodoListStatus>
                                items={todoListStatusOptions}
                                selectedItemId={status}
                                getItemId={(item) => item}
                                onSelect={(item) => setStatus(item)}
                                renderTrigger={({ onClick }) => (
                                    <Badge
                                        icon={CheckBadgeIcon}
                                        label={todoListStatusToFrenchTranslation[status]}
                                        textColor={todoListStatusToTextClass[status]}
                                        bgColor={todoListStatusToBgClass[status]}
                                        onClick={onClick}
                                    />
                                )}
                                renderItem={({ item, onSelect }) => (
                                    <Badge
                                        icon={CheckBadgeIcon}
                                        label={todoListStatusToFrenchTranslation[item]}
                                        textColor={todoListStatusToTextClass[item]}
                                        bgColor={todoListStatusToBgClass[item]}
                                        onClick={onSelect}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-heading-sm mb-1.5">{t("tasks:task.detail.dueDateHeader")}</h2>
                        <div className="flex flex-col gap-1">

                            <div ref={dueDateButtonRef}>
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
                                        <p>{t("tasks:task.addDueDate")}</p>
                                    </SimpleTextButton>
                                )}
                            </div>

                            {showDueDateDropdown && (
                                <AddDueDateDropdown
                                    anchorRef={dueDateButtonRef}
                                    selectedDueDate={dueDate}
                                    onClose={() => setShowDueDateDropdown(false)}
                                    onDueDateSelected={(selectedDate) => setDueDate(selectedDate)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="border-t border-light-gray rounded w-full my-5"></div>

                    <TextArea
                        placeholder={t("tasks:task.detail.contentPlaceholder")}
                        id="content"
                        name="content"
                        simple
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                </div>
            </div>
        </ModalOverlay>

        <ConfirmDeleteDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={async () => {
                await deleteTodoListTask({ taskUuid: task.uuid, todoListUuid });
                onTaskDeleted();
            }}
            message={t("tasks:task.detail.deleteConfirm")}
        />
        </>
    );
}