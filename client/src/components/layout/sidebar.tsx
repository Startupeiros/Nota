import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Store,
  FolderOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isMobile, isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Itens de navegação básicos
  const baseNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/invoices", label: "Notas Fiscais", icon: FileText },
    { href: "/suppliers", label: "Fornecedores", icon: Store },
    { href: "/categories", label: "Categorias", icon: FolderOpen },
    { href: "/reports", label: "Relatórios", icon: BarChart3 },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];
  
  // Itens de navegação apenas para administradores
  const adminNavItems = [
    { href: "/users", label: "Usuários", icon: Users },
  ];
  
  // Combina os itens de navegação com base no perfil do usuário
  const navItems = user?.role === "admin" 
    ? [...baseNavItems, ...adminNavItems] 
    : baseNavItems;

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const sidebarClass = cn(
    "fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white border-r md:translate-x-0 md:static md:inset-0",
    isMobile && (isOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in")
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-20 transition-opacity bg-gray-500 bg-opacity-75 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={sidebarClass}>
        <div className="flex items-center justify-between h-16 bg-primary px-4">
          <span className="text-white font-bold text-lg">FinanceControl</span>
          {isMobile && (
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white p-1 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const ItemIcon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                )}
              >
                <ItemIcon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
