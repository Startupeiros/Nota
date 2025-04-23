import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("financeiro"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnersEntity = pgTable("partners_entity", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  documentNumber: text("document_number").notNull().unique(), // CNPJ/CPF
  entityType: text("entity_type").notNull(), // "fornecedor" ou "cliente" ou "ambos"
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactName: text("contact_name"),
  bankDetails: text("bank_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceType: text("invoice_type").notNull(), // "a_pagar" ou "a_receber"
  number: text("number").notNull(),
  partnerId: integer("partner_id").notNull(), // Fornecedor ou Cliente
  categoryId: integer("category_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, paid, received, canceled
  paymentMethod: text("payment_method"), // Forma de pagamento/recebimento
  transactionDate: timestamp("transaction_date"), // Data de pagamento/recebimento
  attachmentXml: text("attachment_xml"),
  attachmentPdf: text("attachment_pdf"),
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull(),
});

// Definir as relações entre tabelas
export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
}));

export const partnersEntityRelations = relations(partnersEntity, ({ many }) => ({
  invoices: many(invoices),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  partner: one(partnersEntity, {
    fields: [invoices.partnerId],
    references: [partnersEntity.id],
  }),
  category: one(categories, {
    fields: [invoices.categoryId],
    references: [categories.id],
  }),
  creator: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas usando drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertPartnerSchema = createInsertSchema(partnersEntity).omit({
  id: true,
  createdAt: true
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Manter compatibilidade com código existente (insertSupplier -> insertPartner)
export type InsertSupplier = InsertPartner;

// Select types
export type User = typeof users.$inferSelect;
export type Partner = typeof partnersEntity.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;

// Manter compatibilidade com código existente (supplier -> partner)
export type Supplier = Partner;

// Extended schemas para validação de formulários
export const loginSchema = z.object({
  username: z.string().min(3, { message: "Nome de usuário deve ter pelo menos 3 caracteres" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Invoice com entidades relacionadas
export type InvoiceWithRelations = Invoice & {
  partner: Partner;
  category: Category;
};

// Tipos para o Dashboard
export type DashboardStats = {
  // Estatísticas gerais
  totalInvoices: number;
  // A pagar
  toPay: number;
  overduePayables: number;
  paid: number;
  // A receber
  toReceive: number;
  overdueReceivables: number;
  received: number;
  // Próximos 7 dias
  nextWeekPayables: number;
  nextWeekReceivables: number;
};

export type TopPartner = {
  id: number;
  name: string;
  total: number;
  percentage: number;
  type: string; // "fornecedor" ou "cliente"
};

export type CategoryDistribution = {
  id: number;
  name: string;
  totalPayable: number;
  totalReceivable: number;
  percentage: number;
  icon: string;
};

// Status para notas fiscais
export const invoiceStatusOptions = [
  { value: "pending", label: "Em Aberto" },
  { value: "paid", label: "Paga" },
  { value: "received", label: "Recebida" },
  { value: "canceled", label: "Cancelada" }
];

// Tipos de entidades
export const entityTypeOptions = [
  { value: "fornecedor", label: "Fornecedor" },
  { value: "cliente", label: "Cliente" },
  { value: "ambos", label: "Ambos" }
];

// Tipos de notas
export const invoiceTypeOptions = [
  { value: "a_pagar", label: "A Pagar" },
  { value: "a_receber", label: "A Receber" }
];
