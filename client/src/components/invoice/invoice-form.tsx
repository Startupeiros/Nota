import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvoiceSchema, Supplier, Category, Invoice } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, parseCurrency } from "@/lib/utils/format-currency";
import { CloudUpload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSuccess?: () => void;
}

// Extended schema for form validation with specific rules
const formSchema = insertInvoiceSchema.extend({
  supplierId: z.coerce.number().positive({ message: "Fornecedor é obrigatório" }),
  categoryId: z.coerce.number().positive({ message: "Categoria é obrigatória" }),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  amount: z.string().min(1, { message: "Valor é obrigatório" }),
});

export function InvoiceForm({ open, onOpenChange, invoice, onSuccess }: InvoiceFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [xmlFileName, setXmlFileName] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  // Fetch suppliers and categories
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Set default values based on existing invoice or create new defaults
  const defaultValues = invoice
    ? {
        ...invoice,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        amount: typeof invoice.amount === "number" 
          ? formatCurrency(invoice.amount).replace("R$", "").trim() 
          : String(invoice.amount),
        supplierId: invoice.supplierId,
        categoryId: invoice.categoryId,
      }
    : {
        number: "",
        supplierId: "",
        categoryId: "",
        issueDate: new Date(),
        dueDate: new Date(),
        amount: "",
        description: "",
        status: "pending",
        createdBy: user?.id || 0,
      };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isLoading = form.formState.isSubmitting;

  // Handle XML file upload
  const handleXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setXmlFileName(e.target.files[0].name);
    }
  };

  // Handle PDF file upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFileName(e.target.files[0].name);
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formattedData = {
        ...data,
        amount: parseCurrency(data.amount as string) || 0,
        createdBy: user?.id || 0,
      };

      if (invoice) {
        await apiRequest("PUT", `/api/invoices/${invoice.id}`, formattedData);
        toast({
          title: "Nota fiscal atualizada",
          description: "A nota fiscal foi atualizada com sucesso",
        });
      } else {
        await apiRequest("POST", "/api/invoices", formattedData);
        toast({
          title: "Nota fiscal cadastrada",
          description: "A nota fiscal foi cadastrada com sucesso",
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a nota fiscal",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Editar Nota Fiscal" : "Lançar Nova Nota Fiscal"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da nota fiscal abaixo. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota *</FormLabel>
                    <FormControl>
                      <Input placeholder="Número/Série" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => {
                          // Allow only numbers, commas and dots
                          const value = e.target.value.replace(/[^0-9,.]/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Anexar XML</FormLabel>
                <div className="mt-1 flex items-center">
                  <label htmlFor="xml-upload" className="relative cursor-pointer bg-white font-medium text-primary hover:text-primary-600">
                    <span className="flex items-center space-x-2 border rounded p-2 hover:border-primary">
                      <CloudUpload className="h-4 w-4" />
                      <span>{xmlFileName || "Selecionar arquivo"}</span>
                    </span>
                    <input
                      id="xml-upload"
                      name="attachmentXml"
                      type="file"
                      accept=".xml"
                      className="sr-only"
                      onChange={handleXmlUpload}
                    />
                  </label>
                </div>
              </div>

              <div>
                <FormLabel>Anexar PDF</FormLabel>
                <div className="mt-1 flex items-center">
                  <label htmlFor="pdf-upload" className="relative cursor-pointer bg-white font-medium text-primary hover:text-primary-600">
                    <span className="flex items-center space-x-2 border rounded p-2 hover:border-primary">
                      <CloudUpload className="h-4 w-4" />
                      <span>{pdfFileName || "Selecionar arquivo"}</span>
                    </span>
                    <input
                      id="pdf-upload"
                      name="attachmentPdf"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handlePdfUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : invoice ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
