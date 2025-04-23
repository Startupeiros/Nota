import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { 
  FolderOpen, 
  FileEdit, 
  Trash2, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Category } from "@shared/schema";
import { timeAgo } from "@/lib/utils/date";

interface CategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const columns = [
    {
      header: "Nome",
      accessorKey: "name",
      cell: (row: Category) => (
        <div className="font-medium text-foreground">{row.name}</div>
      ),
    },
    {
      header: "Descrição",
      accessorKey: "description",
      cell: (row: Category) => (
        <div className="text-muted-foreground truncate max-w-xs">
          {row.description || "—"}
        </div>
      ),
    },
    {
      header: "Criado em",
      accessorKey: "createdAt",
      cell: (row: Category) => <div>{timeAgo(row.createdAt)}</div>,
    },
    {
      header: "Ações",
      accessorKey: "id",
      className: "text-right",
      cell: (row: Category) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            className="text-primary hover:text-primary-700"
          >
            <FileEdit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opções</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(row)} className="cursor-pointer">
                <FileEdit className="h-4 w-4 mr-2" />
                Editar categoria
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(row)} 
                className="text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir categoria
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Buscar categorias..."
      emptyState={
        <div className="flex flex-col items-center justify-center py-8">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Comece adicionando uma nova categoria ao sistema.
          </p>
        </div>
      }
    />
  );
}
