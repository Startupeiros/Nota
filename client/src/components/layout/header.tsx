import React, { useState } from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b">
      <button
        onClick={onMenuClick}
        className="px-4 text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 flex justify-between px-4 md:px-0">
        <div className="flex-1 flex items-center ml-4">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              className="block w-full pl-10 pr-3 py-2 border rounded-md"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive text-white text-[10px] leading-none" />
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm text-gray-700 hidden md:block">
                  {user?.name || "Usuário"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
