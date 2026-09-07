import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, FeePayment, PayrollRecord, Department, BudgetExpense } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Cached token cleared on page reload; user can trigger popup to re-obtain token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google OAuth Access Token प्राप्त हुन सकेन (Failed to get access token)');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export interface SyncDataPayload {
  students: Student[];
  feePayments: FeePayment[];
  payrollRecords: PayrollRecord[];
  departments: Department[];
  expenses: BudgetExpense[];
  fiscalYear: string;
}

/**
 * Creates a complete Google Spreadsheet with 4 detailed tabs and exports live data.
 */
export async function createAndSyncGoogleSheet(
  token: string,
  payload: SyncDataPayload
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `विद्यालय लेखा प्रणाली प्रतिवेदन - आ.व. ${payload.fiscalYear} (${new Date().toLocaleDateString('ne-NP')})`;

  // 1. Create spreadsheet structure
  const createResp = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'शुल्क संकलन (Student Fees)', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'कर्मचारी तलब (Staff Payroll)', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'विभागीय बजेट (Dept Budgets)', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'वित्तीय सारांश (Financial Summary)', gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  if (!createResp.ok) {
    const errText = await createResp.text();
    throw new Error(`गुगल शिट्स निर्माणमा समस्या: ${createResp.status} - ${errText}`);
  }

  const sheetData = await createResp.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Tab 1: Student Fees
  const feesHeader = [
    'रसिद नं. (Receipt No)',
    'विद्यार्थीको नाम (Student Name)',
    'कक्षा (Grade)',
    'मिति वि.सं. (Date BS)',
    'बिल महिना (Month)',
    'जम्मा रकम (Gross Amt)',
    'छुट (Discount)',
    'जरिवाना (Fine)',
    'भुक्तानी रकम (Paid Amt)',
    'बाँकी बक्यौता (Due)',
    'भुक्तानी विधि (Method)',
    'रसिद काट्ने (Received By)',
  ];
  const feesRows = payload.feePayments.map((f) => [
    f.receiptNo,
    f.studentName,
    f.grade,
    f.paymentDateBS,
    f.monthBilled,
    f.subTotal,
    f.discount,
    f.fine,
    f.amountPaid,
    f.remainingDue,
    f.paymentMethod,
    f.receivedBy,
  ]);

  // 3. Prepare Tab 2: Staff Payroll
  const payrollHeader = [
    'भौचर नं. (Voucher No)',
    'कर्मचारीको नाम (Staff Name)',
    'पद (Designation)',
    'महिना (Month BS)',
    'मूल तलब (Basic)',
    'भत्ता (Allowance)',
    'कुल तलब (Gross)',
    'सञ्चय कोष (PF 10%)',
    'नागरिक लगानी (CIT)',
    'आयकर टीडीएस (TDS)',
    'पेस्की कट्टी (Advance)',
    'जम्मा कट्टी (Total Deductions)',
    'खुद भुक्तानी (Net Salary)',
    'अवस्था (Status)',
    'भुक्तानी विधि (Method)',
  ];
  const payrollRows = payload.payrollRecords.map((p) => [
    p.voucherNo,
    p.employeeName,
    p.designation,
    p.monthBS,
    p.basicSalary,
    p.allowance,
    p.grossSalary,
    p.pfEmployee,
    p.citDeduction,
    p.tdsDeduction,
    p.advanceDeduction,
    p.totalDeductions,
    p.netPayable,
    p.status,
    p.paymentMethod,
  ]);

  // 4. Prepare Tab 3: Department Budgets
  const budgetHeader = [
    'विभाग कोड (Dept Code)',
    'विभागको नाम (Department Name)',
    'विभागीय प्रमुख (HOD)',
    'विनियोजित बजेट (Allocated Budget)',
    'हालसम्मको खर्च (Total Spent)',
    'बाँकी बजेट (Remaining Balance)',
    'खर्च प्रतिशत (Spent %)',
  ];
  const budgetRows = payload.departments.map((d) => {
    const spent = payload.expenses
      .filter((e) => e.departmentId === d.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = d.allocatedBudget - spent;
    const spentPercent = d.allocatedBudget > 0 ? ((spent / d.allocatedBudget) * 100).toFixed(1) + '%' : '0%';
    return [
      d.code,
      d.nameNepali,
      d.headOfDepartment,
      d.allocatedBudget,
      spent,
      balance,
      spentPercent,
    ];
  });

  // 5. Prepare Tab 4: Financial Summary
  const totalFeeCollected = payload.feePayments.reduce((s, p) => s + p.amountPaid, 0);
  const totalPayrollDisbursed = payload.payrollRecords
    .filter((p) => p.status === 'भुक्तानी भयो (Paid)')
    .reduce((s, p) => s + p.netPayable, 0);
  const totalExpenses = payload.expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenditure = totalPayrollDisbursed + totalExpenses;
  const netSurplus = totalFeeCollected - totalExpenditure;

  const summaryHeader = ['शीर्षक (Item)', 'रकम रु. (Amount NPR)', 'कैफियत (Remarks)'];
  const summaryRows = [
    ['कुल विद्यार्थी शुल्क संकलन (Total Fee Collected)', totalFeeCollected, 'चालु आर्थिक वर्षको संकलन'],
    ['कर्मचारी तलब भुक्तानी (Total Staff Payroll)', totalPayrollDisbursed, 'शिक्षक तथा कर्मचारी पारिश्रमिक'],
    ['विभागीय सञ्चालन खर्च (Departmental Expenses)', totalExpenses, 'सामग्री, ल्याब, मर्मत तथा कार्यक्रम खर्च'],
    ['कुल खर्च (Total Expenditure)', totalExpenditure, 'तलब + विभागीय खर्च'],
    ['खुद बचत / नाफा (Net Surplus / Balance)', netSurplus, netSurplus >= 0 ? 'सकारात्मक बचत' : 'घाटा स्थिति'],
    ['', '', ''],
    ['प्रतिवेदन तयार मिति', new Date().toLocaleString(), 'स्वचालित लेखा प्रणाली'],
  ];

  // Batch update values to Google Sheet
  const updateResp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'शुल्क संकलन (Student Fees)'!A1",
            values: [feesHeader, ...feesRows],
          },
          {
            range: "'कर्मचारी तलब (Staff Payroll)'!A1",
            values: [payrollHeader, ...payrollRows],
          },
          {
            range: "'विभागीय बजेट (Dept Budgets)'!A1",
            values: [budgetHeader, ...budgetRows],
          },
          {
            range: "'वित्तीय सारांश (Financial Summary)'!A1",
            values: [summaryHeader, ...summaryRows],
          },
        ],
      }),
    }
  );

  if (!updateResp.ok) {
    const err = await updateResp.text();
    throw new Error(`डाटा शिट्समा लेख्न असफल: ${updateResp.status} - ${err}`);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Downloads comprehensive multi-section CSV report for Excel / Sheets
 */
export function exportSchoolAccountingToCSV(
  students: Student[],
  feePayments: FeePayment[],
  payrollRecords: PayrollRecord[],
  departments: Department[],
  expenses: BudgetExpense[]
) {
  const lines: string[] = [];

  // Helper
  const escapeCSV = (val: any) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  // 1. Title & Header
  lines.push(escapeCSV('विद्यालय लेखा प्रणाली - स्वचालित प्रतिवेदन (School Accounting Report)'));
  lines.push(escapeCSV(`मिति: ${new Date().toLocaleDateString('ne-NP')} | आ.व. २०८१/०८२`));
  lines.push('');

  // 2. Fees Section
  lines.push(escapeCSV('=== १. विद्यार्थी शुल्क संकलन विवरण (Student Fee Collection) ==='));
  lines.push([
    'रसिद नं.',
    'विद्यार्थीको नाम',
    'कक्षा',
    'मिति वि.सं.',
    'बिल महिना',
    'जम्मा रकम',
    'छुट',
    'जरिवाना',
    'भुक्तानी रकम',
    'बाँकी बक्यौता',
    'विधि',
    'रसिद काट्ने'
  ].map(escapeCSV).join(','));

  feePayments.forEach((f) => {
    lines.push([
      f.receiptNo,
      f.studentName,
      f.grade,
      f.paymentDateBS,
      f.monthBilled,
      f.subTotal,
      f.discount,
      f.fine,
      f.amountPaid,
      f.remainingDue,
      f.paymentMethod,
      f.receivedBy
    ].map(escapeCSV).join(','));
  });

  lines.push('');

  // 3. Payroll Section
  lines.push(escapeCSV('=== २. शिक्षक तथा कर्मचारी पारिश्रमिक भुक्तानी (Staff Payroll) ==='));
  lines.push([
    'भौचर नं.',
    'कर्मचारीको नाम',
    'पद',
    'महिना',
    'मूल तलब',
    'भत्ता',
    'कुल तलब',
    'सञ्चय कोष (१०%)',
    'नागरिक लगानी (CIT)',
    'आयकर टीडीएस',
    'पेस्की कट्टी',
    'जम्मा कट्टी',
    'खुद भुक्तानी',
    'अवस्था',
    'भुक्तानी विधि'
  ].map(escapeCSV).join(','));

  payrollRecords.forEach((p) => {
    lines.push([
      p.voucherNo,
      p.employeeName,
      p.designation,
      p.monthBS,
      p.basicSalary,
      p.allowance,
      p.grossSalary,
      p.pfEmployee,
      p.citDeduction,
      p.tdsDeduction,
      p.advanceDeduction,
      p.totalDeductions,
      p.netPayable,
      p.status,
      p.paymentMethod
    ].map(escapeCSV).join(','));
  });

  lines.push('');

  // 4. Department Budgets Section
  lines.push(escapeCSV('=== ३. विभागीय बजेट तथा खर्च विवरण (Department Budgets & Expenses) ==='));
  lines.push([
    'विभाग कोड',
    'विभागको नाम',
    'विभागीय प्रमुख',
    'वार्षिक विनियोजित बजेट',
    'हालसम्मको खर्च',
    'बाँकी मौज्दात'
  ].map(escapeCSV).join(','));

  departments.forEach((d) => {
    const spent = expenses
      .filter((e) => e.departmentId === d.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = d.allocatedBudget - spent;
    lines.push([
      d.code,
      d.nameNepali,
      d.headOfDepartment,
      d.allocatedBudget,
      spent,
      balance
    ].map(escapeCSV).join(','));
  });

  // UTF-8 BOM so Excel opens Nepali Devanagari script properly without mojibake!
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `school_accounting_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
