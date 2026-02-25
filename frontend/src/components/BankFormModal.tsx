import React, { useEffect, useState } from 'react';
import { useAddBankDetail, useUpdateBankDetail } from '../hooks/useQueries';
import { BankDetail } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BankFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBank: BankDetail | null;
}

export default function BankFormModal({ open, onOpenChange, editingBank }: BankFormModalProps) {
  const addMutation = useAddBankDetail();
  const updateMutation = useUpdateBankDetail();

  const [name, setName] = useState('');
  const [taluka, setTaluka] = useState('');
  const [district, setDistrict] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  useEffect(() => {
    if (editingBank) {
      setName(editingBank.name);
      setTaluka(editingBank.taluka);
      setDistrict(editingBank.district);
      setIfscCode(editingBank.ifscCode);
    } else {
      setName('');
      setTaluka('');
      setDistrict('');
      setIfscCode('');
    }
  }, [editingBank, open]);

  const isLoading = addMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !taluka.trim() || !district.trim() || !ifscCode.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingBank) {
        await updateMutation.mutateAsync({
          id: editingBank.id,
          name: name.trim(),
          taluka: taluka.trim(),
          district: district.trim(),
          ifscCode: ifscCode.trim(),
        });
        toast.success('Bank detail updated successfully');
      } else {
        await addMutation.mutateAsync({
          name: name.trim(),
          taluka: taluka.trim(),
          district: district.trim(),
          ifscCode: ifscCode.trim(),
        });
        toast.success('Bank detail added successfully');
      }
      onOpenChange(false);
    } catch (err: any) {
      const message = err?.message ?? 'Operation failed';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBank ? 'Edit Bank Detail' : 'Add Bank Detail'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input
              id="bank-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. State Bank of India"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-taluka">Taluka</Label>
            <Input
              id="bank-taluka"
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              placeholder="e.g. Pune"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-district">District</Label>
            <Input
              id="bank-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Pune"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-ifsc">IFSC Code</Label>
            <Input
              id="bank-ifsc"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="e.g. SBIN0001234"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {editingBank ? 'Updating...' : 'Adding...'}
                </>
              ) : editingBank ? (
                'Update'
              ) : (
                'Add'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
