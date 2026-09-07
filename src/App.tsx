import React, { useState, useEffect } from 'react';
import {
  Student,
  FeePayment,
  Employee,
  PayrollRecord,
  Department,
  BudgetExpense,
  SchoolProfile,
  Language,
  ActiveTab
} from './types';
import {
  initialStudents,
  initialFeePayments,
  initialEmployees,
  initialPayrollRecords,
  initialDepartments,
  initialExpenses,
  initialSchoolProfile
} from './data/mockSchoolData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { StudentFeesView } from './components/StudentFeesView';
import { PayrollView } from './components/PayrollView';
import { DepartmentBudgetsView } from './components/DepartmentBudgetsView';
import { AutomatedReportsView } from './components/AutomatedReportsView';
import { GoogleSheetsSyncView } from './components/GoogleSheetsSyncView';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('ne');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistence in localStorage with mock fallbacks
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('sh_school_profile');
    return saved ? JSON.parse(saved) : initialSchoolProfile;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sh_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [feePayments, setFeePayments] = useState<FeePayment[]>(() => {
    const saved = localStorage.getItem('sh_fee_payments');
    return saved ? JSON.parse(saved) : initialFeePayments;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('sh_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('sh_payroll');
    return saved ? JSON.parse(saved) : initialPayrollRecords;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('sh_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  const [expenses, setExpenses] = useState<BudgetExpense[]>(() => {
    const saved = localStorage.getItem('sh_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  // Modal Open states across tabs
  const [isNewFeeOpen, setIsNewFeeOpen] = useState(false);
  const [isNewPayrollOpen, setIsNewPayrollOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sh_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sh_fee_payments', JSON.stringify(feePayments));
  }, [feePayments]);

  useEffect(() => {
    localStorage.setItem('sh_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('sh_payroll', JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  useEffect(() => {
    localStorage.setItem('sh_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('sh_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Handlers
  const handleAddPayment = (newPayment: FeePayment) => {
    setFeePayments([newPayment, ...feePayments]);
    // Automatically update student's paid amount & dues
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === newPayment.studentId) {
          const updatedPaid = st.totalPaid + newPayment.amountPaid;
          const updatedDues = Math.max(0, st.totalDues - newPayment.amountPaid);
          return {
            ...st,
            totalPaid: updatedPaid,
            totalDues: updatedDues,
            status: updatedDues === 0 ? 'paid' : 'partial',
          };
        }
        return st;
      })
    );
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents([newStudent, ...students]);
  };

  const handleAddPayrollRecord = (record: PayrollRecord) => {
    setPayrollRecords([record, ...payrollRecords]);
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees([...employees, newEmployee]);
  };

  const handleAddExpense = (expense: BudgetExpense) => {
    setExpenses([expense, ...expenses]);
  };

  const handleAddDepartment = (department: Department) => {
    setDepartments([...departments, department]);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 selection:bg-blue-600 selection:text-white pb-16">
      {/* Top Fixed/Sticky Header */}
      <Header
        schoolProfile={schoolProfile}
        language={language}
        setLanguage={setLanguage}
        onQuickAddFee={() => {
          setActiveTab('fees');
          setIsNewFeeOpen(true);
        }}
        onQuickAddPayroll={() => {
          setActiveTab('payroll');
          setIsNewPayrollOpen(true);
        }}
        onQuickAddExpense={() => {
          setActiveTab('budgets');
          setIsNewExpenseOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Navigation Bar */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} language={language} />

        {/* Content Views */}
        <div className="mt-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              feePayments={feePayments}
              payrollRecords={payrollRecords}
              departments={departments}
              expenses={expenses}
              schoolProfile={schoolProfile}
              language={language}
              onNavigate={setActiveTab}
              onOpenNewFee={() => {
                setActiveTab('fees');
                setIsNewFeeOpen(true);
              }}
              onOpenNewPayroll={() => {
                setActiveTab('payroll');
                setIsNewPayrollOpen(true);
              }}
              onOpenNewExpense={() => {
                setActiveTab('budgets');
                setIsNewExpenseOpen(true);
              }}
            />
          )}

          {activeTab === 'fees' && (
            <StudentFeesView
              students={students}
              feePayments={feePayments}
              schoolProfile={schoolProfile}
              language={language}
              onAddPayment={handleAddPayment}
              onAddStudent={handleAddStudent}
              isNewFeeOpen={isNewFeeOpen}
              setIsNewFeeOpen={setIsNewFeeOpen}
              onViewReceipt={setSelectedReceipt}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              employees={employees}
              payrollRecords={payrollRecords}
              schoolProfile={schoolProfile}
              language={language}
              onAddPayrollRecord={handleAddPayrollRecord}
              onAddEmployee={handleAddEmployee}
              isNewPayrollOpen={isNewPayrollOpen}
              setIsNewPayrollOpen={setIsNewPayrollOpen}
            />
          )}

          {activeTab === 'budgets' && (
            <DepartmentBudgetsView
              departments={departments}
              expenses={expenses}
              language={language}
              onAddExpense={handleAddExpense}
              onAddDepartment={handleAddDepartment}
              isNewExpenseOpen={isNewExpenseOpen}
              setIsNewExpenseOpen={setIsNewExpenseOpen}
            />
          )}

          {activeTab === 'reports' && (
            <AutomatedReportsView
              students={students}
              feePayments={feePayments}
              payrollRecords={payrollRecords}
              departments={departments}
              expenses={expenses}
              schoolProfile={schoolProfile}
              language={language}
              onNavigateToSheets={() => setActiveTab('sheets')}
            />
          )}

          {activeTab === 'sheets' && (
            <GoogleSheetsSyncView
              students={students}
              feePayments={feePayments}
              payrollRecords={payrollRecords}
              departments={departments}
              expenses={expenses}
              schoolProfile={schoolProfile}
              language={language}
            />
          )}
        </div>
      </main>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          schoolProfile={schoolProfile}
          language={language}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
