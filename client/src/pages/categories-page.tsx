import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { CategoryTable } from "@/components/category/category-table";
import { CategoryForm } from "@/components/category/category-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Category } from "@shared/schema";
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

export default function CategoriesPage() {
  const { toast } = useToast();
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Handler for editing category
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryOpen(true);
  };

  // Handler for deleting category
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  // Delete category
  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      await apiRequest("DELETE", `/api/categories/${selectedCategory.id}`);

      toast({
        title: "Categoria excluída",
        description: `A categoria ${selectedCategory.name} foi excluída com sucesso.`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Categorias</h1>

          <Button className="gap-1" onClick={() => setNewCategoryOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </Button>
        </div>

        <div className="mt-6">
          <CategoryTable
            categories={categories}
            isLoading={isLoadingCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* New Category Dialog */}
      <CategoryForm 
        open={newCategoryOpen} 
        onOpenChange={setNewCategoryOpen} 
      />

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <CategoryForm 
          open={editCategoryOpen} 
          onOpenChange={setEditCategoryOpen} 
          category={selectedCategory} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a categoria {selectedCategory?.name}? Esta ação não pode ser desfeita.
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
