import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  CreditCard, 
  MoreHorizontal, 
  FileText, 
  Clock,
  AlertTriangle,
  CheckCircle2
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
import { InvoiceWithRelations } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/date";
import { getInvoiceStatus } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

interface InvoiceTableProps {
  invoices: InvoiceWithRelations[];
  isLoading?: boolean;
  onView: (invoice: InvoiceWithRelations) => void;
  onEdit: (invoice: InvoiceWithRelations) => void;
  onPay: (invoice: InvoiceWithRelations) => void;
  onDelete: (invoice: InvoiceWithRelations) => void;
}

export function InvoiceTable({
  invoices,
  isLoading = false,
  onView,
  onEdit,
  onPay,
  onDelete,
}: InvoiceTableProps) {
  const columns = [
    {
      header: "Nota Fiscal",
      accessorKey: "number",
      cell: (row: InvoiceWithRelations) => (
        <div className="font-medium text-foreground">{row.number}</div>
      ),
    },
    {
      header: "Fornecedor",
      accessorKey: "supplier.name",
      cell: (row: InvoiceWithRelations) => <div>{row.supplier.name}</div>,
    },
    {
      header: "Valor",
      accessorKey: "amount",
      cell: (row: InvoiceWithRelations) => (
        <div className="font-medium">{formatCurrency(row.amount)}</div>
      ),
    },
    {
      header: "Vencimento",
      accessorKey: "dueDate",
      cell: (row: InvoiceWithRelations) => <div>{formatDate(row.dueDate)}</div>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: InvoiceWithRelations) => {
        const status = getInvoiceStatus(row.dueDate, row.status, row.paymentDate);
        
        return (
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              status === "paid" && "bg-green-100 text-green-800 border-green-200",
              status === "due" && "bg-amber-100 text-amber-800 border-amber-200",
              status === "overdue" && "bg-red-100 text-red-800 border-red-200"
            )}
          >
            {status === "paid" && "Pago"}
            {status === "due" && "Pendente"}
            {status === "overdue" && "Vencido"}
          </Badge>
        );
      },
    },
    {
      header: "Ações",
      accessorKey: "id",
      className: "text-right",
      cell: (row: InvoiceWithRelations) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row)}
            className="text-primary hover:text-primary-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status !== "paid" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPay(row)}
              className="text-green-600 hover:text-green-800"
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opções</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(row)} className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row)} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Editar nota
              </DropdownMenuItem>
              {row.status !== "paid" && (
                <DropdownMenuItem onClick={() => onPay(row)} className="cursor-pointer">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Registrar pagamento
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(row)} 
                className="text-red-600 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Excluir nota
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
      data={invoices}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Buscar notas fiscais..."
      emptyState={
        <div className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma nota fiscal encontrada</h3>
          <p className="text-muted-foreground mt-2">
            Comece adicionando uma nova nota fiscal ao sistema.
          </p>
        </div>
      }
    />
  );
}
