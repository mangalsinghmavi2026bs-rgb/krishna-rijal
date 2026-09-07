import React, { useState } from 'react';
import {
  Users,
  Plus,
  Printer,
  FileCheck,
  CheckCircle2,
  DollarSign,
  Building2,
  Phone,
  Eye,
  X
} from 'lucide-react';
import { Employee, PayrollRecord, Language, SchoolProfile } from '../types';
import {
  formatNepaliCurrency,
  generateVoucherNo,
  numberToNepaliWords,
  toNepaliNumber,
  NEPALI_MONTHS_SHORT
} from '../utils/nepaliUtils';

interface PayrollViewProps {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  schoolProfile: SchoolProfile;
  language: Language;
  onAddPayrollRecord: (record: PayrollRecord) => void;
  onAddEmployee: (employee: Employee) => void;
  isNewPayrollOpen: boolean;
  setIsNewPayrollOpen: (open: boolean) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  payrollRecords,
  schoolProfile,
  language,
  onAddPayrollRecord,
  onAddEmployee,
  isNewPayrollOpen,
  setIsNewPayrollOpen,
}) => {
  const isNe = language === 'ne';

  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'employees'>('payroll');
  const [selectedMonth, setSelectedMonth] = useState<string>('भाद्र २०८१');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // New Payroll Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [extraHours, setExtraHours] = useState<number>(0);
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('बैंक खाता ट्रान्सफर (Bank Transfer)');
  const [payrollMonth, setPayrollMonth] = useState('भाद्र २०८१');

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    nameNepali: '',
    nameEnglish: '',
    empCode: `कर्मचारी-०${employees.length + 1}`,
    designation: 'शिक्षक (Teacher)',
    department: 'विज्ञान विभाग (Science)',
    basicSalary: 35000,
    allowance: 5000,
    overtimeRate: 400,
    citAmount: 2000,
    tdsPercent: 5,
    panNumber: '',
    bankAccount: '',
    phone: '',
  });

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Dynamic Payroll calculations
  const basic = selectedEmployee ? selectedEmployee.basicSalary : 0;
  const allowance = selectedEmployee ? selectedEmployee.allowance : 0;
  const extraPay = selectedEmployee ? extraHours * selectedEmployee.overtimeRate : 0;
  const gross = basic + allowance + extraPay;

  // 10% PF by Employee and 10% by Employer (Nepali law standard)
  const pfEmployee = selectedEmployee ? Math.round((basic * selectedEmployee.pfDeductionPercent) / 100) : 0;
  const pfEmployer = pfEmployee;
  const cit = selectedEmployee ? selectedEmployee.citAmount : 0;
  const tds = selectedEmployee ? Math.round((gross * selectedEmployee.tdsPercent) / 100) : 0;
  const totalDeductions = pfEmployee + cit + tds + advanceDeduction;
  const netPayable = Math.max(0, gross - totalDeductions);

  const handleCreatePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const record: PayrollRecord = {
      id: `pr-${Date.now()}`,
      voucherNo: generateVoucherNo(payrollRecords.length + 10),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.nameNepali,
      designation: selectedEmployee.designation,
      monthBS: payrollMonth,
      yearBS: '२०८१',
      basicSalary: basic,
      allowance,
      extraHours,
      extraPay,
      grossSalary: gross,
      pfEmployee,
      pfEmployer,
      citDeduction: cit,
      tdsDeduction: tds,
      advanceDeduction,
      totalDeductions,
      netPayable,
      status: 'भुक्तानी भयो (Paid)',
      paymentDateBS: '२०८१/०५/२२',
      paymentMethod,
      approvedBy: 'डा. हरिप्रसाद दाहाल (प्र.अ.)',
    };

    onAddPayrollRecord(record);
    setIsNewPayrollOpen(false);
    setSelectedEmployeeId('');
    setExtraHours(0);
    setAdvanceDeduction(0);
    // View Payslip immediately!
    setSelectedPayslip(record);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.nameNepali) return;

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      empCode: newEmp.empCode,
      nameNepali: newEmp.nameNepali,
      nameEnglish: newEmp.nameEnglish || newEmp.nameNepali,
      designation: newEmp.designation,
      department: newEmp.department,
      joinDateBS: '२०८१/०१/०१',
      basicSalary: Number(newEmp.basicSalary),
      allowance: Number(newEmp.allowance),
      overtimeRate: Number(newEmp.overtimeRate),
      pfDeductionPercent: 10,
      citAmount: Number(newEmp.citAmount),
      tdsPercent: Number(newEmp.tdsPercent),
      panNumber: newEmp.panNumber || '१००००००००',
      bankAccount: newEmp.bankAccount || 'नेपाल बैंक लि.',
      phone: newEmp.phone,
      status: 'active',
    };

    onAddEmployee(employee);
    setIsAddEmployeeOpen(false);
    setNewEmp({
      nameNepali: '',
      nameEnglish: '',
      empCode: `कर्मचारी-०${employees.length + 2}`,
      designation: 'शिक्षक (Teacher)',
      department: 'विज्ञान विभाग (Science)',
      basicSalary: 35000,
      allowance: 5000,
      overtimeRate: 400,
      citAmount: 2000,
      tdsPercent: 5,
      panNumber: '',
      bankAccount: '',
      phone: '',
    });
  };

  // Summary Metrics
  const totalPayrollThisMonth = payrollRecords
    .filter((p) => p.status === 'भुक्तानी भयो (Paid)')
    .reduce((sum, p) => sum + p.netPayable, 0);
  const totalPfAccumulated = payrollRecords.reduce((sum, p) => sum + p.pfEmployee + p.pfEmployer, 0);
  const totalTdsCollected = payrollRecords.reduce((sum, p) => sum + p.tdsDeduction, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'payroll'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? 'मासिक तलब भुक्तानी भौचर (Payroll Register)' : 'Payroll Vouchers'}
          </button>
          <button
            onClick={() => setActiveSubTab('employees')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'employees'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? 'कर्मचारी तथा पारिश्रमिक संरचना' : 'Staff & Salary Structure'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-300"
          >
            <Plus className="w-4 h-4" />
            <span>{isNe ? 'नयाँ शिक्षक/कर्मचारी थप्नुहोस्' : 'Add Staff'}</span>
          </button>
          <button
            onClick={() => setIsNewPayrollOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>{isNe ? 'नयाँ तलब भौचर (Generate Payroll)' : 'Generate Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'कुल भुक्तानी भएको तलब' : 'Total Net Payroll'}
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatNepaliCurrency(totalPayrollThisMonth, { inNepaliDigits: isNe })}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {isNe ? `${toNepaliNumber(payrollRecords.length)} वटा भौचर जारी` : `${payrollRecords.length} vouchers issued`}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'कर्मचारी सञ्चय कोष (PF १०% + १०%)' : 'Provident Fund (PF)'}
          </span>
          <div className="text-xl font-bold text-indigo-700 mt-1">
            {formatNepaliCurrency(totalPfAccumulated, { inNepaliDigits: isNe })}
          </div>
          <span className="text-xs text-indigo-600 mt-0.5 block">
            {isNe ? 'कर्मचारी + विद्यालय योगदान' : 'Employee + School matching'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'आयकर कट्टी (TDS Tax)' : 'TDS Income Tax'}
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {formatNepaliCurrency(totalTdsCollected, { inNepaliDigits: isNe })}
          </div>
          <span className="text-xs text-emerald-600 mt-0.5 block">
            {isNe ? 'आन्तरिक राजस्व कार्यालय दाखिला योग्य' : 'Payable to Inland Revenue'}
          </span>
        </div>
      </div>

      {/* SubTab 1: Payroll Register Table */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              {isNe ? 'कर्मचारी तलब भुक्तानी रजिस्टर (Payroll Vouchers)' : 'Payroll Voucher Register'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {isNe ? `जम्मा ${toNepaliNumber(payrollRecords.length)} रेकर्डहरू` : `${payrollRecords.length} records`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-3">भौचर नं.</th>
                  <th className="py-3 px-3">कर्मचारीको नाम</th>
                  <th className="py-3 px-3">पद</th>
                  <th className="py-3 px-3">महिना</th>
                  <th className="py-3 px-3 text-right">मूल तलब</th>
                  <th className="py-3 px-3 text-right">भत्ता</th>
                  <th className="py-3 px-3 text-right">कुल पारिश्रमिक</th>
                  <th className="py-3 px-3 text-right">सञ्चय कोष (१०%)</th>
                  <th className="py-3 px-3 text-right">नागरिक लगानी</th>
                  <th className="py-3 px-3 text-right">टीडीएस (कर)</th>
                  <th className="py-3 px-3 text-right">जम्मा कट्टी</th>
                  <th className="py-3 px-3 text-right font-bold">खुद भुक्तानी (Net)</th>
                  <th className="py-3 px-3 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors text-slate-800">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{r.voucherNo}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{r.employeeName}</td>
                    <td className="py-3 px-3 text-slate-600">{r.designation}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{r.monthBS}</td>
                    <td className="py-3 px-3 text-right font-medium">
                      {formatNepaliCurrency(r.basicSalary, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatNepaliCurrency(r.allowance, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatNepaliCurrency(r.grossSalary, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-600">
                      {formatNepaliCurrency(r.pfEmployee, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-600">
                      {formatNepaliCurrency(r.citDeduction, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600">
                      {formatNepaliCurrency(r.tdsDeduction, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-rose-700">
                      -{formatNepaliCurrency(r.totalDeductions, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800 bg-emerald-50/50">
                      {formatNepaliCurrency(r.netPayable, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedPayslip(r)}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                        title="पे-स्लिप हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>पे-स्लिप</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Staff & Salary Structure Table */}
      {activeSubTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              {isNe ? 'शिक्षक तथा कर्मचारी पारिश्रमिक संरचना' : 'Staff Directory & Salary Structure'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {isNe ? `जम्मा ${toNepaliNumber(employees.length)} जना कर्मचारी` : `${employees.length} employees`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">संकेत नं.</th>
                  <th className="py-3 px-4">कर्मचारीको नाम</th>
                  <th className="py-3 px-4">पद</th>
                  <th className="py-3 px-4">शाखा/विभाग</th>
                  <th className="py-3 px-4 text-right">मूल तलब</th>
                  <th className="py-3 px-4 text-right">भत्ता</th>
                  <th className="py-3 px-4 text-right">सञ्चय कोष %</th>
                  <th className="py-3 px-4 text-right">नागरिक लगानी रु.</th>
                  <th className="py-3 px-4">पान नं. / बैंक खाता</th>
                  <th className="py-3 px-4 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors text-slate-800">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{emp.empCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.nameNepali}</div>
                      <div className="text-[11px] text-slate-500">{emp.nameEnglish}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{emp.designation}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatNepaliCurrency(emp.basicSalary, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatNepaliCurrency(emp.allowance, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-700 font-medium">
                      {toNepaliNumber(emp.pfDeductionPercent)}%
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-700 font-medium">
                      {formatNepaliCurrency(emp.citAmount, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <div>PAN: <strong className="text-slate-900">{emp.panNumber}</strong></div>
                      <div className="truncate max-w-[140px] text-slate-500">{emp.bankAccount}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setIsNewPayrollOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] transition-colors"
                      >
                        {isNe ? 'तलब काट्नुहोस्' : 'Pay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Generate Payroll Voucher */}
      {isNewPayrollOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="px-6 py-4 bg-blue-700 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isNe ? 'कर्मचारी तलब भौचर जारी फाराम' : 'Generate Staff Payroll Voucher'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewPayrollOpen(false)}
                className="text-blue-100 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayroll} className="p-6 space-y-4 text-xs">
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कर्मचारी छनोट गर्नुहोस् (Select Employee)*
                </label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- कर्मचारी छान्नुहोस् --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nameNepali} ({emp.designation}) [मूल तलब: रु. {emp.basicSalary}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">पारिश्रमिक महिना (Salary Month)</label>
                  <input
                    type="text"
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">भुक्तानी विधि (Payment Method)</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="बैंक खाता ट्रान्सफर (Bank Transfer)">बैंक खाता ट्रान्सफर (Bank)</option>
                    <option value="बैंक चेक (Bank Cheque)">बैंक चेक (Cheque)</option>
                    <option value="नगद भुक्तानी (Cash)">नगद भुक्तानी (Cash)</option>
                  </select>
                </div>
              </div>

              {selectedEmployee && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
                    <span>पारिश्रमिक हिसाब विवरण ({selectedEmployee.nameNepali})</span>
                    <span>{selectedEmployee.designation}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">मूल तलब (Basic):</span>
                      <span className="font-semibold text-slate-900">रु. {basic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">भत्ता (Allowance):</span>
                      <span className="font-semibold text-slate-900">रु. {allowance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">सञ्चय कोष (PF १०% कट्टी):</span>
                      <span className="font-semibold text-indigo-700">-रु. {pfEmployee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">नागरिक लगानी कोष (CIT):</span>
                      <span className="font-semibold text-indigo-700">-रु. {cit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">आयकर टीडीएस ({selectedEmployee.tdsPercent}%):</span>
                      <span className="font-semibold text-rose-700">-रु. {tds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">विद्यालय PF योगदान:</span>
                      <span className="font-medium text-slate-500">+रु. {pfEmployer}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Hours & Advance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    अतिरिक्त कक्षा/समय (Extra Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extraHours || ''}
                    onChange={(e) => setExtraHours(Number(e.target.value))}
                    placeholder="0 घण्टा"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                  {extraPay > 0 && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      +रु. {extraPay} अतिरिक्त पारिश्रमिक
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    पेस्की कट्टी रु. (Advance Deduction)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={advanceDeduction || ''}
                    onChange={(e) => setAdvanceDeduction(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs text-emerald-800 font-semibold block">खुद भुक्तानी योग्य पारिश्रमिक:</span>
                  <span className="text-[11px] text-emerald-600 italic">
                    {numberToNepaliWords(netPayable)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-900">
                  {formatNepaliCurrency(netPayable, { inNepaliDigits: isNe })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPayrollOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployee}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  तलब भुक्तानी प्रमाणित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">
                  {isNe ? 'नयाँ शिक्षक तथा कर्मचारी दर्ता' : 'Register New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">कर्मचारीको नाम (नेपालीमा)*</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. गोपाल अधिकारी"
                    value={newEmp.nameNepali}
                    onChange={(e) => setNewEmp({ ...newEmp, nameNepali: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Name in English</label>
                  <input
                    type="text"
                    placeholder="Gopal Adhikari"
                    value={newEmp.nameEnglish}
                    onChange={(e) => setNewEmp({ ...newEmp, nameEnglish: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">पद (Designation)*</label>
                  <input
                    type="text"
                    required
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">शाखा / विभाग</label>
                  <input
                    type="text"
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">मूल तलब रु. (Basic)*</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newEmp.basicSalary}
                    onChange={(e) => setNewEmp({ ...newEmp, basicSalary: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">भत्ता रु. (Allowance)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEmp.allowance}
                    onChange={(e) => setNewEmp({ ...newEmp, allowance: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">नागरिक लगानी (CIT)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEmp.citAmount}
                    onChange={(e) => setNewEmp({ ...newEmp, citAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">टीडीएस कर %</label>
                  <input
                    type="number"
                    min="0"
                    max="36"
                    value={newEmp.tdsPercent}
                    onChange={(e) => setNewEmp({ ...newEmp, tdsPercent: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">अतिरिक्त दर/घण्टा</label>
                  <input
                    type="number"
                    min="0"
                    value={newEmp.overtimeRate}
                    onChange={(e) => setNewEmp({ ...newEmp, overtimeRate: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">स्थायी लेखा नं. (PAN)*</label>
                  <input
                    type="text"
                    required
                    placeholder="१०२९३८४७५"
                    value={newEmp.panNumber}
                    onChange={(e) => setNewEmp({ ...newEmp, panNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">सम्पर्क फोन नं.*</label>
                  <input
                    type="text"
                    required
                    placeholder="९८४१००००००"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">बैंक खाता विवरण</label>
                <input
                  type="text"
                  placeholder="००२१००१२३४५६७ (राष्ट्रिय वाणिज्य बैंक)"
                  value={newEmp.bankAccount}
                  onChange={(e) => setNewEmp({ ...newEmp, bankAccount: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  कर्मचारी दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Staff Payslip */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
              <span className="text-sm font-bold text-slate-800">
                {isNe ? 'कर्मचारी तलब भरपाई / पे-स्लिप' : 'Staff Salary Pay Slip'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिन्ट गर्नुहोस्</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-8 bg-white text-slate-900 font-sans">
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h2 className="text-xl font-bold">{schoolProfile.nameNepali}</h2>
                <p className="text-xs text-slate-600">{schoolProfile.addressNepali} | PAN: {schoolProfile.panNo}</p>
                <div className="mt-2 inline-block px-4 py-0.5 border border-slate-900 rounded-full font-bold text-xs bg-slate-100 uppercase">
                  मासिक तलब भरपाई (Pay Slip) - {selectedPayslip.monthBS}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <p>भौचर नं.: <strong className="font-mono">{selectedPayslip.voucherNo}</strong></p>
                  <p className="mt-1">कर्मचारीको नाम: <strong className="text-sm">{selectedPayslip.employeeName}</strong></p>
                  <p>पद: <strong>{selectedPayslip.designation}</strong></p>
                </div>
                <div className="text-right">
                  <p>मिति वि.सं.: <strong>{selectedPayslip.paymentDateBS}</strong></p>
                  <p className="mt-1">महिना: <strong>{selectedPayslip.monthBS}</strong></p>
                  <p>भुक्तानी विधि: <strong>{selectedPayslip.paymentMethod}</strong></p>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-4 my-4 text-xs">
                {/* Earnings */}
                <div className="border border-slate-300 rounded-lg p-3">
                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 uppercase">
                    आम्दानी / पारिश्रमिक (Earnings)
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>मूल तलब (Basic Salary):</span>
                      <span className="font-semibold">{formatNepaliCurrency(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>महँगी तथा अन्य भत्ता:</span>
                      <span className="font-semibold">{formatNepaliCurrency(selectedPayslip.allowance)}</span>
                    </div>
                    {selectedPayslip.extraPay > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>अतिरिक्त समय/कक्षा भत्ता:</span>
                        <span className="font-semibold">+{formatNepaliCurrency(selectedPayslip.extraPay)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                      <span>कुल पारिश्रमिक (Gross):</span>
                      <span>{formatNepaliCurrency(selectedPayslip.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-300 rounded-lg p-3">
                  <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 uppercase">
                    कट्टी रकम (Deductions)
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>कर्मचारी सञ्चय कोष (PF १०%):</span>
                      <span className="font-semibold">{formatNepaliCurrency(selectedPayslip.pfEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>नागरिक लगानी कोष (CIT):</span>
                      <span className="font-semibold">{formatNepaliCurrency(selectedPayslip.citDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>आयकर सामाजिक सुरक्षा टीडीएस:</span>
                      <span className="font-semibold">{formatNepaliCurrency(selectedPayslip.tdsDeduction)}</span>
                    </div>
                    {selectedPayslip.advanceDeduction > 0 && (
                      <div className="flex justify-between">
                        <span>पेस्की कट्टी:</span>
                        <span className="font-semibold">{formatNepaliCurrency(selectedPayslip.advanceDeduction)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-rose-700">
                      <span>जम्मा कट्टी (Total Deductions):</span>
                      <span>-{formatNepaliCurrency(selectedPayslip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable */}
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center text-sm font-bold">
                <span>खुद भुक्तानी रकम (Net Payable Amount):</span>
                <span className="text-base text-blue-900">
                  {formatNepaliCurrency(selectedPayslip.netPayable)}
                </span>
              </div>

              <div className="mt-2 text-xs italic text-slate-700">
                अक्षरेपी: <strong>{numberToNepaliWords(selectedPayslip.netPayable)}</strong>
              </div>

              <div className="mt-12 pt-6 flex justify-between text-xs text-slate-700">
                <div className="text-center">
                  <div className="w-32 border-t border-slate-500 mb-1"></div>
                  <p>कर्मचारीको हस्ताक्षर</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-t border-slate-500 mb-1"></div>
                  <p>लेखा अधिकृत</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-t border-slate-900 mb-1 font-bold"></div>
                  <p className="font-bold">प्रधानाध्यापक</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
