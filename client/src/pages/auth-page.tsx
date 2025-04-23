import React from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema } from "@shared/schema";
import { FileText, BarChart2, Shield } from "lucide-react";

export default function AuthPage() {
  const { loginMutation, user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  if (user) {
    navigate("/");
    return null;
  }

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Submit handler
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">FinanceControl</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de controle de notas fiscais e finanças
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar suas notas fiscais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome de usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Sua senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <p className="w-full text-center text-sm text-muted-foreground">
              Contate um administrador para criar uma nova conta
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8">
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="flex justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-2 text-sm font-medium">Gestão de Notas</h3>
              <p className="mt-1 text-xs text-gray-500">Controle total das suas notas fiscais</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-2 text-sm font-medium">Relatórios</h3>
              <p className="mt-1 text-xs text-gray-500">Análises financeiras detalhadas</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-2 text-sm font-medium">Segurança</h3>
              <p className="mt-1 text-xs text-gray-500">Seus dados sempre protegidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
