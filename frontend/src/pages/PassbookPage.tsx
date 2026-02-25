import React, { useState } from 'react';
import { useGetPassbook } from '../hooks/useQueries';
import { Variant_deposit_withdrawal } from '../backend';
import { Search, Printer, Loader2, BookOpen } from 'lucide-react';
import { formatCurrency, formatDateFromNano } from '../utils/exportCSV';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';

export default function PassbookPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Determine role from backend
  const { data: userRole } = useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });

  const isAdmin = userRole === 'admin';

  const [inputAccountNumber, setInputAccountNumber] = useState('');
  const [searchAccountNumber, setSearchAccountNumber] = useState('');

  const { data: passbook, isLoading, error } = useGetPassbook(searchAccountNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAccountNumber(inputAccountNumber);
  };

  const handlePrint = () => {
    window.print();
  };

  const sortedTxs = passbook?.transactions
    ? [...passbook.transactions].sort((a, b) => Number(a.date - b.date))
    : [];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground">Passbook</h2>
        <p className="text-muted-foreground text-sm">View complete account statement</p>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5 no-print">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={inputAccountNumber}
            onChange={e => setInputAccountNumber(e.target.value)}
            placeholder="Enter account number"
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 shadow-md"
            style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 20), oklch(0.58 0.24 35))' }}
          >
            <Search className="w-4 h-4" />
            View
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
          Account not found. Please check the account number.
        </div>
      )}

      {passbook && !isLoading && !error && (
        <div className="space-y-4">
          {/* Print Button */}
          <div className="flex justify-end no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Passbook
            </button>
          </div>

          {/* Passbook Header */}
          <div className="rounded-2xl overflow-hidden shadow-card">
            <div
              className="p-5 text-white"
              style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.45 0.25 290))' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Student Bank Passbook</h3>
                  <p className="text-white/70 text-sm">Account Statement</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide">Account Number</p>
                  <p className="font-mono font-bold">{passbook.account?.accountNumber ?? '-'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide">IFSC Code</p>
                  <p className="font-mono font-bold">{passbook.account?.ifscCode ?? '-'}</p>
                </div>
              </div>
            </div>

            {/* Student & Bank Info */}
            <div className="bg-card grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
              <div className="p-4">
                <h4 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
                  Student Information
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-right">{passbook.student?.name ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Class</span>
                    <span>{passbook.student?.studentClass ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">School</span>
                    <span className="text-right">{passbook.student?.schoolName ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Taluka</span>
                    <span>{passbook.student?.taluka ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">District</span>
                    <span>{passbook.student?.district ?? '-'}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
                  Account Information
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Account No</span>
                    <span className="font-mono font-semibold">{passbook.account?.accountNumber ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Bank</span>
                    <span>{passbook.bankDetail?.name ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">IFSC</span>
                    <span className="font-mono">{passbook.account?.ifscCode ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Initial Amt</span>
                    <span className="font-semibold">{formatCurrency(passbook.account?.initialAmount ?? BigInt(0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Transactions ({sortedTxs.length} records)
              </h3>
            </div>
            {sortedTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <BookOpen className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No transactions found</p>
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
                    {sortedTxs.map((tx, i) => (
                      <tr
                        key={String(tx.id)}
                        className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                      >
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
