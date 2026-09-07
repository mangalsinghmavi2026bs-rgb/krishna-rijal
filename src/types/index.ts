export type Language = 'ne' | 'en';

export type ActiveTab = 'dashboard' | 'fees' | 'payroll' | 'budgets' | 'reports' | 'sheets';

export type PaymentMethod = 'नगद (Cash)' | 'eSewa' | 'Khalti' | 'बैंक / चेक (Bank)' | 'ConnectIPS';

export interface FeeItem {
  id: string;
  category: string;
  amount: number;
}

export interface Student {
  id: string;
  rollNo: number;
  nameNepali: string;
  nameEnglish: string;
  grade: string; // e.g. "कक्षा १० (Grade 10)"
  section: string; // e.g. "A"
  guardianName: string;
  phone: string;
  monthlyFee: number;
  busFacility: boolean;
  busFee: number;
  scholarshipPercent: number; // e.g. 20%
  totalPaid: number;
  totalDues: number;
  status: 'active' | 'inactive';
}

export interface FeePayment {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  grade: string;
  paymentDateBS: string;
  paymentDateAD: string;
  items: FeeItem[];
  subTotal: number;
  discount: number;
  fine: number;
  amountPaid: number;
  remainingDue: number;
  paymentMethod: PaymentMethod;
  monthBilled: string;
  receivedBy: string;
  remarks?: string;
}

export interface Employee {
  id: string;
  empCode: string;
  nameNepali: string;
  nameEnglish: string;
  designation: string;
  department: string;
  joinDateBS: string;
  basicSalary: number;
  allowance: number; // Dearness & travel allowance
  overtimeRate: number;
  pfDeductionPercent: number; // usually 10%
  citAmount: number; // Citizen Investment Trust
  tdsPercent: number; // Income tax TDS %
  panNumber: string;
  bankAccount: string;
  phone: string;
  status: 'active' | 'leave' | 'resigned';
}

export interface PayrollRecord {
  id: string;
  voucherNo: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  monthBS: string;
  yearBS: string;
  basicSalary: number;
  allowance: number;
  extraHours: number;
  extraPay: number;
  grossSalary: number;
  pfEmployee: number;
  pfEmployer: number;
  citDeduction: number;
  tdsDeduction: number;
  advanceDeduction: number;
  totalDeductions: number;
  netPayable: number;
  status: 'भुक्तानी भयो (Paid)' | 'प्रक्रियामा (Pending)' | 'मस्यौदा (Draft)';
  paymentDateBS: string;
  paymentMethod: string;
  approvedBy: string;
}

export interface Department {
  id: string;
  code: string;
  nameNepali: string;
  nameEnglish: string;
  headOfDepartment: string;
  allocatedBudget: number;
  fiscalYearBS: string;
  color: string;
}

export interface BudgetExpense {
  id: string;
  expenseNo: string;
  departmentId: string;
  departmentName: string;
  title: string;
  category: string;
  vendor: string;
  amount: number;
  expenseDateBS: string;
  billRefNo: string;
  approvedBy: string;
  paymentMethod: string;
  status: 'स्वीकृत (Approved)' | 'स्वीकृति बाँकी (Pending)';
}

export interface SchoolProfile {
  nameNepali: string;
  nameEnglish: string;
  addressNepali: string;
  addressEnglish: string;
  phone: string;
  email: string;
  panNo: string;
  regNo: string;
  establishedBS: string;
  fiscalYearBS: string;
  currency: string;
}

export interface SheetsExportLog {
  id: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  exportedAt: string;
  title: string;
  status: 'success' | 'failed';
  recordsCount: number;
}
