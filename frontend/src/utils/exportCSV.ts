export function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDateFromNano(nanoTs: bigint): string {
  const ms = Number(nanoTs / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-IN');
}

export function formatCurrency(amount: bigint): string {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function dateToNano(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

export function nanoToDateInput(nanoTs: bigint): string {
  const ms = Number(nanoTs / BigInt(1_000_000));
  const d = new Date(ms);
  return d.toISOString().split('T')[0];
}
