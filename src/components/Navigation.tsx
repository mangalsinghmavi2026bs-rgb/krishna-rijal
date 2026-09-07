import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users,
  PieChart,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Language } from '../types';

export type ActiveTab = 'dashboard' | 'fees' | 'payroll' | 'budgets' | 'reports' | 'sheets';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  pendingDuesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  language,
  pendingDuesCount,
}) => {
  const isNe = language === 'ne';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: isNe ? 'ड्यासबोर्ड' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'fees' as ActiveTab,
      label: isNe ? 'विद्यार्थी शुल्क व्यवस्थापन' : 'Student Fees',
      icon: Receipt,
      badge: pendingDuesCount > 0 ? (isNe ? `${pendingDuesCount} बाँकी` : `${pendingDuesCount} Due`) : undefined,
    },
    {
      id: 'payroll' as ActiveTab,
      label: isNe ? 'कर्मचारी तलब / पेरोल' : 'Staff Payroll',
      icon: Users,
    },
    {
      id: 'budgets' as ActiveTab,
      label: isNe ? 'विभागीय बजेट तथा खर्च' : 'Department Budgets',
      icon: PieChart,
    },
    {
      id: 'reports' as ActiveTab,
      label: isNe ? 'स्वचालित वित्तीय प्रतिवेदन' : 'Financial Reports',
      icon: FileText,
    },
    {
      id: 'sheets' as ActiveTab,
      label: isNe ? 'गुगल शिट्स निर्यात' : 'Google Sheets Export',
      icon: FileSpreadsheet,
      highlight: true,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${item.highlight && !isActive ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
