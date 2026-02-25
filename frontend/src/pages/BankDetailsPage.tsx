import React, { useState } from 'react';
import { useGetAllBankDetails, useDeleteBankDetail } from '../hooks/useQueries';
import BankFormModal from '../components/BankFormModal';
import { BankDetail } from '../backend';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BankDetailsPageProps {
  userRole: 'admin' | 'user' | 'guest';
}

export default function BankDetailsPage({ userRole }: BankDetailsPageProps) {
  const isAdmin = userRole === 'admin';
  const { data: bankDetails = [], isLoading, error } = useGetAllBankDetails();
  const deleteMutation = useDeleteBankDetail();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetail | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<BankDetail | null>(null);

  const handleAdd = () => {
    setEditingBank(null);
    setModalOpen(true);
  };

  const handleEdit = (bank: BankDetail) => {
    setEditingBank(bank);
    setModalOpen(true);
  };

  const handleDeleteClick = (bank: BankDetail) => {
    setBankToDelete(bank);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return;
    try {
      await deleteMutation.mutateAsync(bankToDelete.id);
      toast.success('Bank detail deleted successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete bank detail');
    } finally {
      setDeleteDialogOpen(false);
      setBankToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive text-sm">{(error as any)?.message ?? 'Failed to load bank details'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Bank Details</h1>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
            <Plus size={16} />
            Add Bank
          </Button>
        )}
      </div>

      {bankDetails.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bank details found.</p>
          {isAdmin && (
            <Button onClick={handleAdd} variant="outline" size="sm" className="mt-4">
              Add your first bank
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Name</TableHead>
                <TableHead>Taluka</TableHead>
                <TableHead>District</TableHead>
                <TableHead>IFSC Code</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankDetails.map((bank) => (
                <TableRow key={String(bank.id)}>
                  <TableCell className="font-medium">{bank.name}</TableCell>
                  <TableCell>{bank.taluka}</TableCell>
                  <TableCell>{bank.district}</TableCell>
                  <TableCell className="font-mono text-xs">{bank.ifscCode}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bank)}
                          className="h-8 w-8"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(bank)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isAdmin && (
        <BankFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          editingBank={editingBank}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Detail</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{bankToDelete?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
