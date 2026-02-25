import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  Student,
  Account,
  Transaction,
  BankDetail,
  UserProfile,
  Variant_deposit_withdrawal,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      dob: bigint;
      studentClass: string;
      attendanceNumber: bigint;
      schoolName: string;
      taluka: string;
      district: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStudent(
        data.name,
        data.dob,
        data.studentClass,
        data.attendanceNumber,
        data.schoolName,
        data.taluka,
        data.district
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      dob: bigint;
      studentClass: string;
      attendanceNumber: bigint;
      schoolName: string;
      taluka: string;
      district: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStudent(
        data.id,
        data.name,
        data.dob,
        data.studentClass,
        data.attendanceNumber,
        data.schoolName,
        data.taluka,
        data.district
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useGetAllAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: bigint;
      bankId: bigint;
      accountNumber: string;
      initialAmount: bigint;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAccount(
        data.studentId,
        data.bankId,
        data.accountNumber,
        data.initialAmount,
        data.ifscCode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      studentId: bigint;
      bankId: bigint;
      accountNumber: string;
      initialAmount: bigint;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAccount(
        data.id,
        data.studentId,
        data.bankId,
        data.accountNumber,
        data.initialAmount,
        data.ifscCode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      accountId: bigint;
      date: bigint;
      transactionType: Variant_deposit_withdrawal;
      amount: bigint;
      reason: string;
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTransaction(
        data.accountId,
        data.date,
        data.transactionType,
        data.amount,
        data.reason,
        data.totalAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      accountId: bigint;
      date: bigint;
      transactionType: Variant_deposit_withdrawal;
      amount: bigint;
      reason: string;
      totalAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTransaction(
        data.id,
        data.accountId,
        data.date,
        data.transactionType,
        data.amount,
        data.reason,
        data.totalAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ─── Bank Details ─────────────────────────────────────────────────────────────

export function useGetAllBankDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<BankDetail[]>({
    queryKey: ['bankDetails'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBankDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      taluka: string;
      district: string;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBankDetail(data.name, data.taluka, data.district, data.ifscCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}

export function useUpdateBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      taluka: string;
      district: string;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBankDetail(data.id, data.name, data.taluka, data.district, data.ifscCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}

export function useDeleteBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBankDetail(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}

// ─── Passbook ─────────────────────────────────────────────────────────────────

export function useGetPassbook(accountNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['passbook', accountNumber],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPassbook(accountNumber);
    },
    enabled: !!actor && !isFetching && !!accountNumber,
    retry: false,
  });
}

// ─── Transaction History ──────────────────────────────────────────────────────

export function useGetTransactionHistory(
  accountNumber: string,
  dateFrom: bigint | null,
  dateTo: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactionHistory', accountNumber, dateFrom?.toString(), dateTo?.toString()],
    queryFn: async () => {
      if (!actor || !accountNumber || dateFrom === null || dateTo === null) return [];
      try {
        return await actor.getTransactionHistory(accountNumber, dateFrom, dateTo);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!accountNumber && dateFrom !== null && dateTo !== null,
    retry: false,
  });
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return 'guest';
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export { Variant_deposit_withdrawal };
