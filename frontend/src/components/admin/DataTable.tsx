import { cn } from '@/lib/utils';

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    return (
        <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
                <thead className="border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn(
                                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="h-24 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b transition-colors hover:bg-muted/50"
                            >
                                {columns.map((column, index) => (
                                    <td key={index} className={cn('p-4 align-middle', column.className)}>
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(row)
                                            : String(row[column.accessor])}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
