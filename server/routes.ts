import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import { insertInvoiceSchema, insertPartnerSchema, insertCategorySchema, insertUserSchema } from "@shared/schema";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Admin middleware
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });
  
  // Supplier routes
  app.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get suppliers" });
    }
  });
  
  app.get("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to get supplier" });
    }
  });
  
  app.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      // Adiciona entityType fornecedor
      validatedData.entityType = "fornecedor";
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  
  app.put("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const validatedData = insertPartnerSchema.partial().parse(req.body);
      
      const updatedSupplier = await storage.updateSupplier(supplierId, validatedData);
      if (!updatedSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(updatedSupplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });
  
  app.delete("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const supplierId = parseInt(req.params.id);
      const success = await storage.deleteSupplier(supplierId);
      
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });
  
  // Category routes
  app.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });
  
  app.get("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const category = await storage.getCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to get category" });
    }
  });
  
  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  app.put("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateCategory(categoryId, validatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  app.delete("/api/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to get invoices" });
    }
  });
  
  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(parseInt(req.params.id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to get invoice" });
    }
  });
  
  app.post("/api/invoices", isAuthenticated, upload.fields([
    { name: 'attachmentXml', maxCount: 1 },
    { name: 'attachmentPdf', maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Add the authenticated user as the creator
      const userData = { ...req.body, createdBy: req.user!.id };
      
      // Handle file attachments - in a real app, these would be saved to a file storage
      // and the paths would be stored in the DB
      if (req.files && 'attachmentXml' in req.files) {
        userData.attachmentXml = 'xml-file-path.xml';
      }
      
      if (req.files && 'attachmentPdf' in req.files) {
        userData.attachmentPdf = 'pdf-file-path.pdf';
      }
      
      const validatedData = insertInvoiceSchema.parse(userData);
      const invoice = await storage.createInvoice(validatedData);
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  
  app.put("/api/invoices/:id", isAuthenticated, upload.fields([
    { name: 'attachmentXml', maxCount: 1 },
    { name: 'attachmentPdf', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const userData = { ...req.body };
      
      // Handle file attachments
      if (req.files && 'attachmentXml' in req.files) {
        userData.attachmentXml = 'xml-file-path.xml';
      }
      
      if (req.files && 'attachmentPdf' in req.files) {
        userData.attachmentPdf = 'pdf-file-path.pdf';
      }
      
      const validatedData = insertInvoiceSchema.partial().parse(userData);
      
      const updatedInvoice = await storage.updateInvoice(invoiceId, validatedData);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });
  
  app.delete("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const success = await storage.deleteInvoice(invoiceId);
      
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
  
  // Rota de teste TEMPORÁRIA para verificar usuários (remover em produção)
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => {
        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordType: user.password.includes(".") ? "hash" : "texto plano",
        };
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao obter usuários", error: String(error) });
    }
  });
  
  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });
  
  app.get("/api/dashboard/top-suppliers", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topSuppliers = await storage.getTopSuppliers(limit);
      res.json(topSuppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get top suppliers" });
    }
  });
  
  app.get("/api/dashboard/category-distribution", isAuthenticated, async (req, res) => {
    try {
      const distribution = await storage.getCategoryDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to get category distribution" });
    }
  });
  
  app.get("/api/dashboard/upcoming-invoices", isAuthenticated, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const invoices = await storage.getUpcomingInvoices(days);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to get upcoming invoices" });
    }
  });
  
  app.get("/api/dashboard/overdue-invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getOverdueInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to get overdue invoices" });
    }
  });

  // User management routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Não enviar as senhas para o cliente
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/register-admin", isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Hash da senha antes de salvar
      const hashedPassword = await hashPassword(validatedData.password);
      const userData = {
        ...validatedData,
        password: hashedPassword
      };
      
      const newUser = await storage.createUser(userData);
      
      // Não enviar a senha para o cliente
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verificar se não está tentando excluir o próprio usuário
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
