import React, { useState } from 'react';
import { useGetAllAccounts, useGetAllStudents, useGetAllBankDetails, useDeleteAccount } from '../hooks/useQueries';
import { Account } from '../backend';
import { Plus, Pencil, Trash2, Loader2, Search, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/exportCSV';
import AccountFormModal from '../components/AccountFormModal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

export default function AccountPage() {
  const { data: accounts, isLoading } = useGetAllAccounts();
  const { data: students } = useGetAllStudents();
  const { data: banks } = useGetAllBankDetails();
  const deleteAccount = useDeleteAccount();
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [search, setSearch] = useState('');

  const getStudentName = (studentId: bigint) =>
    students?.find(s => s.id === studentId)?.name ?? 'Unknown';
  const getStudentClass = (studentId: bigint) =>
    students?.find(s => s.id === studentId)?.studentClass ?? '-';
  const getBankName = (bankId: bigint) =>
    banks?.find(b => b.id === bankId)?.name ?? 'Unknown';

  const filtered = accounts?.filter(a =>
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    getStudentName(a.studentId).toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteAccount.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Accounts</h2>
          <p className="text-muted-foreground text-sm">{accounts?.length ?? 0} bank accounts</p>
        </div>
        <button
          onClick={() => { setEditAccount(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, oklch(0.72 0.19 55), oklch(0.65 0.22 35))' }}
        >
          <Plus className="w-4 h-4" />
          New Account
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CreditCard className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No accounts found</p>
            <p className="text-sm">Create a new account to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Account No.</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Bank</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Initial Amt</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">IFSC</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={String(a.id)} className={`border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{getStudentName(a.studentId)}</p>
                        <p className="text-xs text-muted-foreground">Class {getStudentClass(a.studentId)}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{a.accountNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded-lg">{a.accountNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getBankName(a.bankId)}</td>
                    <td className="px-4 py-3 font-semibold text-foreground hidden md:table-cell">{formatCurrency(a.initialAmount)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden lg:table-cell">{a.ifscCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditAccount(a); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <AccountFormModal
          account={editAccount}
          onClose={() => { setShowForm(false); setEditAccount(null); }}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? All associated transactions will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
