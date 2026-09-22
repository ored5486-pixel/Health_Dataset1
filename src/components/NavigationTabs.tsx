import React from 'react';
import { ShieldCheck, Activity, Table, Sparkles } from 'lucide-react';

export type ActiveTab = 'tab1_risk_area' | 'tab2_behavior_trends' | 'tab3_data_table';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  tabCounts: {
    totalRecords: number;
    highRiskCount: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  tabCounts,
}) => {
  const tabs: Array<{
    id: ActiveTab;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'tab1_risk_area',
      label: 'ภาพรวมความเสี่ยงและพื้นที่',
      subtitle: 'Tab 1: Risk Overview & Area',
      icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />,
      badge: `${tabCounts.highRiskCount} เสี่ยงสูง`,
    },
    {
      id: 'tab2_behavior_trends',
      label: 'พฤติกรรมและแนวโน้มสุขภาพ',
      subtitle: 'Tab 2: Behaviors & Trends',
      icon: <Activity className="w-4 h-4 md:w-5 md:h-5" />,
    },
    {
      id: 'tab3_data_table',
      label: 'ตารางข้อมูลเชิงลึกรายบุคคล',
      subtitle: 'Tab 3: Detail View & Table',
      icon: <Table className="w-4 h-4 md:w-5 md:h-5" />,
      badge: `${tabCounts.totalRecords} คน`,
    },
  ];

  return (
    <nav className="mb-6" aria-label="Dashboard Navigation">
      <div className="bg-white/80 backdrop-blur-md p-1.5 md:p-2 rounded-2xl border border-pink-100 shadow-sm flex flex-col sm:flex-row gap-1.5 md:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-between sm:justify-start gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/20'
                  : 'hover:bg-pink-50/70 text-slate-600 hover:text-pink-600'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-pink-50 text-pink-600 group-hover:bg-pink-100'
                  }`}
                >
                  {tab.icon}
                </div>
                <div className="min-w-0">
                  <span className={`block font-bold text-xs md:text-sm truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {tab.label}
                  </span>
                  <span className={`block text-[11px] truncate ${isActive ? 'text-pink-100' : 'text-slate-400'}`}>
                    {tab.subtitle}
                  </span>
                </div>
              </div>

              {tab.badge && (
                <span
                  className={`ml-auto text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-pink-50 text-pink-700 border border-pink-100'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
