import React, { useState, useEffect } from 'react';
import { Account } from '../backend';
import { useAddAccount, useUpdateAccount, useGetAllStudents, useGetAllBankDetails } from '../hooks/useQueries';
import { X, Loader2 } from 'lucide-react';

interface Props {
  account: Account | null;
  onClose: () => void;
}

export default function AccountFormModal({ account, onClose }: Props) {
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const { data: students } = useGetAllStudents();
  const { data: banks } = useGetAllBankDetails();

  const [form, setForm] = useState({
    studentId: '',
    bankId: '',
    accountNumber: '',
    initialAmount: '',
    ifscCode: '',
  });
  const [autoClass, setAutoClass] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setForm({
        studentId: String(account.studentId),
        bankId: String(account.bankId),
        accountNumber: account.accountNumber,
        initialAmount: String(account.initialAmount),
        ifscCode: account.ifscCode,
      });
      const s = students?.find(s => s.id === account.studentId);
      if (s) setAutoClass(s.studentClass);
    }
  }, [account, students]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setForm(prev => ({ ...prev, studentId: id }));
    const s = students?.find(s => String(s.id) === id);
    setAutoClass(s?.studentClass ?? '');
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setForm(prev => ({ ...prev, bankId: id }));
    const b = banks?.find(b => String(b.id) === id);
    if (b) setForm(prev => ({ ...prev, bankId: id, ifscCode: b.ifscCode }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.studentId || !form.bankId || !form.accountNumber || !form.initialAmount || !form.ifscCode) {
      setError('All fields are required');
      return;
    }
    try {
      const data = {
        studentId: BigInt(form.studentId),
        bankId: BigInt(form.bankId),
        accountNumber: form.accountNumber,
        initialAmount: BigInt(form.initialAmount),
        ifscCode: form.ifscCode,
      };
      if (account) {
        await updateAccount.mutateAsync({ id: account.id, ...data });
      } else {
        await addAccount.mutateAsync(data);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
    }
  };

  const isPending = addAccount.isPending || updateAccount.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border/50 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <h3 className="font-heading font-bold text-foreground">
              {account ? 'Edit Account' : 'New Account'}
            </h3>
            <p className="text-xs text-muted-foreground">Fill in the account details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Student Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Student Name</label>
            <select
              value={form.studentId}
              onChange={handleStudentChange}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              required
            >
              <option value="">Select student...</option>
              {students?.map(s => (
                <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Auto Class */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Class (Auto)</label>
            <input
              type="text"
              value={autoClass}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
              placeholder="Auto-filled from student"
            />
          </div>

          {/* Bank Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Bank Name</label>
            <select
              value={form.bankId}
              onChange={handleBankChange}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              required
            >
              <option value="">Select bank...</option>
              {banks?.map(b => (
                <option key={String(b.id)} value={String(b.id)}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              required
            />
          </div>

          {/* Initial Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Initial Amount (₹)</label>
            <input
              type="number"
              name="initialAmount"
              value={form.initialAmount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              required
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={form.ifscCode}
              onChange={handleChange}
              placeholder="e.g. SBIN0001234"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-mono"
              required
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
              {error}
            </div>
          )}
        </form>

        <div className="p-5 border-t border-border/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, oklch(0.72 0.19 55), oklch(0.65 0.22 35))' }}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {account ? 'Update' : 'Save'} Account
          </button>
        </div>
      </div>
    </div>
  );
}
