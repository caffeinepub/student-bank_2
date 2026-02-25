import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include access control and authorization logic
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    name : Text;
    accountNumber : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  // Data Types
  public type Student = {
    id : Nat;
    name : Text;
    dob : Time.Time;
    studentClass : Text;
    attendanceNumber : Nat;
    schoolName : Text;
    taluka : Text;
    district : Text;
  };

  public type Account = {
    id : Nat;
    studentId : Nat;
    bankId : Nat;
    accountNumber : Text;
    initialAmount : Int;
    ifscCode : Text;
  };

  public type Transaction = {
    id : Nat;
    accountId : Nat;
    date : Time.Time;
    transactionType : { #deposit; #withdrawal };
    amount : Int;
    reason : Text;
    totalAmount : Int;
  };

  public type BankDetail = {
    id : Nat;
    name : Text;
    taluka : Text;
    district : Text;
    ifscCode : Text;
  };

  // State Management
  let studentsMap = Map.empty<Nat, Student>();
  let accountsMap = Map.empty<Nat, Account>();
  let transactionsMap = Map.empty<Nat, Transaction>();
  let bankDetailsMap = Map.empty<Nat, BankDetail>();

  // ID generators
  var lastStudentId = 0;
  var lastAccountId = 0;
  var lastTransactionId = 0;
  var lastBankDetailId = 0;

  module Student {
    public func compareByName(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.name, student2.name);
    };
  };

  module Account {
    public func compareByAccountNumber(account1 : Account, account2 : Account) : Order.Order {
      Text.compare(account1.accountNumber, account2.accountNumber);
    };
  };

  module Transaction {
    public func compareByDate(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      Int.compare(transaction1.date, transaction2.date);
    };
  };

  module BankDetail {
    public func compareByName(bank1 : BankDetail, bank2 : BankDetail) : Order.Order {
      Text.compare(bank1.name, bank2.name);
    };
  };

  // STUDENTS (admin only)

  public shared ({ caller }) func addStudent(name : Text, dob : Time.Time, studentClass : Text, attendanceNumber : Nat, schoolName : Text, taluka : Text, district : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    lastStudentId += 1;
    let newStudent : Student = {
      id = lastStudentId;
      name;
      dob;
      studentClass;
      attendanceNumber;
      schoolName;
      taluka;
      district;
    };
    studentsMap.add(lastStudentId, newStudent);
    lastStudentId;
  };

  public shared ({ caller }) func updateStudent(studentId : Nat, name : Text, dob : Time.Time, studentClass : Text, attendanceNumber : Nat, schoolName : Text, taluka : Text, district : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    let updatedStudent : Student = {
      id = studentId;
      name;
      dob;
      studentClass;
      attendanceNumber;
      schoolName;
      taluka;
      district;
    };
    studentsMap.add(studentId, updatedStudent);
    true;
  };

  public shared ({ caller }) func deleteStudent(studentId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    studentsMap.remove(studentId);
    true;
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch students");
    };
    studentsMap.values().toArray().sort(Student.compareByName);
  };

  public query ({ caller }) func getStudentById(studentId : Nat) : async ?Student {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch students");
    };
    studentsMap.get(studentId);
  };

  // ACCOUNTS (admin only)

  public shared ({ caller }) func addAccount(studentId : Nat, bankId : Nat, accountNumber : Text, initialAmount : Int, ifscCode : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add accounts");
    };
    lastAccountId += 1;
    let newAccount : Account = {
      id = lastAccountId;
      studentId;
      bankId;
      accountNumber;
      initialAmount;
      ifscCode;
    };
    accountsMap.add(lastAccountId, newAccount);
    lastAccountId;
  };

  public shared ({ caller }) func updateAccount(accountId : Nat, studentId : Nat, bankId : Nat, accountNumber : Text, initialAmount : Int, ifscCode : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update accounts");
    };
    let updatedAccount : Account = {
      id = accountId;
      studentId;
      bankId;
      accountNumber;
      initialAmount;
      ifscCode;
    };
    accountsMap.add(accountId, updatedAccount);
    true;
  };

  public shared ({ caller }) func deleteAccount(accountId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete accounts");
    };
    accountsMap.remove(accountId);
    true;
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch accounts");
    };
    accountsMap.values().toArray().sort(Account.compareByAccountNumber);
  };

  public query ({ caller }) func getAccountById(accountId : Nat) : async ?Account {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch accounts");
    };
    accountsMap.get(accountId);
  };

  // TRANSACTIONS (admin only)

  public shared ({ caller }) func addTransaction(accountId : Nat, date : Time.Time, transactionType : { #deposit; #withdrawal }, amount : Int, reason : Text, totalAmount : Int) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add transactions");
    };
    lastTransactionId += 1;
    let newTransaction : Transaction = {
      id = lastTransactionId;
      accountId;
      date;
      transactionType;
      amount;
      reason;
      totalAmount;
    };
    transactionsMap.add(lastTransactionId, newTransaction);
    lastTransactionId;
  };

  public shared ({ caller }) func updateTransaction(transactionId : Nat, accountId : Nat, date : Time.Time, transactionType : { #deposit; #withdrawal }, amount : Int, reason : Text, totalAmount : Int) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update transactions");
    };
    let updatedTransaction : Transaction = {
      id = transactionId;
      accountId;
      date;
      transactionType;
      amount;
      reason;
      totalAmount;
    };
    transactionsMap.add(transactionId, updatedTransaction);
    true;
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete transactions");
    };
    transactionsMap.remove(transactionId);
    true;
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch transactions");
    };
    transactionsMap.values().toArray().sort(Transaction.compareByDate);
  };

  public query ({ caller }) func getTransactionById(transactionId : Nat) : async ?Transaction {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch transactions");
    };
    transactionsMap.get(transactionId);
  };

  // BANK DETAILS
  // Add/update/delete: admin only
  // View (getAllBankDetails, getBankDetailById): admin and user (logged-in users)

  public shared ({ caller }) func addBankDetail(name : Text, taluka : Text, district : Text, ifscCode : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add bank details");
    };
    lastBankDetailId += 1;
    let newBankDetail : BankDetail = {
      id = lastBankDetailId;
      name;
      taluka;
      district;
      ifscCode;
    };
    bankDetailsMap.add(lastBankDetailId, newBankDetail);
    lastBankDetailId;
  };

  public shared ({ caller }) func updateBankDetail(bankDetailId : Nat, name : Text, taluka : Text, district : Text, ifscCode : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update bank details");
    };
    let updatedBankDetail : BankDetail = {
      id = bankDetailId;
      name;
      taluka;
      district;
      ifscCode;
    };
    bankDetailsMap.add(bankDetailId, updatedBankDetail);
    true;
  };

  public shared ({ caller }) func deleteBankDetail(bankDetailId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete bank details");
    };
    bankDetailsMap.remove(bankDetailId);
    true;
  };

  // Bank details are viewable by both admin and user (logged-in users)
  public query ({ caller }) func getAllBankDetails() : async [BankDetail] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bank details");
    };
    bankDetailsMap.values().toArray().sort(BankDetail.compareByName);
  };

  public query ({ caller }) func getBankDetailById(bankDetailId : Nat) : async ?BankDetail {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bank details");
    };
    bankDetailsMap.get(bankDetailId);
  };

  // PASSBOOK (accessible to both admin and user)

  public query ({ caller }) func getPassbook(accountNumber : Text) : async {
    student : ?Student;
    account : ?Account;
    bankDetail : ?BankDetail;
    transactions : [Transaction];
  } {
    // Both admin and regular users can access passbook
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view passbook");
    };
    let accountsIter = accountsMap.values();
    switch (accountsIter.find(func(a) { a.accountNumber == accountNumber })) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        let student = studentsMap.get(account.studentId);
        let bankDetail = bankDetailsMap.get(account.bankId);

        let transactionsList = List.empty<Transaction>();
        for (transaction in transactionsMap.values()) {
          if (transaction.accountId == account.id) {
            transactionsList.add(transaction);
          };
        };

        {
          student;
          account = ?account;
          bankDetail;
          transactions = transactionsList.toArray();
        };
      };
    };
  };

  // HISTORY (admin only)

  public query ({ caller }) func getTransactionHistory(accountNumber : Text, dateFrom : Time.Time, dateTo : Time.Time) : async [Transaction] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view transaction history");
    };
    let accountsIter = accountsMap.values();
    switch (accountsIter.find(func(a) { a.accountNumber == accountNumber })) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        let transactionsIter = transactionsMap.values();
        let filteredTransactions = transactionsIter.filter(
          func(transaction) {
            transaction.accountId == account.id and transaction.date >= dateFrom and transaction.date <= dateTo
          }
        );
        filteredTransactions.toArray();
      };
    };
  };
};
