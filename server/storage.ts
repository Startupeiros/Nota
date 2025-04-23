import { 
  User, 
  InsertUser, 
  Partner,
  InsertPartner,
  Supplier, 
  InsertSupplier, 
  Category, 
  InsertCategory, 
  Invoice, 
  InsertInvoice,
  InvoiceWithRelations,
  DashboardStats,
  TopPartner,
  CategoryDistribution
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Partner operations (fornecedores e clientes)
  getPartner(id: number): Promise<Partner | undefined>;
  getPartners(type?: string): Promise<Partner[]>; // tipo opcional: "fornecedor", "cliente", "ambos" 
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: number): Promise<boolean>;
  
  // Manter compatibilidade com código existente
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Invoice operations
  getInvoice(id: number): Promise<InvoiceWithRelations | undefined>;
  getInvoices(type?: string): Promise<InvoiceWithRelations[]>; // tipo opcional: "a_pagar", "a_receber"
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getTopPartners(limit: number, type?: string): Promise<TopPartner[]>; // tipo opcional: "fornecedor", "cliente"
  getCategoryDistribution(): Promise<CategoryDistribution[]>;
  getUpcomingInvoices(days: number, type?: string): Promise<InvoiceWithRelations[]>; // tipo opcional: "a_pagar", "a_receber"
  getOverdueInvoices(type?: string): Promise<InvoiceWithRelations[]>; // tipo opcional: "a_pagar", "a_receber"
  
  // Manter compatibilidade com código existente
  getTopSuppliers(limit: number): Promise<TopPartner[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partners: Map<number, Partner>;
  private categories: Map<number, Category>;
  private invoices: Map<number, Invoice>;
  
  currentUserId: number;
  currentPartnerId: number;
  currentCategoryId: number;
  currentInvoiceId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.categories = new Map();
    this.invoices = new Map();
    
    this.currentUserId = 1;
    this.currentPartnerId = 1;
    this.currentCategoryId = 1;
    this.currentInvoiceId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add default categories
    this.createCategory({ name: "Aluguel/Instalações", description: "Despesas com aluguel e manutenção de instalações" });
    this.createCategory({ name: "Equipamentos", description: "Compra e manutenção de equipamentos" });
    this.createCategory({ name: "Serviços", description: "Prestação de serviços diversos" });
    this.createCategory({ name: "Materiais", description: "Materiais de escritório e consumíveis" });
    this.createCategory({ name: "Vendas", description: "Vendas de produtos ou serviços" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    // Garantir que role tenha um valor padrão se não fornecido
    const userWithDefaults: InsertUser = {
      ...insertUser,
      role: insertUser.role || "financeiro"
    };
    
    const user: User = { ...userWithDefaults, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Partner methods
  async getPartner(id: number): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getPartners(type?: string): Promise<Partner[]> {
    if (!type) {
      return Array.from(this.partners.values());
    }
    return Array.from(this.partners.values()).filter(
      partner => partner.entityType === type || partner.entityType === "ambos"
    );
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = this.currentPartnerId++;
    const now = new Date();
    
    // Ensure optional fields are at least null, not undefined
    const partnerWithDefaults: InsertPartner = {
      ...insertPartner,
      email: insertPartner.email || null,
      phone: insertPartner.phone || null,
      address: insertPartner.address || null,
      contactName: insertPartner.contactName || null,
      bankDetails: insertPartner.bankDetails || null,
    };
    
    const partner: Partner = { 
      ...partnerWithDefaults, 
      id, 
      createdAt: now 
    };
    
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: number, partnerData: Partial<InsertPartner>): Promise<Partner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...partnerData };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<boolean> {
    return this.partners.delete(id);
  }
  
  // Métodos de compatibilidade com Supplier
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const partner = await this.getPartner(id);
    if (!partner || (partner.entityType !== "fornecedor" && partner.entityType !== "ambos")) {
      return undefined;
    }
    return partner as Supplier;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return (await this.getPartners("fornecedor")) as Supplier[];
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    // Convert to partner with entityType = "fornecedor"
    const partnerData: InsertPartner = {
      ...insertSupplier,
      entityType: "fornecedor",
    };
    
    const partner = await this.createPartner(partnerData);
    return partner as Supplier;
  }

  async updateSupplier(id: number, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const partnerData: Partial<InsertPartner> = { ...supplierData };
    
    const partner = await this.updatePartner(id, partnerData);
    return partner as Supplier | undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.deletePartner(id);
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const now = new Date();
    const category: Category = { ...insertCategory, id, createdAt: now };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Invoice methods
  async getInvoice(id: number): Promise<InvoiceWithRelations | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const partner = this.partners.get(invoice.partnerId);
    const category = this.categories.get(invoice.categoryId);
    
    if (!partner || !category) return undefined;
    
    return {
      ...invoice,
      partner,
      category
    };
  }

  async getInvoices(type?: string): Promise<InvoiceWithRelations[]> {
    const invoices = Array.from(this.invoices.values())
      .filter(invoice => !type || invoice.invoiceType === type);
      
    return invoices.map(invoice => {
      const partner = this.partners.get(invoice.partnerId);
      const category = this.categories.get(invoice.categoryId);
      
      if (!partner || !category) return null;
      
      return {
        ...invoice,
        partner,
        category
      };
    }).filter((invoice): invoice is InvoiceWithRelations => invoice !== null);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const now = new Date();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: now,
      amount: typeof insertInvoice.amount === 'string' 
        ? parseFloat(insertInvoice.amount) 
        : insertInvoice.amount
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { 
      ...invoice, 
      ...invoiceData,
      amount: invoiceData.amount !== undefined
        ? (typeof invoiceData.amount === 'string' 
          ? parseFloat(invoiceData.amount) 
          : invoiceData.amount)
        : invoice.amount
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const invoices = Array.from(this.invoices.values());
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    const totalInvoices = invoices.length;
    
    // Filtrar por notas a pagar
    const invoicesPagar = invoices.filter(invoice => invoice.invoiceType === "a_pagar");
    // Filtrar por notas a receber
    const invoicesReceber = invoices.filter(invoice => invoice.invoiceType === "a_receber");
    
    // A pagar dentro de 7 dias
    const toPay = invoicesPagar
      .filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) <= sevenDaysFromNow && 
        new Date(invoice.dueDate) >= now
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    
    // A pagar vencidas
    const overduePayables = invoicesPagar
      .filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) < now
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    
    // Pagas no mês atual
    const paid = invoicesPagar
      .filter(invoice => 
        invoice.status === 'paid' && 
        invoice.transactionDate && 
        new Date(invoice.transactionDate).getMonth() === now.getMonth() &&
        new Date(invoice.transactionDate).getFullYear() === now.getFullYear()
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    
    // A receber dentro de 7 dias
    const toReceive = invoicesReceber
      .filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) <= sevenDaysFromNow && 
        new Date(invoice.dueDate) >= now
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    
    // A receber vencidas
    const overdueReceivables = invoicesReceber
      .filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) < now
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    
    // Recebidas no mês atual
    const received = invoicesReceber
      .filter(invoice => 
        invoice.status === 'received' && 
        invoice.transactionDate && 
        new Date(invoice.transactionDate).getMonth() === now.getMonth() &&
        new Date(invoice.transactionDate).getFullYear() === now.getFullYear()
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    
    // Próximos 7 dias
    const nextWeekPayables = invoicesPagar
      .filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) <= sevenDaysFromNow && 
        new Date(invoice.dueDate) >= now
      )
      .length;
    
    const nextWeekReceivables = invoicesReceber
      .filter(invoice => 
        invoice.status === 'pending' && 
        new Date(invoice.dueDate) <= sevenDaysFromNow && 
        new Date(invoice.dueDate) >= now
      )
      .length;
    
    return {
      totalInvoices,
      toPay,
      overduePayables,
      paid,
      toReceive,
      overdueReceivables,
      received,
      nextWeekPayables,
      nextWeekReceivables
    };
  }

  async getTopPartners(limit: number, type?: string): Promise<TopPartner[]> {
    const invoices = Array.from(this.invoices.values());
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    // Get invoices from last 90 days
    const recentInvoices = invoices.filter(invoice => 
      new Date(invoice.issueDate) >= threeMonthsAgo &&
      (!type || (type === "fornecedor" && invoice.invoiceType === "a_pagar") || 
               (type === "cliente" && invoice.invoiceType === "a_receber"))
    );
    
    // Group by partner and sum amounts
    const partnerTotals = new Map<number, number>();
    
    recentInvoices.forEach(invoice => {
      const partnerId = invoice.partnerId;
      const currentTotal = partnerTotals.get(partnerId) || 0;
      partnerTotals.set(partnerId, currentTotal + Number(invoice.amount));
    });
    
    // Convert to array, sort by total, and take top N
    const topPartners = Array.from(partnerTotals.entries())
      .map(([partnerId, total]) => {
        const partner = this.partners.get(partnerId);
        return {
          id: partnerId,
          name: partner?.name || "Unknown",
          total,
          percentage: 0, // Will be calculated below
          type: partner?.entityType || "desconhecido"
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
    
    // Calculate percentages
    const grandTotal = topPartners.reduce((sum, partner) => sum + partner.total, 0);
    
    if (grandTotal > 0) {
      topPartners.forEach(partner => {
        partner.percentage = (partner.total / grandTotal) * 100;
      });
    }
    
    return topPartners;
  }
  
  // Manter compatibilidade com código existente
  async getTopSuppliers(limit: number): Promise<TopPartner[]> {
    return this.getTopPartners(limit, "fornecedor");
  }

  async getCategoryDistribution(): Promise<CategoryDistribution[]> {
    const invoices = Array.from(this.invoices.values());
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    // Get invoices from last 90 days
    const recentInvoices = invoices.filter(invoice => 
      new Date(invoice.issueDate) >= threeMonthsAgo
    );
    
    // Group by category and sum amounts separando a pagar e a receber
    const categoryPayable = new Map<number, number>();
    const categoryReceivable = new Map<number, number>();
    
    recentInvoices.forEach(invoice => {
      const categoryId = invoice.categoryId;
      const amount = Number(invoice.amount);
      
      if (invoice.invoiceType === "a_pagar") {
        const currentTotal = categoryPayable.get(categoryId) || 0;
        categoryPayable.set(categoryId, currentTotal + amount);
      } else if (invoice.invoiceType === "a_receber") {
        const currentTotal = categoryReceivable.get(categoryId) || 0;
        categoryReceivable.set(categoryId, currentTotal + amount);
      }
    });
    
    // Define icons for categories
    const categoryIcons: Record<string, string> = {
      "Aluguel/Instalações": "building",
      "Equipamentos": "computer",
      "Serviços": "service",
      "Materiais": "archive"
    };
    
    // Collect all unique category IDs
    const categoryIds = new Set<number>();
    categoryPayable.forEach((_, id) => categoryIds.add(id));
    categoryReceivable.forEach((_, id) => categoryIds.add(id));
    
    // Convert to array with payable and receivable totals
    const distribution: CategoryDistribution[] = Array.from(categoryIds).map(categoryId => {
      const category = this.categories.get(categoryId);
      const totalPayable = categoryPayable.get(categoryId) || 0;
      const totalReceivable = categoryReceivable.get(categoryId) || 0;
      const total = totalPayable + totalReceivable;
      
      return {
        id: categoryId,
        name: category?.name || "Unknown",
        totalPayable,
        totalReceivable,
        percentage: 0, // Will be calculated below
        icon: categoryIcons[category?.name || ""] || "folder"
      };
    });
    
    // Calculate percentages
    const grandTotal = distribution.reduce((sum, category) => sum + category.totalPayable + category.totalReceivable, 0);
    
    if (grandTotal > 0) {
      distribution.forEach(category => {
        category.percentage = ((category.totalPayable + category.totalReceivable) / grandTotal) * 100;
      });
    }
    
    // Sort by total amount (payable + receivable)
    return distribution.sort((a, b) => 
      (b.totalPayable + b.totalReceivable) - (a.totalPayable + a.totalReceivable)
    );
  }

  async getUpcomingInvoices(days: number, type?: string): Promise<InvoiceWithRelations[]> {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    
    const invoices = Array.from(this.invoices.values())
      .filter(invoice => 
        invoice.status === 'pending' &&
        new Date(invoice.dueDate) >= now &&
        new Date(invoice.dueDate) <= futureDate &&
        (!type || invoice.invoiceType === type)
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    return invoices.map(invoice => {
      const partner = this.partners.get(invoice.partnerId);
      const category = this.categories.get(invoice.categoryId);
      
      if (!partner || !category) return null;
      
      return {
        ...invoice,
        partner,
        category
      };
    }).filter((invoice): invoice is InvoiceWithRelations => invoice !== null);
  }

  async getOverdueInvoices(type?: string): Promise<InvoiceWithRelations[]> {
    const now = new Date();
    
    const invoices = Array.from(this.invoices.values())
      .filter(invoice => 
        invoice.status === 'pending' &&
        new Date(invoice.dueDate) < now &&
        (!type || invoice.invoiceType === type)
      )
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    
    return invoices.map(invoice => {
      const partner = this.partners.get(invoice.partnerId);
      const category = this.categories.get(invoice.categoryId);
      
      if (!partner || !category) return null;
      
      return {
        ...invoice,
        partner,
        category
      };
    }).filter((invoice): invoice is InvoiceWithRelations => invoice !== null);
  }
}

export const storage = new MemStorage();
