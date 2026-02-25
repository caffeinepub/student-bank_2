import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BankDetail {
    id: bigint;
    ifscCode: string;
    name: string;
    district: string;
    taluka: string;
}
export interface Account {
    id: bigint;
    studentId: bigint;
    ifscCode: string;
    bankId: bigint;
    initialAmount: bigint;
    accountNumber: string;
}
export interface Transaction {
    id: bigint;
    transactionType: Variant_deposit_withdrawal;
    accountId: bigint;
    date: Time;
    totalAmount: bigint;
    amount: bigint;
    reason: string;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
    accountNumber: string;
}
export interface Student {
    id: bigint;
    dob: Time;
    attendanceNumber: bigint;
    name: string;
    district: string;
    taluka: string;
    studentClass: string;
    schoolName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_deposit_withdrawal {
    deposit = "deposit",
    withdrawal = "withdrawal"
}
export interface backendInterface {
    addAccount(studentId: bigint, bankId: bigint, accountNumber: string, initialAmount: bigint, ifscCode: string): Promise<bigint>;
    addBankDetail(name: string, taluka: string, district: string, ifscCode: string): Promise<bigint>;
    addStudent(name: string, dob: Time, studentClass: string, attendanceNumber: bigint, schoolName: string, taluka: string, district: string): Promise<bigint>;
    addTransaction(accountId: bigint, date: Time, transactionType: Variant_deposit_withdrawal, amount: bigint, reason: string, totalAmount: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAccount(accountId: bigint): Promise<boolean>;
    deleteBankDetail(bankDetailId: bigint): Promise<boolean>;
    deleteStudent(studentId: bigint): Promise<boolean>;
    deleteTransaction(transactionId: bigint): Promise<boolean>;
    getAccountById(accountId: bigint): Promise<Account | null>;
    getAllAccounts(): Promise<Array<Account>>;
    getAllBankDetails(): Promise<Array<BankDetail>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBankDetailById(bankDetailId: bigint): Promise<BankDetail | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPassbook(accountNumber: string): Promise<{
        bankDetail?: BankDetail;
        account?: Account;
        student?: Student;
        transactions: Array<Transaction>;
    }>;
    getStudentById(studentId: bigint): Promise<Student | null>;
    getTransactionById(transactionId: bigint): Promise<Transaction | null>;
    getTransactionHistory(accountNumber: string, dateFrom: Time, dateTo: Time): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAccount(accountId: bigint, studentId: bigint, bankId: bigint, accountNumber: string, initialAmount: bigint, ifscCode: string): Promise<boolean>;
    updateBankDetail(bankDetailId: bigint, name: string, taluka: string, district: string, ifscCode: string): Promise<boolean>;
    updateStudent(studentId: bigint, name: string, dob: Time, studentClass: string, attendanceNumber: bigint, schoolName: string, taluka: string, district: string): Promise<boolean>;
    updateTransaction(transactionId: bigint, accountId: bigint, date: Time, transactionType: Variant_deposit_withdrawal, amount: bigint, reason: string, totalAmount: bigint): Promise<boolean>;
}
