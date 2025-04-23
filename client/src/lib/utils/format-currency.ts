export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

export function parseCurrency(value: string): number | null {
  if (!value) return null;
  
  // Remove R$, spaces, and replace comma with dot
  const numericString = value
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  const result = parseFloat(numericString);
  
  return isNaN(result) ? null : result;
}
