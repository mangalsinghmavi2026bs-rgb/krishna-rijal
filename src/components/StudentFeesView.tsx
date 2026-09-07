import React, { useState } from 'react';
import {
  Search,
  Plus,
  Receipt,
  GraduationCap,
  Eye,
  AlertCircle,
  CheckCircle2,
  Phone,
  Bus,
  Award
} from 'lucide-react';
import { Student, FeePayment, PaymentMethod, Language } from '../types';
import { formatNepaliCurrency, generateReceiptNo, toNepaliNumber } from '../utils/nepaliUtils';

interface StudentFeesViewProps {
  students: Student[];
  feePayments: FeePayment[];
  language: Language;
  onAddFeePayment: (payment: FeePayment) => void;
  onAddStudent: (student: Student) => void;
  onViewReceipt: (payment: FeePayment) => void;
  isNewPaymentOpen: boolean;
  setIsNewPaymentOpen: (open: boolean) => void;
}

export const StudentFeesView: React.FC<StudentFeesViewProps> = ({
  students,
  feePayments,
  language,
  onAddFeePayment,
  onAddStudent,
  onViewReceipt,
  isNewPaymentOpen,
  setIsNewPaymentOpen,
}) => {
  const isNe = language === 'ne';

  // Sub-tabs: 'receipts' or 'students'
  const [subTab, setSubTab] = useState<'receipts' | 'students'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [filterDuesOnly, setFilterDuesOnly] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Fee Collection Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [includeMonthlyFee, setIncludeMonthlyFee] = useState(true);
  const [includeBusFee, setIncludeBusFee] = useState(true);
  const [includeExamFee, setIncludeExamFee] = useState(false);
  const [includeLabFee, setIncludeLabFee] = useState(false);
  const [miscFee, setMiscFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [fineAmount, setFineAmount] = useState<number>(0);
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('नगद (Cash)');
  const [monthBilled, setMonthBilled] = useState('भाद्र २०८१');
  const [remarks, setRemarks] = useState('');
  const [receivedBy, setReceivedBy] = useState('रमेश पौडेल (लेखापाल)');

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    nameNepali: '',
    nameEnglish: '',
    grade: 'कक्षा १० (Grade 10)',
    section: 'A',
    rollNo: 1,
    guardianName: '',
    phone: '',
    monthlyFee: 4500,
    busFacility: false,
    busFee: 1500,
    scholarshipPercent: 0,
  });

  const gradesList = Array.from(new Set(students.map((s) => s.grade)));

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Calculate dynamic fees for modal
  const monthlyAmount = selectedStudent && includeMonthlyFee ? selectedStudent.monthlyFee : 0;
  const busAmount = selectedStudent && selectedStudent.busFacility && includeBusFee ? selectedStudent.busFee : 0;
  const examAmount = includeExamFee ? 800 : 0;
  const labAmount = includeLabFee ? 600 : 0;
  const calculatedSubTotal = monthlyAmount + busAmount + examAmount + labAmount + miscFee;
  const autoDiscount = selectedStudent && selectedStudent.scholarshipPercent > 0
    ? Math.round((monthlyAmount * selectedStudent.scholarshipPercent) / 100)
    : 0;
  const effectiveDiscount = discountAmount > 0 ? discountAmount : autoDiscount;
  const netDue = Math.max(0, calculatedSubTotal - effectiveDiscount + fineAmount);
  const actualAmountPaid = amountPaidInput === '' ? netDue : Number(amountPaidInput);
  const remainingDue = Math.max(0, netDue - actualAmountPaid);

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const items = [];
    if (includeMonthlyFee) {
      items.push({ id: 'item-m', category: `मासिक शुल्क (${monthBilled})`, amount: monthlyAmount });
    }
    if (includeBusFee && selectedStudent.busFacility) {
      items.push({ id: 'item-b', category: 'यातायात बस शुल्क', amount: busAmount });
    }
    if (includeExamFee) {
      items.push({ id: 'item-e', category: 'परीक्षा शुल्क', amount: examAmount });
    }
    if (includeLabFee) {
      items.push({ id: 'item-l', category: 'कम्प्युटर / विज्ञान ल्याब शुल्क', amount: labAmount });
    }
    if (miscFee > 0) {
      items.push({ id: 'item-x', category: 'विविध शैक्षिक शुल्क', amount: miscFee });
    }

    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      receiptNo: generateReceiptNo(feePayments.length + 25),
      studentId: selectedStudent.id,
      studentName: selectedStudent.nameNepali,
      grade: selectedStudent.grade,
      paymentDateBS: '२०८१/०५/२२',
      paymentDateAD: new Date().toISOString().split('T')[0],
      items,
      subTotal: calculatedSubTotal,
      discount: effectiveDiscount,
      fine: fineAmount,
      amountPaid: actualAmountPaid,
      remainingDue,
      paymentMethod,
      monthBilled,
      receivedBy,
      remarks: remarks || 'नियमित शुल्क संकलन',
    };

    onAddFeePayment(newPayment);
    setIsNewPaymentOpen(false);
    // Reset form
    setSelectedStudentId('');
    setAmountPaidInput('');
    setRemarks('');
    // Open receipt modal right after!
    onViewReceipt(newPayment);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.nameNepali) return;

    const student: Student = {
      id: `std-${Date.now()}`,
      rollNo: Number(newStudent.rollNo),
      nameNepali: newStudent.nameNepali,
      nameEnglish: newStudent.nameEnglish || newStudent.nameNepali,
      grade: newStudent.grade,
      section: newStudent.section,
      guardianName: newStudent.guardianName,
      phone: newStudent.phone,
      monthlyFee: Number(newStudent.monthlyFee),
      busFacility: Boolean(newStudent.busFacility),
      busFee: newStudent.busFacility ? Number(newStudent.busFee) : 0,
      scholarshipPercent: Number(newStudent.scholarshipPercent),
      totalPaid: 0,
      totalDues: Number(newStudent.monthlyFee),
      status: 'active',
    };

    onAddStudent(student);
    setIsAddStudentOpen(false);
    setNewStudent({
      nameNepali: '',
      nameEnglish: '',
      grade: 'कक्षा १० (Grade 10)',
      section: 'A',
      rollNo: students.length + 1,
      guardianName: '',
      phone: '',
      monthlyFee: 4500,
      busFacility: false,
      busFee: 1500,
      scholarshipPercent: 0,
    });
  };

  // Filtered Payments
  const filteredPayments = feePayments.filter((p) => {
    const matchQuery =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGrade = selectedGrade === 'all' || p.grade === selectedGrade;
    return matchQuery && matchGrade;
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.nameNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchGrade = selectedGrade === 'all' || s.grade === selectedGrade;
    const matchDues = !filterDuesOnly || s.totalDues > 0;
    return matchQuery && matchGrade && matchDues;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('receipts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'receipts'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? 'शुल्क संकलन रसिदहरू (Receipts)' : 'Fee Receipts'}
          </button>
          <button
            onClick={() => setSubTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'students'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNe ? 'विद्यार्थी नामावली तथा बक्यौता' : 'Students & Dues'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-300"
          >
            <Plus className="w-4 h-4" />
            <span>{isNe ? 'नयाँ विद्यार्थी दर्ता' : 'Add Student'}</span>
          </button>
          <button
            onClick={() => setIsNewPaymentOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>{isNe ? 'रसिद काट्नुहोस् (Collect Fee)' : 'Collect Fee'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={isNe ? 'विद्यार्थीको नाम वा रसिद नं. खोज्नुहोस्...' : 'Search student or receipt...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isNe ? 'सबै कक्षाहरू (All Grades)' : 'All Grades'}</option>
            {gradesList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Dues only filter */}
          {subTab === 'students' && (
            <label className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={filterDuesOnly}
                onChange={(e) => setFilterDuesOnly(e.target.checked)}
                className="rounded-sm text-amber-600 focus:ring-amber-500"
              />
              <span>{isNe ? 'बाँकी बक्यौता मात्र' : 'Dues Only'}</span>
            </label>
          )}
        </div>
      </div>

      {/* SubTab 1: Fee Receipts Table */}
      {subTab === 'receipts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              {isNe ? 'जारी गरिएका शुल्क रसिदहरूको विवरण' : 'Fee Receipt Log'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {isNe ? `जम्मा ${toNepaliNumber(filteredPayments.length)} वटा रसिद` : `${filteredPayments.length} receipts found`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">रसिद नं.</th>
                  <th className="py-3 px-4">विद्यार्थीको नाम</th>
                  <th className="py-3 px-4">कक्षा</th>
                  <th className="py-3 px-4">मिति वि.सं.</th>
                  <th className="py-3 px-4">बिल महिना</th>
                  <th className="py-3 px-4 text-right">कुल रकम</th>
                  <th className="py-3 px-4 text-right">छुट</th>
                  <th className="py-3 px-4 text-right">भुक्तानी रकम</th>
                  <th className="py-3 px-4">विधि</th>
                  <th className="py-3 px-4 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors text-slate-800">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{p.receiptNo}</td>
                    <td className="py-3 px-4 font-medium">{p.studentName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                        {p.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.paymentDateBS}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.monthBilled}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatNepaliCurrency(p.subTotal, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600">
                      {p.discount > 0 ? `-${formatNepaliCurrency(p.discount, { inNepaliDigits: isNe })}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatNepaliCurrency(p.amountPaid, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors"
                        title="रसिद हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>रसिद</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Students & Outstanding Dues Table */}
      {subTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              {isNe ? 'विद्यार्थी नामावली तथा मासिक शुल्क / बाँकी बक्यौता' : 'Students Fee & Dues Directory'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {isNe ? `जम्मा ${toNepaliNumber(filteredStudents.length)} जना` : `${filteredStudents.length} students`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase">
                  <th className="py-3 px-4">रोल नं.</th>
                  <th className="py-3 px-4">विद्यार्थीको नाम</th>
                  <th className="py-3 px-4">कक्षा र सेक्सन</th>
                  <th className="py-3 px-4">अभिभावक / सम्पर्क</th>
                  <th className="py-3 px-4 text-right">मासिक शुल्क</th>
                  <th className="py-3 px-4">बस सुविधा</th>
                  <th className="py-3 px-4 text-right">छात्रवृत्ति %</th>
                  <th className="py-3 px-4 text-right">हालसम्म भुक्तानी</th>
                  <th className="py-3 px-4 text-right">बाँकी बक्यौता</th>
                  <th className="py-3 px-4 text-center">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors text-slate-800">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">
                      {toNepaliNumber(s.rollNo)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.nameNepali}</div>
                      <div className="text-[11px] text-slate-500">{s.nameEnglish}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                        {s.grade} ({s.section})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{s.guardianName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{s.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatNepaliCurrency(s.monthlyFee, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4">
                      {s.busFacility ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Bus className="w-3 h-3" />
                          <span>रु. {toNepaliNumber(s.busFee)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">छैन</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.scholarshipPercent > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          <Award className="w-3 h-3" />
                          <span>{toNepaliNumber(s.scholarshipPercent)}% छुट</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatNepaliCurrency(s.totalPaid, { inNepaliDigits: isNe })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {s.totalDues > 0 ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          {formatNepaliCurrency(s.totalDues, { inNepaliDigits: isNe })}
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>चुक्ता</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setIsNewPaymentOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-[11px] transition-colors"
                      >
                        {isNe ? 'रसिद काट्नुहोस्' : 'Collect'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Collect Fee / New Receipt Modal */}
      {isNewPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="px-6 py-4 bg-blue-700 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {isNe ? 'नयाँ शुल्क संकलन तथा रसिद जारी फाराम' : 'Collect Student Fee & Issue Receipt'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewPaymentOpen(false)}
                className="text-blue-100 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विद्यार्थी छनोट गर्नुहोस् (Select Student)*
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="">-- विद्यार्थी छान्नुहोस् --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameNepali} ({s.grade} - रोल नं {s.rollNo}) [मासिक: रु. {s.monthlyFee}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span>विद्यार्थी: <strong className="font-bold text-slate-900">{selectedStudent.nameNepali}</strong></span>
                    <span>कक्षा: <strong className="font-bold">{selectedStudent.grade} ({selectedStudent.section})</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>अभिभावक: {selectedStudent.guardianName} ({selectedStudent.phone})</span>
                    <span>छात्रवृत्ति: {selectedStudent.scholarshipPercent}%</span>
                  </div>
                  {selectedStudent.totalDues > 0 && (
                    <div className="text-rose-700 font-bold pt-1 border-t border-blue-200">
                      अघिल्लो बाँकी बक्यौता: {formatNepaliCurrency(selectedStudent.totalDues, { inNepaliDigits: isNe })}
                    </div>
                  )}
                </div>
              )}

              {/* Fee Categories Checkboxes */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 block mb-1">शुल्क शीर्षकहरू (Fee Heads):</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMonthlyFee}
                      onChange={(e) => setIncludeMonthlyFee(e.target.checked)}
                      className="rounded-sm text-blue-600"
                    />
                    <span>मासिक शुल्क ({monthlyAmount > 0 ? `रु. ${monthlyAmount}` : 'रकम'})</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBusFee}
                      disabled={!selectedStudent?.busFacility}
                      onChange={(e) => setIncludeBusFee(e.target.checked)}
                      className="rounded-sm text-blue-600 disabled:opacity-50"
                    />
                    <span>बस शुल्क {selectedStudent?.busFacility ? `(रु. ${selectedStudent.busFee})` : '(सुविधा छैन)'}</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeExamFee}
                      onChange={(e) => setIncludeExamFee(e.target.checked)}
                      className="rounded-sm text-blue-600"
                    />
                    <span>त्रैमासिक परीक्षा शुल्क (रु. ८००)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLabFee}
                      onChange={(e) => setIncludeLabFee(e.target.checked)}
                      className="rounded-sm text-blue-600"
                    />
                    <span>कम्प्युटर / ल्याब शुल्क (रु. ६००)</span>
                  </label>
                </div>
              </div>

              {/* Billing Month & Misc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">बिल महिना (Month Billed)</label>
                  <input
                    type="text"
                    value={monthBilled}
                    onChange={(e) => setMonthBilled(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">विविध शुल्क रु. (Misc Fee)</label>
                  <input
                    type="number"
                    min="0"
                    value={miscFee || ''}
                    onChange={(e) => setMiscFee(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Discounts and Fine */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    छुट / छात्रवृत्ति रकम रु. (Discount)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    placeholder={autoDiscount > 0 ? `स्वतः रु. ${autoDiscount}` : '0'}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    विलम्ब शुल्क / जरिवाना रु. (Fine)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fineAmount || ''}
                    onChange={(e) => setFineAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Amount to Pay & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">
                    भुक्तानी भएको रकम रु. (Amount Paid)*
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    placeholder={`जम्मा: रु. ${netDue}`}
                    className="w-full p-2 bg-white border-2 border-blue-600 rounded-lg text-xs font-bold text-blue-900"
                  />
                  <span className="text-[10px] text-slate-500">कुल देय रकम: रु. {netDue}</span>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    भुक्तानी विधि (Payment Method)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="नगद (Cash)">नगद (Cash)</option>
                    <option value="eSewa">eSewa</option>
                    <option value="Khalti">Khalti</option>
                    <option value="बैंक / चेक (Bank)">बैंक / चेक (Bank)</option>
                    <option value="ConnectIPS">ConnectIPS</option>
                  </select>
                </div>
              </div>

              {/* Remarks and Received By */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">कैफियत (Remarks)</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="नियमित शुल्क भुक्तानी"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">रसिद काट्ने कर्मचारी</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudent}
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  रसिद जारी गर्नुहोस् र प्रिन्ट गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">
                  {isNe ? 'नयाँ विद्यार्थी भर्ना तथा अभिलेख' : 'Register New Student'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">विद्यार्थीको नाम (नेपालीमा)*</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. सन्दीप लामिछाने"
                    value={newStudent.nameNepali}
                    onChange={(e) => setNewStudent({ ...newStudent, nameNepali: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Name in English</label>
                  <input
                    type="text"
                    placeholder="e.g. Sandeep Lamichhane"
                    value={newStudent.nameEnglish}
                    onChange={(e) => setNewStudent({ ...newStudent, nameEnglish: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">कक्षा (Grade)*</label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="कक्षा १० (Grade 10)">कक्षा १० (Grade 10)</option>
                    <option value="कक्षा ९ (Grade 9)">कक्षा ९ (Grade 9)</option>
                    <option value="कक्षा ८ (Grade 8)">कक्षा ८ (Grade 8)</option>
                    <option value="कक्षा ७ (Grade 7)">कक्षा ७ (Grade 7)</option>
                    <option value="कक्षा ६ (Grade 6)">कक्षा ६ (Grade 6)</option>
                    <option value="कक्षा ५ (Grade 5)">कक्षा ५ (Grade 5)</option>
                    <option value="कक्षा ११ (विज्ञान)">कक्षा ११ (विज्ञान)</option>
                    <option value="कक्षा १२ (विज्ञान)">कक्षा १२ (विज्ञान)</option>
                    <option value="कक्षा ११ (व्यवस्थापन)">कक्षा ११ (व्यवस्थापन)</option>
                    <option value="कक्षा १२ (व्यवस्थापन)">कक्षा १२ (व्यवस्थापन)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">सेक्सन (Section)</label>
                  <input
                    type="text"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">रोल नं. (Roll No)*</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">अभिभावकको नाम*</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. केशव लामिछाने"
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">सम्पर्क फोन नं.*</label>
                  <input
                    type="text"
                    required
                    placeholder="९८४१००००००"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">मासिक शुल्क रु.*</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newStudent.monthlyFee}
                    onChange={(e) => setNewStudent({ ...newStudent, monthlyFee: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">छात्रवृत्ति %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.scholarshipPercent}
                    onChange={(e) => setNewStudent({ ...newStudent, scholarshipPercent: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">बस सुविधा</label>
                  <select
                    value={newStudent.busFacility ? 'yes' : 'no'}
                    onChange={(e) => setNewStudent({ ...newStudent, busFacility: e.target.value === 'yes' })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="no">सुविधा छैन</option>
                    <option value="yes">बस सुविधा लिने</option>
                  </select>
                </div>
              </div>

              {newStudent.busFacility && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">बस शुल्क रु.</label>
                  <input
                    type="number"
                    min="0"
                    value={newStudent.busFee}
                    onChange={(e) => setNewStudent({ ...newStudent, busFee: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  विद्यार्थी दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
