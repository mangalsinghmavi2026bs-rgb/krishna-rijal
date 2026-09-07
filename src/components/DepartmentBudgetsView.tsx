import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Department, BudgetExpense, Language } from '../types';
import {
  formatNepaliCurrency,
  generateExpenseNo,
  toNepaliNumber
} from '../utils/nepaliUtils';

interface DepartmentBudgetsViewProps {
  departments: Department[];
  expenses: BudgetExpense[];
  language: Language;
  onAddExpense: (expense: BudgetExpense) => void;
  onAddDepartment: (department: Department) => void;
  isNewExpenseOpen: boolean;
  setIsNewExpenseOpen: (open: boolean) => void;
}

export const DepartmentBudgetsView: React.FC<DepartmentBudgetsViewProps> = ({
  departments,
  expenses,
  language,
  onAddExpense,
  onAddDepartment,
  isNewExpenseOpen,
  setIsNewExpenseOpen,
}) => {
  const isNe = language === 'ne';

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

  // New Expense Form State
  const [deptId, setDeptId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ल्याब उपकरण तथा सामग्री');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [billRefNo, setBillRefNo] = useState('');
  const [approvedBy, setApprovedBy] = useState('डा. हरिप्रसाद दाहाल (प्र.अ.)');
  const [paymentMethod, setPaymentMethod] = useState('बैंक चेक (Cheque)');

  // New Department Form State
  const [newDept, setNewDept] = useState({
    nameNepali: '',
    nameEnglish: '',
    code: `विभाग-०${departments.length + 1}`,
    headOfDepartment: '',
    allocatedBudget: 300000,
    color: '#3B82F6',
  });

  const selectedDept = departments.find((d) => d.id === deptId);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || amount <= 0) return;

    const newExpense: BudgetExpense = {
      id: `exp-${Date.now()}`,
      expenseNo: generateExpenseNo(expenses.length + 19),
      departmentId: selectedDept.id,
      departmentName: selectedDept.nameNepali,
      title,
      category,
      vendor,
      amount,
      expenseDateBS: '२०८१/०५/२२',
      billRefNo: billRefNo || 'बिल-प्रमाणित',
      approvedBy,
      paymentMethod,
      status: 'स्वीकृत (Approved)',
    };

    onAddExpense(newExpense);
    setIsNewExpenseOpen(false);
    // Reset
    setDeptId('');
    setTitle('');
    setVendor('');
    setAmount(0);
    setBillRefNo('');
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.nameNepali) return;

    const dept: Department = {
      id: `dept-${Date.now()}`,
      code: newDept.code,
      nameNepali: newDept.nameNepali,
      nameEnglish: newDept.nameEnglish || newDept.nameNepali,
      headOfDepartment: newDept.headOfDepartment,
      allocatedBudget: Number(newDept.allocatedBudget),
      fiscalYearBS: '२०८१/०८२',
      color: newDept.color,
    };

    onAddDepartment(dept);
    setIsAddDeptOpen(false);
    setNewDept({
      nameNepali: '',
      nameEnglish: '',
      code: `विभाग-०${departments.length + 2}`,
      headOfDepartment: '',
      allocatedBudget: 300000,
      color: '#3B82F6',
    });
  };

  // Metrics
  const totalAllocated = departments.reduce((s, d) => s + d.allocatedBudget, 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.expenseNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDeptFilter === 'all' || e.departmentId === selectedDeptFilter;
    return matchQuery && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? 'विभागीय बजेट स्थिति (Budget Overview)' : 'Budget Overview'}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'expenses'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? 'विभागीय खर्च प्रविष्टि अभिलेख' : 'Expense Log'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddDeptOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-300"
          >
            <Plus className="w-4 h-4" />
            <span>{isNe ? 'नयाँ विभाग थप्नुहोस्' : 'Add Department'}</span>
          </button>
          <button
            onClick={() => setIsNewExpenseOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Wallet className="w-4 h-4" />
            <span>{isNe ? 'नयाँ खर्च प्रविष्टि (Record Expense)' : 'Record Expense'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'कुल विनियोजित बजेट' : 'Total Allocated'}
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatNepaliCurrency(totalAllocated, { inNepaliDigits: isNe })}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {isNe ? 'आर्थिक वर्ष २०८१/०८२ बजेट' : 'Annual Budget'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'हालसम्मको कुल खर्च' : 'Total Spent'}
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {formatNepaliCurrency(totalSpent, { inNepaliDigits: isNe })}
          </div>
          <span className="text-xs text-amber-600 mt-0.5 block">
            {isNe ? `${toNepaliNumber(expenses.length)} वटा शीर्षकमा खर्च` : `${expenses.length} vouchers logged`}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'बाँकी कुल बजेट' : 'Remaining Balance'}
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {formatNepaliCurrency(totalRemaining, { inNepaliDigits: isNe })}
          </div>
          <span className="text-xs text-emerald-600 mt-0.5 block">
            {isNe ? 'उपलब्ध मौज्दात रकम' : 'Available Funds'}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isNe ? 'समग्र बजेट उपयोग दर' : 'Utilization Rate'}
          </span>
          <div className="text-xl font-bold text-blue-700 mt-1">
            {toNepaliNumber(overallUtilization)}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${overallUtilization}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab 1: Department Cards Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const deptExpenses = expenses.filter((e) => e.departmentId === dept.id);
            const spent = deptExpenses.reduce((sum, e) => sum + e.amount, 0);
            const balance = dept.allocatedBudget - spent;
            const percent = dept.allocatedBudget > 0 ? Math.round((spent / dept.allocatedBudget) * 100) : 0;
            const isOverBudget = percent >= 90;

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                        {dept.code}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                        {dept.nameNepali}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        विभागीय प्रमुख: <strong className="text-slate-700">{dept.headOfDepartment}</strong>
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: dept.color }}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Budget Figures */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">विनियोजित बजेट:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatNepaliCurrency(dept.allocatedBudget, { inNepaliDigits: isNe })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">हालसम्मको खर्च:</span>
                      <span className="font-bold text-amber-700 text-sm">
                        {formatNepaliCurrency(spent, { inNepaliDigits: isNe })}
                      </span>
                    </div>
                  </div>

                  {/* Utilization Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">खर्च दर:</span>
                      <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
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
                  </div>
                </div>

                {/* Bottom Balance & Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">बाँकी मौज्दात:</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatNepaliCurrency(balance, { inNepaliDigits: isNe })}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDeptId(dept.id);
                      setIsNewExpenseOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                  >
                    + खर्च प्रविष्टि
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Expense Log Table */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={isNe ? 'खर्च शीर्षक, बिल नं. वा विक्रेता...' : 'Search expense or vendor...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="all">{isNe ? 'सबै विभागहरू (All Departments)' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameNepali}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">खर्च नं.</th>
                  <th className="py-3 px-4">विभाग</th>
                  <th className="py-3 px-4">खर्च शीर्षक / प्रयोजन</th>
                  <th className="py-3 px-4">वर्ग (Category)</th>
                  <th className="py-3 px-4">विक्रेता / आपूर्तिकर्ता</th>
                  <th className="py-3 px-4">मिति वि.सं.</th>
                  <th className="py-3 px-4">बिल नं.</th>
                  <th className="py-3 px-4 text-right">रकम रु.</th>
                  <th className="py-3 px-4">अवस्था</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors text-slate-800">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{exp.expenseNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {exp.departmentName.split('(')[0]}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{exp.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{exp.vendor}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.expenseDateBS}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{exp.billRefNo}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      -{formatNepaliCurrency(exp.amount, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Record Department Expense */}
      {isNewExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="px-6 py-4 bg-blue-700 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isNe ? 'विभागीय खर्च प्रविष्टि फाराम' : 'Record Department Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewExpenseOpen(false)}
                className="text-blue-100 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">विभाग छनोट गर्नुहोस् (Department)*</label>
                <select
                  required
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  <option value="">-- विभाग छान्नुहोस् --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameNepali} [विनियोजित: रु. {d.allocatedBudget}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">खर्चको शीर्षक / विवरण*</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. विज्ञान ल्याबका लागि केमिकल तथा माइक्रोस्कोप खरिद"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">खर्च वर्ग (Category)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">खर्च रकम रु.*</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 bg-white border-2 border-blue-600 rounded-lg text-xs font-bold text-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">विक्रेता / सप्लायर्सको नाम*</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. साझा स्टेशनरी एण्ड सप्लायर्स"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">बिल / भ्याट नं. (Bill Ref)</label>
                  <input
                    type="text"
                    placeholder="उदा. बिल-१०२४/०८१"
                    value={billRefNo}
                    onChange={(e) => setBillRefNo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">भुक्तानी विधि</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="बैंक चेक (Cheque)">बैंक चेक (Cheque)</option>
                    <option value="बैंक ट्रान्सफर (Bank)">बैंक ट्रान्सफर (Bank)</option>
                    <option value="नगद (Cash Voucher)">नगद (Cash Voucher)</option>
                    <option value="eSewa Corporate">eSewa Corporate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">स्वीकृत गर्ने अधिकारी</label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={!selectedDept || amount <= 0}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold disabled:opacity-50"
                >
                  खर्च स्वीकृत गरी अभिलेख राख्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Department */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">
                  {isNe ? 'नयाँ विभाग तथा बजेट विनियोजन' : 'Add Department & Budget'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddDeptOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">विभागको नाम (नेपालीमा)*</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. संगीत तथा कला विभाग"
                  value={newDept.nameNepali}
                  onChange={(e) => setNewDept({ ...newDept, nameNepali: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Department Name in English</label>
                <input
                  type="text"
                  placeholder="Music & Fine Arts Department"
                  value={newDept.nameEnglish}
                  onChange={(e) => setNewDept({ ...newDept, nameEnglish: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">विभाग कोड</label>
                  <input
                    type="text"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">विभागीय प्रमुख (HOD)</label>
                  <input
                    type="text"
                    placeholder="शिक्षकको नाम"
                    value={newDept.headOfDepartment}
                    onChange={(e) => setNewDept({ ...newDept, headOfDepartment: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">विनियोजित बजेट रु. (वार्षिक)*</label>
                <input
                  type="number"
                  required
                  min="10000"
                  value={newDept.allocatedBudget}
                  onChange={(e) => setNewDept({ ...newDept, allocatedBudget: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  विभाग तथा बजेट सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
