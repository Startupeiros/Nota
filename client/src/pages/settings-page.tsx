import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { UserCircle, Bell, Shield, Mail, Key, Monitor } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor insira um email válido.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Senha atual deve ter pelo menos 6 caracteres.",
  }),
  newPassword: z.string().min(6, {
    message: "Nova senha deve ter pelo menos 6 caracteres.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirmação de senha deve ter pelo menos 6 caracteres.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  invoiceDue: z.boolean(),
  invoiceOverdue: z.boolean(),
  systemUpdates: z.boolean(),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      invoiceDue: true,
      invoiceOverdue: true,
      systemUpdates: false,
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
    toast({
      title: "Senha atualizada",
      description: "Sua senha foi alterada com sucesso.",
    });
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const onNotificationsSubmit = (data: z.infer<typeof notificationsFormSchema>) => {
    toast({
      title: "Preferências de notificação atualizadas",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  return (
    <AppLayout>
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>

        <div className="mt-6">
          <Tabs defaultValue="profile">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64">
                <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
                  <TabsTrigger
                    value="profile"
                    className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Senha
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Aparência
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-muted"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Segurança
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 space-y-4">
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações de Perfil</CardTitle>
                      <CardDescription>
                        Atualize suas informações pessoais aqui.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Seu nome" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="seu.email@empresa.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Salvar alterações</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Alterar Senha</CardTitle>
                      <CardDescription>
                        Atualize sua senha para manter sua conta segura.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha Atual</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nova Senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar Nova Senha</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Atualizar Senha</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferências de Notificação</CardTitle>
                      <CardDescription>
                        Configure como você deseja receber notificações do sistema.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...notificationsForm}>
                        <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                          <FormField
                            control={notificationsForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Notificações por Email</FormLabel>
                                  <FormDescription>
                                    Receba notificações por email sobre atividades importantes.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationsForm.control}
                            name="invoiceDue"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Notas a Vencer</FormLabel>
                                  <FormDescription>
                                    Alertas para notas fiscais próximas do vencimento.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationsForm.control}
                            name="invoiceOverdue"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Notas Vencidas</FormLabel>
                                  <FormDescription>
                                    Alertas para notas fiscais que já venceram.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={notificationsForm.control}
                            name="systemUpdates"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Atualizações do Sistema</FormLabel>
                                  <FormDescription>
                                    Notificações sobre novas funcionalidades e atualizações.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Salvar preferências</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aparência</CardTitle>
                      <CardDescription>
                        Personalize a aparência da interface do sistema.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center min-h-[300px]">
                      <div className="text-center">
                        <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Personalização da interface</p>
                        <p className="text-muted-foreground mt-2">
                          Esta funcionalidade estará disponível em versões futuras.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Segurança</CardTitle>
                      <CardDescription>
                        Gerencie configurações de segurança da sua conta.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center min-h-[300px]">
                      <div className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Configurações de segurança</p>
                        <p className="text-muted-foreground mt-2">
                          Esta funcionalidade estará disponível em versões futuras.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
