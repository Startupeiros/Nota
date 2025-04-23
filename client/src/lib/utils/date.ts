import { format, parseISO, isValid, formatDistanceToNow, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
}

export function getInvoiceStatus(dueDate: string | Date, status: string, paymentDate?: string | Date | null): 'overdue' | 'due' | 'paid' {
  if (status === 'paid') return 'paid';
  
  const now = new Date();
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  
  if (isBefore(dueDateObj, now)) {
    return 'overdue';
  }
  
  return 'due';
}

export function isOverdue(dueDate: string | Date): boolean {
  const now = new Date();
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  
  return isBefore(dueDateObj, now);
}

export function isDueSoon(dueDate: string | Date, days: number = 7): boolean {
  const now = new Date();
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return isAfter(dueDateObj, now) && isBefore(dueDateObj, futureDate);
}
