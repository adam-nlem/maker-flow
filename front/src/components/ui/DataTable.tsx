import type { ReactNode } from "react";

export interface DataTableColumn<T> {
    header: string;
    align?: "left" | "right";
    render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    getRowKey: (item: T) => string;
    onRowClick?: (item: T) => void;
    afterTable?: ReactNode;
    className?: string;
}

export default function DataTable<T>({
    columns,
    data,
    getRowKey,
    onRowClick,
    afterTable,
    className,
}: DataTableProps<T>) {
    return (
        <div className={`border border-light-gray rounded-lg overflow-auto scrollbar-none ${className ?? ""}`}>
            <table className="w-full table-auto">
                <thead className="sticky top-0 bg-clear z-10">
                    <tr className="border-b border-light-gray text-body-xs">
                        {columns.map((column) => (
                            <th
                                key={column.header}
                                className={`px-3 py-2 ${column.align === "right" ? "text-right" : "text-left"}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={getRowKey(item)}
                            className={`border-t border-light-gray ${onRowClick ? "hover:bg-surface-hover cursor-pointer" : ""}`}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.header}
                                    className={`px-3 py-2 text-sm ${column.align === "right" ? "text-right" : "text-left"}`}
                                >
                                    {column.render(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {afterTable}
        </div>
    );
}
