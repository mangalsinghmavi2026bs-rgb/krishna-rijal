import React from 'react';
import { Printer, X, CheckCircle, GraduationCap } from 'lucide-react';
import { FeePayment, SchoolProfile, Language } from '../types';
import { formatNepaliCurrency, numberToNepaliWords, toNepaliNumber } from '../utils/nepaliUtils';

interface ReceiptModalProps {
  payment: FeePayment | null;
  schoolProfile: SchoolProfile;
  language: Language;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  schoolProfile,
  language,
  onClose,
}) => {
  if (!payment) return null;

  const isNe = language === 'ne';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold text-slate-800">
              {isNe ? 'आधिकारिक शुल्क रसिद' : 'Official Fee Receipt'}
            </span>
            <span className="text-xs text-slate-500 font-mono">({payment.receiptNo})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isNe ? 'प्रिन्ट गर्नुहोस्' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center relative">
            <div className="flex items-center justify-center space-x-3 mb-1">
              <GraduationCap className="w-8 h-8 text-blue-800" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {schoolProfile.nameNepali}
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {schoolProfile.nameEnglish}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {schoolProfile.addressNepali} | फोन: {schoolProfile.phone}
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs font-medium text-slate-600 mt-1">
              <span>स्थायी लेखा नं. (PAN): <strong className="font-bold text-slate-900">{schoolProfile.panNo}</strong></span>
              <span>दर्ता नं.: {schoolProfile.regNo}</span>
              <span>स्था.: {schoolProfile.establishedBS}</span>
            </div>
            <div className="mt-3 inline-block px-4 py-0.5 border border-slate-900 rounded-full font-bold text-xs bg-slate-100 uppercase tracking-wide">
              विद्यार्थी शुल्क रसिद (Fee Receipt)
            </div>
          </div>

          {/* Meta Information Bar */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">रसिद नं. (Receipt No):</p>
              <p className="font-bold text-slate-900 font-mono text-base">{payment.receiptNo}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-2">विद्यार्थीको नाम:</p>
              <p className="font-bold text-slate-900 text-base">{payment.studentName}</p>
              <p className="text-xs text-slate-600">कक्षा: <strong className="text-slate-900">{payment.grade}</strong></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">मिति (Date BS):</p>
              <p className="font-bold text-slate-900">{payment.paymentDateBS} ({payment.paymentDateAD})</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-2">बिल महिना:</p>
              <p className="font-bold text-slate-900">{payment.monthBilled}</p>
              <p className="text-xs text-slate-600">भुक्तानी विधि: <span className="font-semibold text-slate-800">{payment.paymentMethod}</span></p>
            </div>
          </div>

          {/* Fee Heads Table */}
          <div className="my-5">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-xs uppercase text-slate-700 font-bold bg-slate-50">
                  <th className="py-2 px-3 w-12 text-center">क्र.सं.</th>
                  <th className="py-2 px-3">शुल्क विवरण (Particulars)</th>
                  <th className="py-2 px-3 text-right">रकम रु. (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payment.items.map((item, idx) => (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-2 px-3 text-center text-slate-500 text-xs">{toNepaliNumber(idx + 1)}</td>
                    <td className="py-2 px-3 font-medium">{item.category}</td>
                    <td className="py-2 px-3 text-right font-medium">
                      {formatNepaliCurrency(item.amount, { inNepaliDigits: false, prefix: false })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Breakdown */}
          <div className="border-t border-slate-300 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>कुल रकम (Subtotal):</span>
              <span className="font-medium">
                {formatNepaliCurrency(payment.subTotal, { inNepaliDigits: false })}
              </span>
            </div>
            {payment.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>छात्रवृत्ति / छुट (Scholarship/Discount):</span>
                <span>-{formatNepaliCurrency(payment.discount, { inNepaliDigits: false })}</span>
              </div>
            )}
            {payment.fine > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>विलम्ब शुल्क / जरिवाना (Fine):</span>
                <span>+{formatNepaliCurrency(payment.fine, { inNepaliDigits: false })}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-800 pt-2">
              <span>प्राप्त जम्मा रकम (Total Paid Amount):</span>
              <span className="text-blue-800 text-lg">
                {formatNepaliCurrency(payment.amountPaid, { inNepaliDigits: true })}
              </span>
            </div>
            {payment.remainingDue > 0 && (
              <div className="flex justify-between text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-md">
                <span>बाँकी बक्यौता (Remaining Due):</span>
                <span>{formatNepaliCurrency(payment.remainingDue, { inNepaliDigits: true })}</span>
              </div>
            )}
          </div>

          {/* Amount In Words */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-bold text-slate-700">अक्षरेपी (In Words): </span>
            <span className="font-semibold text-slate-900 italic">
              {numberToNepaliWords(payment.amountPaid)}
            </span>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 flex justify-between items-end text-xs text-slate-700">
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1"></div>
              <p className="font-medium">विद्यार्थी / अभिभावक</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full mx-auto flex items-center justify-center text-[10px] text-slate-400 mb-1">
                छाप (Stamp)
              </div>
            </div>
            <div className="text-center">
              <div className="w-40 border-t border-slate-900 mb-1 font-semibold text-slate-900">
                {payment.receivedBy}
              </div>
              <p className="font-bold text-slate-900">लेखापाल / आधिकारिक हस्ताक्षर</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[11px] text-slate-400">
            * कम्प्युटरबाट स्वचालित जारी गरिएको आधिकारिक रसिद। भुक्तानी भएको रकम फिर्ता हुनेछैन।
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            {isNe ? 'बन्द गर्नुहोस्' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
