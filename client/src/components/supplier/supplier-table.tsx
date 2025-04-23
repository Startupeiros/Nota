import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { 
  Building, 
  FileEdit, 
  Trash2, 
  MoreHorizontal,
  ListFilter
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
import { Supplier } from "@shared/schema";

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading?: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({
  suppliers,
  isLoading = false,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  const columns = [
    {
      header: "Nome",
      accessorKey: "name",
      cell: (row: Supplier) => (
        <div className="font-medium text-foreground">{row.name}</div>
      ),
    },
    {
      header: "CNPJ",
      accessorKey: "cnpj",
    },
    {
      header: "Contato",
      accessorKey: "contactName",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Telefone",
      accessorKey: "phone",
    },
    {
      header: "Ações",
      accessorKey: "id",
      className: "text-right",
      cell: (row: Supplier) => (
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
                Editar fornecedor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(row)} 
                className="text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir fornecedor
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
      data={suppliers}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Buscar fornecedores..."
      actions={
        <Button size="sm" variant="outline" className="gap-1">
          <ListFilter className="h-4 w-4" />
          Filtrar
        </Button>
      }
      emptyState={
        <div className="flex flex-col items-center justify-center py-8">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum fornecedor encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Comece adicionando um novo fornecedor ao sistema.
          </p>
        </div>
      }
    />
  );
}
