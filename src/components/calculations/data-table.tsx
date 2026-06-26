import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type GroupCell = { label?: string; color?: string; colSpan: number };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  groupRow?: GroupCell[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  groupRow,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {groupRow && (
            <TableRow>
              {groupRow.map((cell, i) => {
                const textColor = cell.color === "#fffe00" ? "#000" : cell.color ? "#fff" : undefined;
                return (
                  <TableHead
                    key={i}
                    colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                    className={cn(cell.label && "text-center")}
                    style={cell.color ? { background: cell.color, color: textColor } : undefined}
                  >
                    {cell.label && (
                      <span className="whitespace-nowrap font-mono text-xs font-semibold">
                        {cell.label}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          )}
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as { sticky?: boolean; headerBg?: string } | undefined;
                const sticky = meta?.sticky;
                const headerBg = meta?.headerBg;
                const headerText = headerBg === "#fffe00" ? "#000" : headerBg ? "#fff" : undefined;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      sticky && "sticky left-0 z-10 bg-[var(--app-sticky-header)] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
                    )}
                    style={headerBg ? { background: headerBg, color: headerText } : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const sticky = (cell.column.columnDef.meta as { sticky?: boolean } | undefined)?.sticky;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        sticky && "sticky left-0 z-10 bg-[var(--app-sticky-body)] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Sonuç yok.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
