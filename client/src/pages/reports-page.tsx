import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DownloadCloud,
  FileText,
  BarChart2,
  PieChart,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import { InvoiceTable } from "@/components/invoice/invoice-table";
import { useQuery } from "@tanstack/react-query";
import { InvoiceWithRelations } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format-currency";
import { SupplierChart } from "@/components/dashboard/supplier-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/utils/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("invoices");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch invoices
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/invoices"],
  });

  // Fetch top suppliers
  const { data: topSuppliers = [] } = useQuery({
    queryKey: ["/api/dashboard/top-suppliers"],
  });

  // Fetch category distribution
  const { data: categoryDistribution = [] } = useQuery({
    queryKey: ["/api/dashboard/category-distribution"],
  });

  // Calculate summary statistics
  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.issueDate);
    return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to;
  });

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount),
    0
  );

  const paidAmount = filteredInvoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const pendingAmount = filteredInvoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  // For demo purposes only - these functions would generate real reports in a production app
  const handleExportPdf = () => {
    alert("Esta funcionalidade geraria um PDF do relatório em uma aplicação real");
  };

  const handleExportExcel = () => {
    alert("Esta funcionalidade geraria um arquivo Excel do relatório em uma aplicação real");
  };

  // Dummy handlers for invoice table actions
  const handleView = () => {};
  const handleEdit = () => {};
  const handlePay = () => {};
  const handleDelete = () => {};

  return (
    <AppLayout>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>

          <div className="flex space-x-2">
            <Button variant="outline" className="gap-1" onClick={handleExportPdf}>
              <DownloadCloud className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            <Button variant="outline" className="gap-1" onClick={handleExportExcel}>
              <DownloadCloud className="h-4 w-4" />
              <span>Excel</span>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="invoices" value={reportType} onValueChange={setReportType}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="invoices" className="gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Notas Fiscais</span>
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Fornecedores</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="gap-1">
                  <PieChart className="h-4 w-4" />
                  <span>Categorias</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Tendências</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="gap-1"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {format(dateRange.from, "P", { locale: ptBR })} - {format(dateRange.to, "P", { locale: ptBR })}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                          setCalendarOpen(false);
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="paid">Pagas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="overdue">Vencidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total</CardTitle>
                  <CardDescription>Valor total no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pagas</CardTitle>
                  <CardDescription>Valor pago no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">A pagar</CardTitle>
                  <CardDescription>Valor pendente no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
                </CardContent>
              </Card>
            </div>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Notas Fiscais</CardTitle>
                  <CardDescription>
                    Listagem de todas as notas fiscais do período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InvoiceTable
                    invoices={filteredInvoices}
                    isLoading={isLoadingInvoices}
                    onView={handleView}
                    onEdit={handleEdit}
                    onPay={handlePay}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Fornecedores</CardTitle>
                  <CardDescription>
                    Análise dos principais fornecedores por volume financeiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupplierChart
                    title="Top Fornecedores"
                    subtitle={`Período: ${formatDate(dateRange.from)} a ${formatDate(dateRange.to)}`}
                    suppliers={topSuppliers}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Categorias</CardTitle>
                  <CardDescription>
                    Distribuição dos gastos por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryChart
                    title="Distribuição por Categoria"
                    subtitle={`Período: ${formatDate(dateRange.from)} a ${formatDate(dateRange.to)}`}
                    categories={categoryDistribution}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Tendências</CardTitle>
                  <CardDescription>
                    Análise de tendências de gastos ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center min-h-[400px]">
                  <div className="text-center">
                    <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Relatório de Tendências</p>
                    <p className="text-muted-foreground mt-2">
                      Este relatório estará disponível em uma versão futura.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
