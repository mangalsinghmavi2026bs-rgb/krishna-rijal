import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CloudUpload,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Table,
  Check,
  AlertCircle,
  Sparkles,
  Lock
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
  createAndSyncGoogleSheet,
  exportSchoolAccountingToCSV
} from '../services/googleSheetsService';
import { formatNepaliCurrency, toNepaliNumber } from '../utils/nepaliUtils';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface GoogleSheetsSyncViewProps {
  students: Student[];
  feePayments: FeePayment[];
  payrollRecords: PayrollRecord[];
  departments: Department[];
  expenses: BudgetExpense[];
  schoolProfile: SchoolProfile;
  language: Language;
}

export const GoogleSheetsSyncView: React.FC<GoogleSheetsSyncViewProps> = ({
  students,
  feePayments,
  payrollRecords,
  departments,
  expenses,
  schoolProfile,
  language,
}) => {
  const isNe = language === 'ne';

  const [activeSheetTab, setActiveSheetTab] = useState<'fees' | 'payroll' | 'departments' | 'summary'>('fees');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncedSheetUrl, setSyncedSheetUrl] = useState<string | null>(null);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  // Initialize Firebase Auth for Google Sheets Scope if config exists
  const handleGoogleSheetsSync = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    setSyncSuccess(null);

    try {
      // Check if firebase config exists in window/fetch
      const configRes = await fetch('/firebase-applet-config.json');
      if (!configRes.ok) {
        throw new Error('Firebase configuration file not loaded.');
      }
      const firebaseConfig = await configRes.json();

      let app;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/drive.file');

      // Sign in with Google Popup to obtain OAuth token
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error('Google OAuth Access Token प्राप्त भएन। कृपया पप-अप अनुमति दिनुहोस्।');
      }

      const syncResult = await createAndSyncGoogleSheet(token, {
        students,
        feePayments,
        payrollRecords,
        departments,
        expenses,
        fiscalYear: schoolProfile.fiscalYearBS,
      });

      setSyncedSheetUrl(syncResult.spreadsheetUrl);
      setSyncSuccess(isNe ? 'गुगल शिट्समा प्रतिवेदन सफलतापूर्वक सिंक भयो!' : 'Google Sheet successfully synced!');
    } catch (err: any) {
      console.error('Google Sheets Sync Error:', err);
      setErrorMessage(
        err.message || (isNe ? 'गुगल शिट्स सिंक गर्दा त्रुटि देखा पर्‍यो।' : 'Failed to sync with Google Sheets.')
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadCSV = () => {
    setIsDownloadingCSV(true);
    try {
      exportSchoolAccountingToCSV(students, feePayments, payrollRecords, departments, expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsDownloadingCSV(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-[11px] font-bold uppercase tracking-wider text-emerald-100 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isNe ? 'स्वचालित प्रतिवेदन तथा सिङ्क्रोनाइजेसन' : 'Automated Cloud Sync'}</span>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold">
            {isNe ? 'गुगल शिट्स तथा स्प्रेडसिट रिपोर्टिङ' : 'Google Sheets & Automated Reports'}
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
            {isNe
              ? 'लेखाका सम्पूर्ण तथ्यांकहरू (शुल्क संकलन, तलब भुक्तानी, विभागीय खर्च) एक क्लिकमा स्वचालित गुगल स्प्रेडसिटमा निर्यात वा एक्सेल/सीएसभीमा डाउनलोड गर्नुहोस्।'
              : 'Export comprehensive accounting ledgers including student fees, staff payroll, and department budgets directly to live Google Sheets or offline CSV.'}
          </p>
        </div>

        <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
          <button
            onClick={handleGoogleSheetsSync}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                <span>{isNe ? 'सिंक हुँदैछ...' : 'Syncing Sheets...'}</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 text-emerald-700" />
                <span>{isNe ? 'गुगल शिट्समा सिंक गर्नुहोस्' : 'Sync to Google Sheets'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={isDownloadingCSV}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold border border-emerald-500/50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isNe ? 'एक्सेल/सीएसभी डाउनलोड' : 'Download CSV/Excel'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {syncSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncSuccess}</span>
          </div>
          {syncedSheetUrl && (
            <a
              href={syncedSheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-colors text-xs"
            >
              <span>{isNe ? 'नयाँ गुगल शिट खोल्नुहोस्' : 'Open Google Sheet'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-2 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{isNe ? 'सिंक सूचना:' : 'Notice:'}</p>
            <p className="text-amber-800 leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-[11px] text-amber-700">
              💡 तपाईंले तुरून्त माथिको <strong>"एक्सेल/सीएसभी डाउनलोड"</strong> बटन प्रयोग गरी सबै डाटा सुरक्षित गर्न सक्नुहुन्छ।
            </p>
          </div>
        </div>
      )}

      {/* Live Spreadsheet Tabs Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Sheet Tabs Bar (like Google Sheets) */}
        <div className="bg-slate-100 px-4 pt-3 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSheetTab('fees')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center space-x-2 border-t border-x transition-colors ${
              activeSheetTab === 'fees'
                ? 'bg-white border-slate-300 text-emerald-800 shadow-xs -mb-[1px] pb-2.5 z-10'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            <span>१. शुल्क संकलन (Fee Register)</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('payroll')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center space-x-2 border-t border-x transition-colors ${
              activeSheetTab === 'payroll'
                ? 'bg-white border-slate-300 text-emerald-800 shadow-xs -mb-[1px] pb-2.5 z-10'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-blue-600" />
            <span>२. तलब भुक्तानी (Payroll Register)</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('departments')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center space-x-2 border-t border-x transition-colors ${
              activeSheetTab === 'departments'
                ? 'bg-white border-slate-300 text-emerald-800 shadow-xs -mb-[1px] pb-2.5 z-10'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-amber-600" />
            <span>३. विभागीय बजेट र खर्च</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('summary')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center space-x-2 border-t border-x transition-colors ${
              activeSheetTab === 'summary'
                ? 'bg-white border-slate-300 text-emerald-800 shadow-xs -mb-[1px] pb-2.5 z-10'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-indigo-600" />
            <span>४. वित्तीय सारांश प्रतिवेदन</span>
          </button>
        </div>

        {/* Sheet Grid Content */}
        <div className="p-4">
          {/* TAB 1: FEES */}
          {activeSheetTab === 'fees' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                    <th className="py-2.5 px-3 border border-slate-200">रसिद नं.</th>
                    <th className="py-2.5 px-3 border border-slate-200">रोल नं.</th>
                    <th className="py-2.5 px-3 border border-slate-200">विद्यार्थीको नाम</th>
                    <th className="py-2.5 px-3 border border-slate-200">कक्षा</th>
                    <th className="py-2.5 px-3 border border-slate-200">शुल्क महिना</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">रकम रु.</th>
                    <th className="py-2.5 px-3 border border-slate-200">भुक्तानी विधि</th>
                    <th className="py-2.5 px-3 border border-slate-200">मिति वि.सं.</th>
                  </tr>
                </thead>
                <tbody>
                  {feePayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-blue-700">
                        {p.receiptNo}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-mono">{p.studentRoll}</td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">{p.studentName}</td>
                      <td className="py-2 px-3 border border-slate-200">{p.grade}</td>
                      <td className="py-2 px-3 border border-slate-200">{p.monthBS}</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-bold text-emerald-700">
                        {formatNepaliCurrency(p.amountPaid, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200">{p.paymentMethod}</td>
                      <td className="py-2 px-3 border border-slate-200 text-slate-500">{p.paymentDateBS}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: PAYROLL */}
          {activeSheetTab === 'payroll' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-blue-50 text-blue-950 font-bold border-b border-blue-200">
                    <th className="py-2.5 px-3 border border-slate-200">भौचर नं.</th>
                    <th className="py-2.5 px-3 border border-slate-200">कर्मचारीको नाम</th>
                    <th className="py-2.5 px-3 border border-slate-200">पद</th>
                    <th className="py-2.5 px-3 border border-slate-200">महिना</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">मूल तलब</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">भत्ता</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">कुल पारिश्रमिक</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">PF (१०%)</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">CIT</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">TDS कर</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right font-bold">खुद भुक्तानी</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-blue-700">
                        {r.voucherNo}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 font-medium">{r.employeeName}</td>
                      <td className="py-2 px-3 border border-slate-200">{r.designation}</td>
                      <td className="py-2 px-3 border border-slate-200">{r.monthBS}</td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-medium">
                        {formatNepaliCurrency(r.basicSalary, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-right text-slate-600">
                        {formatNepaliCurrency(r.allowance, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-semibold">
                        {formatNepaliCurrency(r.grossSalary, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-right text-indigo-700">
                        {formatNepaliCurrency(r.pfEmployee, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-right text-indigo-700">
                        {formatNepaliCurrency(r.citDeduction, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-right text-rose-700">
                        {formatNepaliCurrency(r.tdsDeduction, { inNepaliDigits: isNe })}
                      </td>
                      <td className="py-2 px-3 border border-slate-200 text-right font-bold text-emerald-800 bg-emerald-50/50">
                        {formatNepaliCurrency(r.netPayable, { inNepaliDigits: isNe })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: DEPARTMENTS */}
          {activeSheetTab === 'departments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-amber-50 text-amber-950 font-bold border-b border-amber-200">
                    <th className="py-2.5 px-3 border border-slate-200">कोड</th>
                    <th className="py-2.5 px-3 border border-slate-200">विभागको नाम</th>
                    <th className="py-2.5 px-3 border border-slate-200">विभागीय प्रमुख</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">वार्षिक विनियोजित बजेट</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">हालसम्मको कुल खर्च</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-right">बाँकी मौज्दात</th>
                    <th className="py-2.5 px-3 border border-slate-200 text-center">उपयोग %</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => {
                    const spent = expenses
                      .filter((e) => e.departmentId === d.id)
                      .reduce((s, e) => s + e.amount, 0);
                    const bal = d.allocatedBudget - spent;
                    const pct = d.allocatedBudget > 0 ? Math.round((spent / d.allocatedBudget) * 100) : 0;

                    return (
                      <tr key={d.id} className="hover:bg-slate-50 text-slate-800">
                        <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-slate-600">
                          {d.code}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 font-medium">{d.nameNepali}</td>
                        <td className="py-2 px-3 border border-slate-200">{d.headOfDepartment}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-semibold">
                          {formatNepaliCurrency(d.allocatedBudget, { inNepaliDigits: isNe })}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-medium text-amber-700">
                          {formatNepaliCurrency(spent, { inNepaliDigits: isNe })}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-bold text-emerald-700">
                          {formatNepaliCurrency(bal, { inNepaliDigits: isNe })}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-bold">
                          {toNepaliNumber(pct)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: SUMMARY */}
          {activeSheetTab === 'summary' && (
            <div className="max-w-2xl mx-auto p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                गुगल शिट्स सारांश विवरण (Accounting Summary Matrix)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">जम्मा विद्यार्थी संख्या:</span>
                  <span className="font-bold text-base text-slate-900">{toNepaliNumber(students.length)} जना</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">कुल संकलित शुल्क:</span>
                  <span className="font-bold text-base text-emerald-700">
                    {formatNepaliCurrency(feePayments.reduce((s, p) => s + p.amountPaid, 0), { inNepaliDigits: isNe })}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">कुल तलब भुक्तानी:</span>
                  <span className="font-bold text-base text-blue-700">
                    {formatNepaliCurrency(payrollRecords.reduce((s, p) => s + p.netPayable, 0), { inNepaliDigits: isNe })}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">विभागीय सञ्चालन खर्च:</span>
                  <span className="font-bold text-base text-rose-700">
                    {formatNepaliCurrency(expenses.reduce((s, e) => s + e.amount, 0), { inNepaliDigits: isNe })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
