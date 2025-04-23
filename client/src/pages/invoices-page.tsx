import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { Button } from "@/components/ui/button";
import { Plus, Filter, DownloadCloud, Upload } from "lucide-react";
import { InvoiceWithRelations } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InvoicesPage() {
  const { toast } = useToast();
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [editInvoiceOpen, setEditInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Fetch invoices
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/invoices"],
  });

  // Handler for viewing invoice details
  const handleView = (invoice: InvoiceWithRelations) => {
    setSelectedInvoice(invoice);
    // In a real app, navigate to a detailed view of the invoice
    toast({
      title: "Visualizar nota fiscal",
      description: `Nota fiscal ${invoice.number} selecionada para visualização.`,
    });
  };

  // Handler for editing invoice
  const handleEdit = (invoice: InvoiceWithRelations) => {
    setSelectedInvoice(invoice);
    setEditInvoiceOpen(true);
  };

  // Handler for adding payment to invoice
  const handlePay = (invoice: InvoiceWithRelations) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  // Handler for deleting invoice
  const handleDelete = (invoice: InvoiceWithRelations) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  // Add payment to invoice
  const confirmPayment = async () => {
    if (!selectedInvoice) return;

    try {
      const today = new Date();
      await apiRequest("PUT", `/api/invoices/${selectedInvoice.id}`, {
        status: "paid",
        paymentDate: today.toISOString(),
      });

      toast({
        title: "Pagamento registrado",
        description: `O pagamento da nota fiscal ${selectedInvoice.number} foi registrado com sucesso.`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setPaymentDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive",
      });
    }
  };

  // Delete invoice
  const confirmDelete = async () => {
    if (!selectedInvoice) return;

    try {
      await apiRequest("DELETE", `/api/invoices/${selectedInvoice.id}`);

      toast({
        title: "Nota fiscal excluída",
        description: `A nota fiscal ${selectedInvoice.number} foi excluída com sucesso.`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a nota fiscal.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Notas Fiscais</h1>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
            <Button variant="outline" className="gap-1">
              <DownloadCloud className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Button variant="outline" className="gap-1">
              <Upload className="h-4 w-4" />
              <span>Importar XML</span>
            </Button>
            <Button className="gap-1" onClick={() => setNewInvoiceOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Nova Nota</span>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <InvoiceTable
            invoices={invoices}
            isLoading={isLoadingInvoices}
            onView={handleView}
            onEdit={handleEdit}
            onPay={handlePay}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* New Invoice Dialog */}
      <InvoiceForm 
        open={newInvoiceOpen} 
        onOpenChange={setNewInvoiceOpen} 
      />

      {/* Edit Invoice Dialog */}
      {selectedInvoice && (
        <InvoiceForm 
          open={editInvoiceOpen} 
          onOpenChange={setEditInvoiceOpen} 
          invoice={selectedInvoice} 
        />
      )}

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja registrar o pagamento da nota fiscal {selectedInvoice?.number}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmPayment}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Nota Fiscal</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a nota fiscal {selectedInvoice?.number}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
