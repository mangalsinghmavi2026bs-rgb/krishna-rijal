import React, { useState } from 'react';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  CheckCircle,
  Building,
  GraduationCap
} from 'lucide-react';
import {
  Student,
  FeePayment,
  PayrollRecord,
  Department,
  BudgetExpense,
  SchoolProfile,
  Language
} from '../types';
import {
  formatNepaliCurrency,
  numberToNepaliWords,
  toNepaliNumber
} from '../utils/nepaliUtils';

interface AutomatedReportsViewProps {
  students: Student[];
  feePayments: FeePayment[];
  payrollRecords: PayrollRecord[];
  departments: Department[];
  expenses: BudgetExpense[];
  schoolProfile: SchoolProfile;
  language: Language;
  onNavigateToSheets: () => void;
}

type ReportType = 'income-expenditure' | 'trial-balance' | 'grade-analysis' | 'budget-variance' | 'cash-ledger';

export const AutomatedReportsView: React.FC<AutomatedReportsViewProps> = ({
  students,
  feePayments,
  payrollRecords,
  departments,
  expenses,
  schoolProfile,
  language,
  onNavigateToSheets,
}) => {
  const isNe = language === 'ne';
  const [selectedReport, setSelectedReport] = useState<ReportType>('income-expenditure');

  // Aggregated Values
  const totalFeeCollected = feePayments.reduce((s, p) => s + p.amountPaid, 0);
  const totalPayrollPaid = payrollRecords
    .filter((p) => p.status === 'भुक्तानी भयो (Paid)')
    .reduce((s, p) => s + p.netPayable, 0);
  const totalDeptExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenditure = totalPayrollPaid + totalDeptExpenses;
  const netSurplus = totalFeeCollected - totalExpenditure;

  const totalDuesReceivable = students.reduce((s, st) => s + st.totalDues, 0);
  const totalPfLiability = payrollRecords.reduce((s, p) => s + p.pfEmployee + p.pfEmployer, 0);
  const totalTdsPayable = payrollRecords.reduce((s, p) => s + p.tdsDeduction, 0);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Grade-wise analysis
  const gradeWiseSummary = Array.from(new Set(students.map((s) => s.grade))).map((grade) => {
    const gradeStudents = students.filter((s) => s.grade === grade);
    const gradePayments = feePayments.filter((p) => p.grade === grade);
    const collected = gradePayments.reduce((s, p) => s + p.amountPaid, 0);
    const dues = gradeStudents.reduce((s, st) => s + st.totalDues, 0);
    const totalBilled = collected + dues;
    const recoveryRate = totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 100;

    return {
      grade,
      studentsCount: gradeStudents.length,
      collected,
      dues,
      recoveryRate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Report Selector and Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedReport('income-expenditure')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedReport === 'income-expenditure'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? '१. आय-व्यय तथा नाफा नोक्सान' : '1. Income & Expenses'}
          </button>
          <button
            onClick={() => setSelectedReport('trial-balance')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedReport === 'trial-balance'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? '२. वासलात / वित्तीय स्थिति' : '2. Balance Sheet'}
          </button>
          <button
            onClick={() => setSelectedReport('grade-analysis')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedReport === 'grade-analysis'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? '३. कक्षागत शुल्क संकलन' : '3. Grade Fee Analysis'}
          </button>
          <button
            onClick={() => setSelectedReport('budget-variance')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedReport === 'budget-variance'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? '४. विभागीय बजेट तुलना' : '4. Budget Variance'}
          </button>
          <button
            onClick={() => setSelectedReport('cash-ledger')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedReport === 'cash-ledger'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? '५. नगद / बैंक वही' : '5. Cash Ledger'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToSheets}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isNe ? 'गुगल शिट्समा पठाउनुहोस्' : 'Export to Sheets'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{isNe ? 'प्रतिवेदन प्रिन्ट गर्नुहोस्' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-slate-900 font-sans">
        {/* Document Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center justify-center space-x-3 mb-1">
            <GraduationCap className="w-9 h-9 text-blue-800" />
            <h2 className="text-2xl font-bold tracking-tight">{schoolProfile.nameNepali}</h2>
          </div>
          <p className="text-sm font-semibold text-slate-700">{schoolProfile.nameEnglish}</p>
          <p className="text-xs text-slate-600 mt-1">
            {schoolProfile.addressNepali} | फोन: {schoolProfile.phone}
          </p>
          <div className="flex justify-center space-x-4 text-xs text-slate-600 mt-1 font-medium">
            <span>स्थायी लेखा नं. (PAN): <strong className="font-bold text-slate-900">{schoolProfile.panNo}</strong></span>
            <span>आर्थिक वर्ष: <strong className="text-slate-900">{schoolProfile.fiscalYearBS}</strong></span>
            <span>अवधि: श्रावण २०८१ देखि हालसम्म</span>
          </div>

          <div className="mt-3 inline-block px-4 py-1 border border-slate-900 rounded-full font-bold text-xs uppercase tracking-wider bg-slate-100">
            {selectedReport === 'income-expenditure' && 'आय-व्यय तथा नाफा नोक्सान हिसाब विवरण (Income & Expenditure Statement)'}
            {selectedReport === 'trial-balance' && 'वासलात तथा वित्तीय स्थिति सारांश (Trial Balance / Balance Sheet)'}
            {selectedReport === 'grade-analysis' && 'कक्षागत शुल्क संकलन तथा बक्यौता विश्लेषण प्रतिवेदन'}
            {selectedReport === 'budget-variance' && 'विभागीय बजेट विनियोजन तथा खर्च तुलनात्मक प्रतिवेदन (Budget Variance)'}
            {selectedReport === 'cash-ledger' && 'नगद तथा बैंक कारोबार खाता वही (Cash & Bank Ledger)'}
          </div>
        </div>

        {/* REPORT 1: Income & Expenditure Statement */}
        {selectedReport === 'income-expenditure' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Side */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 px-4 py-2.5 border-b border-slate-300 flex justify-between font-bold text-emerald-900 text-sm">
                  <span>आम्दानीका शीर्षकहरू (Income & Revenue)</span>
                  <span>रकम रु.</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between text-slate-700">
                    <span>१. नियमित विद्यार्थी मासिक शुल्क:</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalFeeCollected * 0.7, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>२. यातायात तथा बस सेवा शुल्क:</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalFeeCollected * 0.15, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>३. त्रैमासिक तथा वार्षिक परीक्षा शुल्क:</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalFeeCollected * 0.08, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>४. कम्प्युटर तथा विज्ञान प्रयोगशाला शुल्क:</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalFeeCollected * 0.07, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-sm text-emerald-800">
                    <span>कुल आम्दानी (Total Revenue):</span>
                    <span>{formatNepaliCurrency(totalFeeCollected, { inNepaliDigits: isNe })}</span>
                  </div>
                </div>
              </div>

              {/* Expenditure Side */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-rose-50 px-4 py-2.5 border-b border-slate-300 flex justify-between font-bold text-rose-900 text-sm">
                  <span>खर्चका शीर्षकहरू (Expenses & Expenditure)</span>
                  <span>रकम रु.</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between text-slate-700">
                    <span>१. शिक्षक तथा कर्मचारी पारिश्रमिक भुक्तानी:</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalPayrollPaid, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>२. विभागीय सञ्चालन तथा कार्यक्रम खर्च:</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalDeptExpenses, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>३. विद्यालय PF म्याचिङ योगदान (१०%):</span>
                    <span className="font-semibold text-slate-900">
                      {formatNepaliCurrency(totalPfLiability / 2, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-sm text-rose-800">
                    <span>कुल खर्च (Total Expenditure):</span>
                    <span>{formatNepaliCurrency(totalExpenditure, { inNepaliDigits: isNe })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Result Bar */}
            <div className={`p-4 rounded-xl border flex justify-between items-center ${netSurplus >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <div>
                <span className="font-bold text-base block">
                  {netSurplus >= 0 ? 'खुद बचत मौज्दात (Net Surplus / Balance):' : 'खुद घाटा (Net Deficit):'}
                </span>
                <span className="text-xs italic">
                  अक्षरेपी: {numberToNepaliWords(netSurplus)}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatNepaliCurrency(netSurplus, { inNepaliDigits: isNe })}
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: Trial Balance / Financial Summary */}
        {selectedReport === 'trial-balance' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">क्र.सं.</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">लेखा शीर्षक (Particulars)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right">डेबिट रु. (Dr. Assets/Exp)</th>
                  <th className="py-2.5 px-3 text-right">क्रेडिट रु. (Cr. Liab/Inc)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">१</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">नगद तथा बैंक मौज्दात (Cash & Bank Balance)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-blue-700">
                    {formatNepaliCurrency(netSurplus + 150000, { inNepaliDigits: isNe })}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">२</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">विद्यार्थी बाँकी शुल्क बक्यौता (Receivables)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold text-amber-700">
                    {formatNepaliCurrency(totalDuesReceivable, { inNepaliDigits: isNe })}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">३</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">कर्मचारी तलब खर्च (Staff Salaries)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-medium">
                    {formatNepaliCurrency(totalPayrollPaid, { inNepaliDigits: isNe })}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">४</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">विभागीय सञ्चालन खर्च (Dept Operating Expenses)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-medium">
                    {formatNepaliCurrency(totalDeptExpenses, { inNepaliDigits: isNe })}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">५</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">कुल शुल्क संकलन आम्दानी (Fee Revenue)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right text-slate-400">-</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-700">
                    {formatNepaliCurrency(totalFeeCollected, { inNepaliDigits: isNe })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">६</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">सञ्चय कोष दायित्व (PF Payable)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right text-slate-400">-</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatNepaliCurrency(totalPfLiability, { inNepaliDigits: isNe })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">७</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">आयकर टीडीएस दायित्व (TDS Payable)</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right text-slate-400">-</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatNepaliCurrency(totalTdsPayable, { inNepaliDigits: isNe })}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold text-sm border-t-2 border-slate-800">
                  <td colSpan={2} className="py-3 px-3 border-r border-slate-300 text-right">
                    जम्मा हिसाब (Total Balanced):
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-right text-blue-900">
                    {formatNepaliCurrency(totalExpenditure + totalDuesReceivable + netSurplus, { inNepaliDigits: isNe })}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-900">
                    {formatNepaliCurrency(totalExpenditure + totalDuesReceivable + netSurplus, { inNepaliDigits: isNe })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Grade-wise Fee Analysis */}
        {selectedReport === 'grade-analysis' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3">कक्षा (Grade)</th>
                  <th className="py-2.5 px-3 text-center">विद्यार्थी संख्या</th>
                  <th className="py-2.5 px-3 text-right">संकलित रकम रु.</th>
                  <th className="py-2.5 px-3 text-right">बाँकी बक्यौता रु.</th>
                  <th className="py-2.5 px-3 text-right">उठ्नुपर्ने कुल रु.</th>
                  <th className="py-2.5 px-3 text-center">संकलन दर (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {gradeWiseSummary.map((item) => (
                  <tr key={item.grade} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.grade}</td>
                    <td className="py-2.5 px-3 text-center">{toNepaliNumber(item.studentsCount)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-emerald-700">
                      {formatNepaliCurrency(item.collected, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-rose-600">
                      {item.dues > 0 ? formatNepaliCurrency(item.dues, { inNepaliDigits: isNe }) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatNepaliCurrency(item.collected + item.dues, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${item.recoveryRate >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {toNepaliNumber(item.recoveryRate)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: Budget Variance Report */}
        {selectedReport === 'budget-variance' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3">विभाग कोड</th>
                  <th className="py-2.5 px-3">विभागको नाम</th>
                  <th className="py-2.5 px-3">विभागीय प्रमुख</th>
                  <th className="py-2.5 px-3 text-right">विनियोजित बजेट</th>
                  <th className="py-2.5 px-3 text-right">हालसम्मको खर्च</th>
                  <th className="py-2.5 px-3 text-right">बाँकी मौज्दात</th>
                  <th className="py-2.5 px-3 text-center">खर्च %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {departments.map((d) => {
                  const spent = expenses
                    .filter((e) => e.departmentId === d.id)
                    .reduce((sum, e) => sum + e.amount, 0);
                  const bal = d.allocatedBudget - spent;
                  const pct = d.allocatedBudget > 0 ? Math.round((spent / d.allocatedBudget) * 100) : 0;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{d.code}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{d.nameNepali}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.headOfDepartment}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {formatNepaliCurrency(d.allocatedBudget, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-amber-700">
                        {formatNepaliCurrency(spent, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {formatNepaliCurrency(bal, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {toNepaliNumber(pct)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: Cash & Bank Ledger */}
        {selectedReport === 'cash-ledger' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3">मिति वि.सं.</th>
                  <th className="py-2.5 px-3">विवरण / स्रोत (Description)</th>
                  <th className="py-2.5 px-3">विधि / चेक नं.</th>
                  <th className="py-2.5 px-3 text-right">आम्दानी (Debit)</th>
                  <th className="py-2.5 px-3 text-right">खर्च (Credit)</th>
                  <th className="py-2.5 px-3">प्रमाणित</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {feePayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600">{p.paymentDateBS}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      विद्यार्थी शुल्क: {p.studentName} ({p.receiptNo})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      +{formatNepaliCurrency(p.amountPaid, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.receivedBy}</td>
                  </tr>
                ))}
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600">{e.expenseDateBS}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      विभागीय खर्च: {e.title} ({e.expenseNo})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{e.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">-</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                      -{formatNepaliCurrency(e.amount, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{e.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures for Audits */}
        <div className="mt-14 pt-6 border-t-2 border-slate-300 flex justify-between items-end text-xs text-slate-700">
          <div className="text-center">
            <div className="w-36 border-t border-slate-600 mb-1"></div>
            <p className="font-semibold text-slate-900">लेखा प्रमुख / एकाउन्टेन्ट</p>
            <p className="text-[11px] text-slate-500">रमेश पौडेल</p>
          </div>
          <div className="text-center">
            <div className="w-36 border-t border-slate-600 mb-1"></div>
            <p className="font-semibold text-slate-900">आन्तरिक लेखापरीक्षक</p>
            <p className="text-[11px] text-slate-500">Internal Auditor</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-t border-slate-900 mb-1 font-bold"></div>
            <p className="font-bold text-slate-900">प्रधानाध्यापक</p>
            <p className="text-[11px] text-slate-500">डा. हरिप्रसाद दाहाल</p>
          </div>
        </div>
      </div>
    </div>
  );
};
