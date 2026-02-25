import React, { useState, useMemo } from 'react';
import {
  useGetAllAccounts, useGetAllStudents, useGetAllTransactions, useAddTransaction
} from '../hooks/useQueries';
import { Variant_deposit_withdrawal } from '../backend';
import { Loader2, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDateFromNano } from '../utils/exportCSV';

export default function TransactionPage() {
  const { data: accounts } = useGetAllAccounts();
  const { data: students } = useGetAllStudents();
  const { data: transactions, isLoading: txLoading } = useGetAllTransactions();
  const addTransaction = useAddTransaction();

  const [form, setForm] = useState({
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    transactionType: Variant_deposit_withdrawal.deposit as Variant_deposit_withdrawal,
    amount: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedAccount = accounts?.find(a => String(a.id) === form.accountId);
  const selectedStudent = students?.find(s => s.id === selectedAccount?.studentId);

  // Calculate current balance for selected account
  const currentBalance = useMemo(() => {
    if (!selectedAccount) return 0;
    const initial = Number(selectedAccount.initialAmount);
    const accountTxs = transactions?.filter(t => t.accountId === selectedAccount.id) ?? [];
    const deposits = accountTxs.filter(t => t.transactionType === Variant_deposit_withdrawal.deposit).reduce((s, t) => s + Number(t.amount), 0);
    const withdrawals = accountTxs.filter(t => t.transactionType === Variant_deposit_withdrawal.withdrawal).reduce((s, t) => s + Number(t.amount), 0);
    return initial + deposits - withdrawals;
  }, [selectedAccount, transactions]);

  const amount = Number(form.amount) || 0;
  const totalAmount = form.transactionType === Variant_deposit_withdrawal.deposit
    ? currentBalance + amount
    : currentBalance - amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.accountId || !form.date || !form.amount || !form.reason) {
      setError('All fields are required');
      return;
    }
    if (form.transactionType === Variant_deposit_withdrawal.withdrawal && amount > currentBalance) {
      setError('Insufficient balance for withdrawal');
      return;
    }
    try {
      const dateNano = BigInt(new Date(form.date).getTime()) * BigInt(1_000_000);
      await addTransaction.mutateAsync({
        accountId: BigInt(form.accountId),
        date: dateNano,
        transactionType: form.transactionType,
        amount: BigInt(form.amount),
        reason: form.reason,
        totalAmount: BigInt(Math.max(0, totalAmount)),
      });
      setSuccess('Transaction recorded successfully!');
      setForm(prev => ({ ...prev, accountId: '', amount: '', reason: '' }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record transaction');
    }
  };

  const recentTxs = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].reverse().slice(0, 20);
  }, [transactions]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground">Transactions</h2>
        <p className="text-muted-foreground text-sm">Record deposits and withdrawals</p>
      </div>

      {/* Transaction Form */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">New Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Number</label>
            <select
              value={form.accountId}
              onChange={e => setForm(prev => ({ ...prev, accountId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            >
              <option value="">Select account...</option>
              {accounts?.map(a => (
                <option key={String(a.id)} value={String(a.id)}>{a.accountNumber}</option>
              ))}
            </select>
          </div>

          {/* Auto-filled fields */}
          {selectedAccount && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Student Name</label>
                <input
                  type="text"
                  value={selectedStudent?.name ?? ''}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Current Balance</label>
                <input
                  type="text"
                  value={`₹${currentBalance.toLocaleString('en-IN')}`}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm font-semibold text-foreground cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, transactionType: Variant_deposit_withdrawal.deposit }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.transactionType === Variant_deposit_withdrawal.deposit
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-border text-muted-foreground hover:border-green-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, transactionType: Variant_deposit_withdrawal.withdrawal }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.transactionType === Variant_deposit_withdrawal.withdrawal
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-border text-muted-foreground hover:border-red-300'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Withdrawal
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₹)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
              min="1"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Reason</label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for transaction"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
          </div>

          {/* Total Amount */}
          {form.accountId && form.amount && (
            <div className={`rounded-xl p-4 ${
              form.transactionType === Variant_deposit_withdrawal.deposit
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount After Transaction</p>
              <p className={`text-xl font-heading font-bold ${
                form.transactionType === Variant_deposit_withdrawal.deposit ? 'text-green-700' : 'text-red-700'
              }`}>
                ₹{Math.max(0, totalAmount).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={addTransaction.isPending}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 shadow-md"
            style={{ background: 'linear-gradient(135deg, oklch(0.6 0.22 320), oklch(0.52 0.25 340))' }}
          >
            {addTransaction.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit Transaction
          </button>
        </form>
      </div>

      {/* Transaction History Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-heading font-semibold text-sm text-foreground">Recent Transactions</h3>
        </div>
        {txLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recentTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <ArrowLeftRight className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Account</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Type</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Balance</th>
                </tr>
              </thead>
              <tbody>
                {recentTxs.map((tx, i) => {
                  const acc = accounts?.find(a => a.id === tx.accountId);
                  return (
                    <tr key={String(tx.id)} className={`border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{acc?.accountNumber ?? '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{formatDateFromNano(tx.date)}</td>
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
                      <td className="px-4 py-3 text-right font-semibold text-foreground hidden md:table-cell">
                        {formatCurrency(tx.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
