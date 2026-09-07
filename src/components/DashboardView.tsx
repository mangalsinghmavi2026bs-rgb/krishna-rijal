import React from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  Wallet,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  CalendarCheck,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Student,
  FeePayment,
  PayrollRecord,
  Department,
  BudgetExpense,
  Language
} from '../types';
import { formatNepaliCurrency, toNepaliNumber } from '../utils/nepaliUtils';

interface DashboardViewProps {
  students: Student[];
  feePayments: FeePayment[];
  payrollRecords: PayrollRecord[];
  departments: Department[];
  expenses: BudgetExpense[];
  language: Language;
  onOpenNewReceipt: () => void;
  onOpenPayrollModal: () => void;
  onOpenExpenseModal: () => void;
  onNavigateToSheets: () => void;
  onViewReceipt: (payment: FeePayment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  feePayments,
  payrollRecords,
  departments,
  expenses,
  language,
  onOpenNewReceipt,
  onOpenPayrollModal,
  onOpenExpenseModal,
  onNavigateToSheets,
  onViewReceipt,
}) => {
  const isNe = language === 'ne';

  // Financial Calculations
  const totalFeeCollected = feePayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPayrollDisbursed = payrollRecords
    .filter((p) => p.status === 'भुक्तानी भयो (Paid)')
    .reduce((sum, p) => sum + p.netPayable, 0);
  const totalDepartmentExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenditure = totalPayrollDisbursed + totalDepartmentExpenses;
  const netSurplus = totalFeeCollected - totalExpenditure;
  const totalOutstandingDues = students.reduce((sum, s) => sum + s.totalDues, 0);

  // Department Budget Utilization
  const totalAllocatedBudget = departments.reduce((sum, d) => sum + d.allocatedBudget, 0);
  const budgetUtilizationRate = totalAllocatedBudget > 0
    ? Math.round((totalDepartmentExpenses / totalAllocatedBudget) * 100)
    : 0;

  // Monthly breakdown for Chart
  const monthlyChartData = [
    {
      month: isNe ? 'वैशाख' : 'Baishakh',
      fee: 280000,
      expense: 230000,
      payroll: 198000,
    },
    {
      month: isNe ? 'जेठ' : 'Jestha',
      fee: 310000,
      expense: 245000,
      payroll: 198000,
    },
    {
      month: isNe ? 'असार' : 'Ashadh',
      fee: 340000,
      expense: 280000,
      payroll: 202000,
    },
    {
      month: isNe ? 'श्रावण' : 'Shrawan',
      fee: 395000,
      expense: 260000,
      payroll: 217835,
    },
    {
      month: isNe ? 'भाद्र (चालु)' : 'Bhadra (Curr)',
      fee: totalFeeCollected > 0 ? totalFeeCollected : 265000,
      expense: totalDepartmentExpenses,
      payroll: totalPayrollDisbursed > 0 ? totalPayrollDisbursed : 195000,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>{isNe ? 'आर्थिक वर्ष २०८१/०८२ • विद्यालय लेखा सारांश' : 'F.Y. 2081/082 • Accounting Summary'}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isNe ? 'लेखा तथा वित्तीय नियन्त्रण ड्यासबोर्ड' : 'School Financial Control Dashboard'}
            </h2>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
              {isNe
                ? 'विद्यार्थी शुल्क संकलन, शिक्षक तथा कर्मचारी तलब, विभागीय बजेट तथा खर्चको स्वचालित लेखाजोखा।'
                : 'Automated accounting for student fees, staff payroll, and departmental budgets.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewReceipt}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>{isNe ? 'नयाँ शुल्क रसिद' : 'Collect Fee'}</span>
            </button>
            <button
              onClick={onOpenPayrollModal}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center space-x-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>{isNe ? 'तलब भुक्तानी' : 'Staff Payroll'}</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center space-x-2 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>{isNe ? 'विभागीय खर्च' : 'Dept Expense'}</span>
            </button>
            <button
              onClick={onNavigateToSheets}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isNe ? 'गुगल शिट्स' : 'Google Sheets'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Fee Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isNe ? 'कुल शुल्क संकलन' : 'Fee Revenue'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatNepaliCurrency(totalFeeCollected, { inNepaliDigits: isNe })}
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isNe ? `${toNepaliNumber(feePayments.length)} वटा रसिद जारी` : `${feePayments.length} receipts`}</span>
            </div>
          </div>
        </div>

        {/* Staff Payroll */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isNe ? 'कर्मचारी तलब खर्च' : 'Staff Payroll'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatNepaliCurrency(totalPayrollDisbursed, { inNepaliDigits: isNe })}
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1 font-medium">
              <span>{isNe ? 'शिक्षक तथा कर्मचारी पारिश्रमिक' : 'Teaching & Admin Staff'}</span>
            </div>
          </div>
        </div>

        {/* Department Expenses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isNe ? 'विभागीय खर्च' : 'Dept Expenses'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              {formatNepaliCurrency(totalDepartmentExpenses, { inNepaliDigits: isNe })}
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1 font-medium">
              <span>{isNe ? `${toNepaliNumber(budgetUtilizationRate)}% बजेट खर्च` : `${budgetUtilizationRate}% utilized`}</span>
            </div>
          </div>
        </div>

        {/* Net Surplus / Balance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isNe ? 'खुद बचत / मौज्दात' : 'Net Surplus'}
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${netSurplus >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl font-bold ${netSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatNepaliCurrency(netSurplus, { inNepaliDigits: isNe })}
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1 font-medium">
              {netSurplus >= 0 ? (
                <span className="text-emerald-600">{isNe ? 'सकारात्मक बचत स्थिति' : 'Positive Surplus'}</span>
              ) : (
                <span className="text-rose-600">{isNe ? 'घाटा (अतिरिक्त कोष आवश्यक)' : 'Deficit'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isNe ? 'बाँकी बक्यौता' : 'Total Dues'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-amber-800">
              {formatNepaliCurrency(totalOutstandingDues, { inNepaliDigits: isNe })}
            </div>
            <div className="flex items-center space-x-1 text-xs text-amber-700 mt-1 font-medium">
              <span>
                {isNe
                  ? `${toNepaliNumber(students.filter((s) => s.totalDues > 0).length)} जना विद्यार्थी बाँकी`
                  : `${students.filter((s) => s.totalDues > 0).length} students with dues`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Department Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isNe ? 'मासिक आम्दानी (शुल्क) तथा खर्च तुलना' : 'Monthly Fee Income vs Expenses'}
              </h3>
              <p className="text-xs text-slate-500">
                {isNe ? 'चालु आर्थिक वर्षका महिनाहरूको वित्तीय प्रवाह' : 'Fiscal year monthly cashflow comparison (NPR)'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickFormatter={(val) => `रु. ${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number | string | undefined) => [
                    formatNepaliCurrency(Number(val) || 0, { inNepaliDigits: isNe }),
                    ''
                  ]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => {
                    if (value === 'fee') return isNe ? 'शुल्क संकलन (Income)' : 'Fee Collection';
                    if (value === 'expense') return isNe ? 'विभागीय खर्च (Dept Exp)' : 'Department Expenses';
                    if (value === 'payroll') return isNe ? 'तलब खर्च (Payroll)' : 'Staff Payroll';
                    return value;
                  }}
                />
                <Bar dataKey="fee" fill="#2563EB" radius={[4, 4, 0, 0]} name="fee" />
                <Bar dataKey="payroll" fill="#6366F1" radius={[4, 4, 0, 0]} name="payroll" />
                <Bar dataKey="expense" fill="#F59E0B" radius={[4, 4, 0, 0]} name="expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Budget Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isNe ? 'विभागीय बजेट उपयोग' : 'Department Budgets'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                {isNe ? `${toNepaliNumber(departments.length)} विभागहरू` : `${departments.length} Depts`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {isNe ? 'विनियोजित बजेटको खर्च स्थिति तथा बाँकी रकम' : 'Allocated vs spent department budget status'}
            </p>

            <div className="space-y-3.5 overflow-y-auto max-h-64 pr-1">
              {departments.map((dept) => {
                const spent = expenses
                  .filter((e) => e.departmentId === dept.id)
                  .reduce((sum, e) => sum + e.amount, 0);
                const percent = Math.min(100, Math.round((spent / dept.allocatedBudget) * 100));

                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={dept.nameNepali}>
                        {isNe ? dept.nameNepali.split('(')[0] : dept.nameEnglish}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {toNepaliNumber(percent)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent > 85 ? 'bg-rose-500' : percent > 60 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>खर्च: {formatNepaliCurrency(spent, { inNepaliDigits: isNe })}</span>
                      <span>कुल: {formatNepaliCurrency(dept.allocatedBudget, { inNepaliDigits: isNe })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between text-slate-600">
            <span>कुल बजेट: <strong className="text-slate-900">{formatNepaliCurrency(totalAllocatedBudget, { inNepaliDigits: isNe })}</strong></span>
            <span>खर्च: <strong className="text-slate-900">{formatNepaliCurrency(totalDepartmentExpenses, { inNepaliDigits: isNe })}</strong></span>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Receipts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isNe ? 'पछिल्लो शुल्क संकलन रसिदहरू' : 'Recent Fee Receipts'}
              </h3>
            </div>
            <button
              onClick={onOpenNewReceipt}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              {isNe ? '+ नयाँ संकलन' : '+ Collect'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {feePayments.slice(0, 4).map((p) => (
              <div key={p.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">{p.studentName}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">{p.grade}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                    <span className="font-mono text-slate-600">{p.receiptNo}</span>
                    <span>•</span>
                    <span>{p.paymentDateBS}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">{p.paymentMethod}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900">
                      {formatNepaliCurrency(p.amountPaid, { inNepaliDigits: isNe })}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium">चुक्ता भएको</div>
                  </div>
                  <button
                    onClick={() => onViewReceipt(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="रसिद हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Departmental Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isNe ? 'हालैका विभागीय खर्चहरू' : 'Recent Department Expenses'}
              </h3>
            </div>
            <button
              onClick={onOpenExpenseModal}
              className="text-xs font-semibold text-amber-600 hover:text-amber-800"
            >
              {isNe ? '+ खर्च प्रविष्टि' : '+ Record'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {expenses.slice(0, 4).map((e) => (
              <div key={e.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-slate-900 truncate max-w-xs">{e.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                    <span className="text-slate-700 font-medium">{e.departmentName.split('(')[0]}</span>
                    <span>•</span>
                    <span>{e.expenseDateBS}</span>
                    <span>•</span>
                    <span>{e.vendor}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-rose-700">
                    -{formatNepaliCurrency(e.amount, { inNepaliDigits: isNe })}
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
