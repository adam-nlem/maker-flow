import { useTranslation } from "react-i18next";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import DataTable, { type DataTableColumn } from "~/components/ui/DataTable";
import { Tag } from "~/components/ui/Tag";
import { UserRole, userRoleTranslationKeys } from "~/models/enums/UserRole";

export type CollaboratorRowStatus = 'active' | 'pending';

export interface CollaboratorRow {
    key: string;
    fullName: string;
    email: string;
    role: UserRole | null;
    status: CollaboratorRowStatus;
    isSelf: boolean;
    onDelete: (() => void) | null;
}

interface CollaboratorsTableProps {
    rows: CollaboratorRow[];
}

export default function CollaboratorsTable({ rows }: CollaboratorsTableProps) {
    const { t } = useTranslation();

    const columns: DataTableColumn<CollaboratorRow>[] = [
        {
            header: t("collaborators:columns.name"),
            render: (row) => <span>{row.fullName}</span>,
        },
        {
            header: t("collaborators:columns.email"),
            render: (row) => <span className="text-muted-2">{row.email}</span>,
        },
        {
            header: t("collaborators:columns.role"),
            render: (row) => row.role
                ? <Tag color="primary" label={t(userRoleTranslationKeys[row.role])} />
                : <span className="text-muted-2">—</span>,
        },
        {
            header: t("collaborators:columns.status"),
            render: (row) => row.status === 'active'
                ? <Tag color="primary" label={t("collaborators:status.active")} />
                : <Tag color="yellow" label={t("collaborators:status.pending")} />,
        },
        {
            header: t("collaborators:columns.actions"),
            align: "right",
            render: (row) => <CollaboratorRowAction row={row} />,
        },
    ];

    return <DataTable<CollaboratorRow> columns={columns} data={rows} getRowKey={(row) => row.key} />;
}

function CollaboratorRowAction({ row }: { row: CollaboratorRow }) {
    const { t } = useTranslation();

    if (row.isSelf) {
        return <span className="text-body-xs text-muted-2">{t("collaborators:self")}</span>;
    }
    if (!row.onDelete) return null;

    const Icon = row.status === 'active' ? TrashIcon : XMarkIcon;
    return (
        <Icon
            className="size-4 text-muted-2 hover:text-danger cursor-pointer transition-colors"
            strokeWidth={2}
            onClick={row.onDelete}
        />
    );
}
