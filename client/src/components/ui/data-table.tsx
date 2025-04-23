import * as React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  searchable?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  rowClassName,
  pagination,
  searchable = false,
  onSearch,
  searchPlaceholder = "Buscar...",
  actions,
  emptyState,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="space-y-4">
      {(searchable || actions) && (
        <div className="flex items-center justify-between">
          {searchable && (
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
          )}
          {!searchable && <div />}
          {actions}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyState || "Nenhum registro encontrado."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""} ${
                    rowClassName ? rowClassName(row) : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, columnIndex) => (
                    <TableCell key={columnIndex} className={column.className}>
                      {column.cell
                        ? column.cell(row)
                        : typeof column.accessorKey === "function"
                        ? column.accessorKey(row)
                        : String(row[column.accessorKey] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {pagination && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        Mostrando
                        <span className="px-1 font-medium">
                          {pagination.pageIndex * pagination.pageSize + 1}
                        </span>
                        a
                        <span className="px-1 font-medium">
                          {Math.min(
                            (pagination.pageIndex + 1) * pagination.pageSize,
                            pagination.pageCount * pagination.pageSize
                          )}
                        </span>
                        de
                        <span className="px-1 font-medium">
                          {pagination.pageCount * pagination.pageSize}
                        </span>
                        resultados
                      </p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">Linhas por página</p>
                        <Select
                          value={pagination.pageSize.toString()}
                          onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pagination.pageSize.toString()} />
                          </SelectTrigger>
                          <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                              <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                          disabled={pagination.pageIndex === 0}
                        >
                          <span className="sr-only">Página anterior</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                          Página {pagination.pageIndex + 1} de {pagination.pageCount}
                        </div>
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                          disabled={pagination.pageIndex === pagination.pageCount - 1}
                        >
                          <span className="sr-only">Próxima página</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}
