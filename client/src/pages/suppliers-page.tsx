import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { SupplierTable } from "@/components/supplier/supplier-table";
import { SupplierForm } from "@/components/supplier/supplier-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Supplier } from "@shared/schema";
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

export default function SuppliersPage() {
  const { toast } = useToast();
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const [editSupplierOpen, setEditSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch suppliers
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  // Handler for editing supplier
  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplierOpen(true);
  };

  // Handler for deleting supplier
  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  // Delete supplier
  const confirmDelete = async () => {
    if (!selectedSupplier) return;

    try {
      await apiRequest("DELETE", `/api/suppliers/${selectedSupplier.id}`);

      toast({
        title: "Fornecedor excluído",
        description: `O fornecedor ${selectedSupplier.name} foi excluído com sucesso.`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o fornecedor.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Fornecedores</h1>

          <Button className="gap-1" onClick={() => setNewSupplierOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Novo Fornecedor</span>
          </Button>
        </div>

        <div className="mt-6">
          <SupplierTable
            suppliers={suppliers}
            isLoading={isLoadingSuppliers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* New Supplier Dialog */}
      <SupplierForm 
        open={newSupplierOpen} 
        onOpenChange={setNewSupplierOpen} 
      />

      {/* Edit Supplier Dialog */}
      {selectedSupplier && (
        <SupplierForm 
          open={editSupplierOpen} 
          onOpenChange={setEditSupplierOpen} 
          supplier={selectedSupplier} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Fornecedor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fornecedor {selectedSupplier?.name}? Esta ação não pode ser desfeita.
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
