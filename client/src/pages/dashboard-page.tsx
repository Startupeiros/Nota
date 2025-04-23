import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { SupplierChart } from "@/components/dashboard/supplier-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/date";
import { DashboardStats, TopSupplier, CategoryDistribution, InvoiceWithRelations } from "@shared/schema";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  Eye,
  CreditCard,
  MoreHorizontal,
  Upload,
  UserPlus,
  BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);

  // Dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Top suppliers
  const { data: topSuppliers = [], isLoading: suppliersLoading } = useQuery<TopSupplier[]>({
    queryKey: ["/api/dashboard/top-suppliers"],
  });

  // Category distribution
  const { data: categoryDistribution = [], isLoading: categoriesLoading } = useQuery<CategoryDistribution[]>({
    queryKey: ["/api/dashboard/category-distribution"],
  });

  // Upcoming invoices
  const { data: upcomingInvoices = [], isLoading: invoicesLoading } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/dashboard/upcoming-invoices"],
  });

  // Alerts
  const { data: overdueInvoices = [] } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/dashboard/overdue-invoices"],
  });

  const alertItems = [
    ...(overdueInvoices.length > 0
      ? [
          {
            icon: AlertTriangle,
            message: `${overdueInvoices.length} nota${
              overdueInvoices.length > 1 ? "s" : ""
            } fiscal${overdueInvoices.length > 1 ? "is" : ""} com pagamento atrasado`,
            variant: "danger" as const,
          },
        ]
      : []),
    {
      icon: Clock,
      message: `${upcomingInvoices.length} nota${
        upcomingInvoices.length !== 1 ? "s" : ""
      } vence${upcomingInvoices.length !== 1 ? "m" : ""} esta semana`,
      variant: "warning" as const,
    },
    {
      icon: FileText,
      message: "Importe arquivos XML para facilitar o lançamento de notas",
      variant: "info" as const,
    },
  ];

  // Quick action handlers
  const handleNewInvoice = () => {
    setNewInvoiceOpen(true);
  };

  // Upcoming invoices columns
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
      cell: (row: InvoiceWithRelations) => (
        <Badge
          variant="outline"
          className="bg-amber-500 bg-opacity-20 text-amber-800 border-amber-200 px-2 py-1 rounded-full text-xs font-medium"
        >
          Pendente
        </Badge>
      ),
    },
    {
      header: "Ações",
      accessorKey: "id",
      className: "text-right",
      cell: () => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:text-primary-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-800"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Financeiro</h1>

        {/* Stats Cards */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Notas"
            value={`${dashboardStats?.totalInvoices || 0}`}
            icon={FileText}
            iconBgColor="bg-primary-100"
            iconColor="text-primary"
            footerLink="Ver todas"
          />
          <StatsCard
            title="A Pagar (Próximos 7 dias)"
            value={formatCurrency(dashboardStats?.toPay || 0)}
            icon={Clock}
            iconBgColor="bg-amber-500 bg-opacity-20"
            iconColor="text-amber-500"
            footerLink="Ver detalhes"
          />
          <StatsCard
            title="Notas Vencidas"
            value={formatCurrency(dashboardStats?.overdue || 0)}
            icon={AlertTriangle}
            iconBgColor="bg-destructive bg-opacity-20"
            iconColor="text-destructive"
            footerLink="Ação urgente"
            footerLinkColor="text-destructive hover:text-destructive"
          />
          <StatsCard
            title="Pagas (Mês atual)"
            value={formatCurrency(dashboardStats?.paid || 0)}
            icon={CheckCircle2}
            iconBgColor="bg-green-500 bg-opacity-20"
            iconColor="text-green-500"
            footerLink="Ver relatório"
          />
        </div>

        {/* Invoices and Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Upcoming Invoices */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Notas por Vencer (Próximos 30 dias)
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar</span>
                </Button>
                <Button size="sm" className="gap-1" onClick={handleNewInvoice}>
                  <Plus className="h-4 w-4" />
                  <span>Nova Nota</span>
                </Button>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <DataTable
                columns={columns}
                data={upcomingInvoices}
                isLoading={invoicesLoading}
                pagination={{
                  pageIndex: 0,
                  pageSize: 5,
                  pageCount: Math.ceil((upcomingInvoices?.length || 0) / 5),
                  onPageChange: () => {},
                  onPageSizeChange: () => {},
                }}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-6">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhuma nota fiscal a vencer</p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Quick Actions and Alerts */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={handleNewInvoice}
                  >
                    <span>Lançar Nota Fiscal</span>
                    <Plus className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Importar XML/PDF</span>
                    <Upload className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Cadastrar Fornecedor</span>
                    <UserPlus className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Gerar Relatório</span>
                    <BarChart2 className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <AlertCard title="Alertas" alerts={alertItems} />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Top Suppliers */}
          <SupplierChart
            title="Top Fornecedores"
            subtitle="Por volume financeiro (últimos 90 dias)"
            suppliers={topSuppliers}
            isLoading={suppliersLoading}
          />

          {/* Category Distribution */}
          <CategoryChart
            title="Distribuição por Categoria"
            subtitle="Últimos 90 dias"
            categories={categoryDistribution}
            isLoading={categoriesLoading}
          />
        </div>
      </div>

      {/* New Invoice Dialog */}
      <InvoiceForm open={newInvoiceOpen} onOpenChange={setNewInvoiceOpen} />
    </AppLayout>
  );
}
