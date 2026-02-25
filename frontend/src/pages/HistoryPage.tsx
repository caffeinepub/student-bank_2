import React, { useState, useRef } from 'react';
import { useGetAllAccounts, useGetAllStudents, useGetAllBankDetails, useGetTransactionHistory } from '../hooks/useQueries';
import { Variant_deposit_withdrawal } from '../backend';
import { Search, Printer, Download, Loader2, History } from 'lucide-react';
import { formatCurrency, formatDateFromNano, exportCSV } from '../utils/exportCSV';

export default function HistoryPage() {
  const { data: accounts } = useGetAllAccounts();
  const { data: students } = useGetAllStudents();
  const { data: banks } = useGetAllBankDetails();

  const [accountNumber, setAccountNumber] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchParams, setSearchParams] = useState<{ accountNumber: string; dateFrom: bigint | null; dateTo: bigint | null } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: historyTxs, isLoading, error } = useGetTransactionHistory(
    searchParams?.accountNumber ?? '',
    searchParams?.dateFrom ?? null,
    searchParams?.dateTo ?? null
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !dateFrom || !dateTo) return;
    const from = BigInt(new Date(dateFrom).getTime()) * BigInt(1_000_000);
    const to = BigInt(new Date(dateTo + 'T23:59:59').getTime()) * BigInt(1_000_000);
    setSearchParams({ accountNumber, dateFrom: from, dateTo: to });
  };

  const selectedAccount = accounts?.find(a => a.accountNumber === (searchParams?.accountNumber ?? ''));
  const selectedStudent = students?.find(s => s.id === selectedAccount?.studentId);
  const selectedBank = banks?.find(b => b.id === selectedAccount?.bankId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!historyTxs || historyTxs.length === 0) return;
    const data = historyTxs.map(tx => ({
      'Account Number': selectedAccount?.accountNumber ?? '',
      'Student Name': selectedStudent?.name ?? '',
      'Date': formatDateFromNano(tx.date),
      'Type': tx.transactionType,
      'Amount': Number(tx.amount),
      'Reason': tx.reason,
      'Balance': Number(tx.totalAmount),
    }));
    exportCSV(data, `history_${accountNumber}`);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground">Transaction History</h2>
        <p className="text-muted-foreground text-sm">Search and filter transaction records</p>
      </div>

      {/* Search Form */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5 no-print">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md"
            style={{ background: 'linear-gradient(135deg, oklch(0.58 0.18 195), oklch(0.5 0.2 210))' }}
          >
            <Search className="w-4 h-4" />
            Search Transactions
          </button>
        </form>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
          Account not found or error fetching data.
        </div>
      )}

      {searchParams && !isLoading && !error && (
        <div ref={printRef} className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={!historyTxs || historyTxs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, oklch(0.62 0.2 145), oklch(0.55 0.22 165))' }}
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>

          {/* Student & Bank Info */}
          {selectedStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <h4 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">Student Information</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-semibold">{selectedStudent.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Class:</span><span>{selectedStudent.studentClass}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">School:</span><span>{selectedStudent.schoolName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Taluka:</span><span>{selectedStudent.taluka}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">District:</span><span>{selectedStudent.district}</span></div>
                </div>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <h4 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">Account Information</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Account No:</span><span className="font-mono font-semibold">{selectedAccount?.accountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span><span>{selectedBank?.name ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IFSC:</span><span className="font-mono">{selectedAccount?.ifscCode}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Initial Amt:</span><span className="font-semibold">{formatCurrency(selectedAccount?.initialAmount ?? BigInt(0))}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Transactions ({historyTxs?.length ?? 0} records)
              </h3>
            </div>
            {!historyTxs || historyTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <History className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No transactions found for this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Type</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Reason</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyTxs.map((tx, i) => (
                      <tr key={String(tx.id)} className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateFromNano(tx.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tx.transactionType === Variant_deposit_withdrawal.deposit
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.transactionType === Variant_deposit_withdrawal.deposit ? '↑ Deposit' : '↓ Withdraw'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          tx.transactionType === Variant_deposit_withdrawal.deposit ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.transactionType === Variant_deposit_withdrawal.deposit ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{tx.reason}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(tx.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
