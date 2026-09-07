import React from 'react';
import {
  GraduationCap,
  Calendar,
  Languages,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SchoolProfile, Language } from '../types';

interface HeaderProps {
  schoolProfile: SchoolProfile;
  language: Language;
  onToggleLanguage: () => void;
  onOpenNewReceipt: () => void;
  onNavigateToSheets: () => void;
  hasGoogleAuth: boolean;
  userEmail?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  schoolProfile,
  language,
  onToggleLanguage,
  onOpenNewReceipt,
  onNavigateToSheets,
  hasGoogleAuth,
  userEmail,
}) => {
  const isNe = language === 'ne';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & School Details */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  {isNe ? schoolProfile.nameNepali : schoolProfile.nameEnglish}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {isNe ? 'लेखा प्रणाली' : 'Accounting'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                <span>{isNe ? schoolProfile.addressNepali : schoolProfile.addressEnglish}</span>
                <span className="text-slate-300">•</span>
                <span>PAN: {schoolProfile.panNo}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">
                  {isNe ? `आ.व. ${schoolProfile.fiscalYearBS}` : `F.Y. ${schoolProfile.fiscalYearBS}`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools & Status */}
          <div className="flex items-center space-x-3">
            {/* Nepali Date Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{isNe ? 'वि.सं. २०८१ भाद्र २२' : '2081 Bhadra 22 BS'}</span>
            </div>

            {/* Google Sheets Status Badge */}
            <button
              onClick={onNavigateToSheets}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hasGoogleAuth
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title={hasGoogleAuth ? `Google Sheets Connected: ${userEmail}` : 'Connect Google Sheets'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isNe ? 'गुगल शिट्स' : 'Google Sheets'}</span>
              {hasGoogleAuth ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title="Change Language / भाषा परिवर्तन"
            >
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span>{isNe ? 'English' : 'नेपाली'}</span>
            </button>

            {/* Quick Fee Collection Button */}
            <button
              id="header-quick-receipt-btn"
              onClick={onOpenNewReceipt}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isNe ? 'नयाँ रसिद काट्नुहोस्' : 'Collect Fee'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
