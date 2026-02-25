import React, { useState } from 'react';
import { Identity } from '@dfinity/agent';
import StudentPage from '../pages/StudentPage';
import AccountPage from '../pages/AccountPage';
import TransactionPage from '../pages/TransactionPage';
import BankDetailsPage from '../pages/BankDetailsPage';
import PassbookPage from '../pages/PassbookPage';
import HistoryPage from '../pages/HistoryPage';
import HomePage from '../pages/HomePage';
import {
  Users,
  CreditCard,
  ArrowLeftRight,
  Building2,
  BookOpen,
  History,
  Home,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  userRole: 'admin' | 'user' | 'guest';
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  identity: Identity | null;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home, roles: ['admin'] },
  { id: 'students', label: 'Students', icon: Users, roles: ['admin'] },
  { id: 'accounts', label: 'Accounts', icon: CreditCard, roles: ['admin'] },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, roles: ['admin'] },
  { id: 'bank-details', label: 'Bank Details', icon: Building2, roles: ['admin', 'user'] },
  { id: 'passbook', label: 'Passbook', icon: BookOpen, roles: ['admin', 'user'] },
  { id: 'history', label: 'History', icon: History, roles: ['admin'] },
];

export default function DashboardLayout({
  userRole,
  currentPage,
  onPageChange,
  onLogout,
  identity,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const principalShort = identity
    ? identity.getPrincipal().toString().slice(0, 12) + '...'
    : '';

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return userRole === 'admin' ? <HomePage /> : null;
      case 'students':
        return userRole === 'admin' ? <StudentPage /> : null;
      case 'accounts':
        return userRole === 'admin' ? <AccountPage /> : null;
      case 'transactions':
        return userRole === 'admin' ? <TransactionPage /> : null;
      case 'bank-details':
        return <BankDetailsPage userRole={userRole} />;
      case 'passbook':
        return <PassbookPage />;
      case 'history':
        return userRole === 'admin' ? <HistoryPage /> : null;
      default:
        return userRole === 'admin' ? <HomePage /> : <PassbookPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <img
            src="/assets/generated/logo.dim_256x256.png"
            alt="Student Bank"
            className="w-9 h-9 rounded-lg"
          />
          <span className="font-bold text-lg text-foreground tracking-tight">Student Bank</span>
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase">
              {userRole === 'admin' ? 'A' : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground capitalize">{userRole}</p>
              <p className="text-xs text-muted-foreground truncate">{principalShort}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 sticky top-0 z-10">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h2 className="font-semibold text-foreground capitalize text-sm">
            {visibleNavItems.find((n) => n.id === currentPage)?.label ?? 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block capitalize">
              {userRole}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{renderPage()}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground">
          2026 Student Bank · vaibhavgavali
        </footer>
      </div>
    </div>
  );
}
