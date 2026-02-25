import React from 'react';
import { useGetAllStudents, useGetAllAccounts, useGetAllTransactions } from '../hooks/useQueries';
import { Variant_deposit_withdrawal } from '../backend';
import { Users, CreditCard, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/exportCSV';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  shadowClass: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, gradient, shadowClass, loading }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 text-white ${gradient} ${shadowClass} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{title}</p>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white/60 mt-1" />
          ) : (
            <p className="text-2xl font-heading font-bold">{value}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: students, isLoading: studentsLoading } = useGetAllStudents();
  const { data: accounts, isLoading: accountsLoading } = useGetAllAccounts();
  const { data: transactions, isLoading: txLoading } = useGetAllTransactions();

  const totalDeposit = transactions
    ?.filter(t => t.transactionType === Variant_deposit_withdrawal.deposit)
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const totalWithdrawal = transactions
    ?.filter(t => t.transactionType === Variant_deposit_withdrawal.withdrawal)
    .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const totalInitial = accounts?.reduce((sum, a) => sum + Number(a.initialAmount), 0) ?? 0;
  const balance = totalInitial + totalDeposit - totalWithdrawal;

  const isLoading = studentsLoading || accountsLoading || txLoading;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm">Real-time banking statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Students"
          value={students?.length ?? 0}
          icon={<Users className="w-6 h-6 text-white" />}
          gradient="gradient-primary"
          shadowClass="card-shadow"
          loading={isLoading}
        />
        <StatCard
          title="Total Accounts"
          value={accounts?.length ?? 0}
          icon={<CreditCard className="w-6 h-6 text-white" />}
          gradient="gradient-green"
          shadowClass="card-shadow-green"
          loading={isLoading}
        />
        <StatCard
          title="Total Deposits"
          value={formatCurrency(BigInt(totalDeposit))}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          gradient="gradient-orange"
          shadowClass="card-shadow-orange"
          loading={isLoading}
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(BigInt(totalWithdrawal))}
          icon={<TrendingDown className="w-6 h-6 text-white" />}
          gradient="gradient-pink"
          shadowClass="card-shadow-pink"
          loading={isLoading}
        />
        <div className="sm:col-span-2">
          <StatCard
            title="Current Balance"
            value={formatCurrency(BigInt(balance))}
            icon={<Wallet className="w-6 h-6 text-white" />}
            gradient="gradient-teal"
            shadowClass="card-shadow-teal"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Recent Activity */}
      {transactions && transactions.length > 0 && (
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {[...transactions].reverse().slice(0, 5).map(tx => (
              <div key={String(tx.id)} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    tx.transactionType === Variant_deposit_withdrawal.deposit
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.transactionType === Variant_deposit_withdrawal.deposit ? '↑' : '↓'}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground capitalize">{tx.transactionType}</p>
                    <p className="text-xs text-muted-foreground">{tx.reason || 'No reason'}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  tx.transactionType === Variant_deposit_withdrawal.deposit ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.transactionType === Variant_deposit_withdrawal.deposit ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
