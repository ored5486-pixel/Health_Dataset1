import React from 'react';
import { Users, Droplets, HeartPulse, AlertCircle, ArrowUpRight, Gauge } from 'lucide-react';
import { KPIData } from '../types';

interface KPICardsProps {
  kpi: KPIData;
  totalUnfiltered: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpi, totalUnfiltered }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
      {/* KPI 1: จำนวน (Total Count) */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-100/50 to-rose-100/20 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            จำนวนผู้รับการคัดกรอง
          </span>
          <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpi.totalCount.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-slate-500">คน</span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>คิดเป็น {totalUnfiltered > 0 ? ((kpi.totalCount / totalUnfiltered) * 100).toFixed(0) : 100}% ของข้อมูลทั้งหมด</span>
          </p>
        </div>
      </div>

      {/* KPI 2: ค่าเฉลี่ย (Averages: Sugar & Risk Score) */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-100/50 to-pink-100/20 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            ค่าเฉลี่ยน้ำตาล & คะแนนเสี่ยง
          </span>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-1.5">
            <span className="text-xs text-slate-500">น้ำตาลเฉลี่ย:</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold ${kpi.avgBloodSugar >= 126 ? 'text-rose-600' : kpi.avgBloodSugar >= 100 ? 'text-amber-600' : 'text-slate-900'}`}>
                {kpi.avgBloodSugar.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">mg/dL</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xs text-slate-500">คะแนนเสี่ยงเฉลี่ย:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-800">
                {kpi.avgRiskScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">/ 15 คะแนน</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI 3: ค่าต่ำสุด/ค่าสูงสุด ช่วงความดันโลหิต SBP (Min - Max) */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-fuchsia-100/50 to-pink-100/20 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            ช่วงความดัน SBP (Min - Max)
          </span>
          <div className="p-2.5 rounded-xl bg-fuchsia-50 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {kpi.minSbp} - {kpi.maxSbp}
            </span>
            <span className="text-xs font-medium text-slate-500">mmHg</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>SBP เฉลี่ย:</span>
            <span className={`font-semibold ${kpi.avgSbp >= 140 ? 'text-rose-600' : kpi.avgSbp >= 120 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {kpi.avgSbp.toFixed(1)} mmHg
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: สัดส่วน/ร้อยละ (High Risk Percentage) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-rose-50/50 p-5 border border-rose-200/80 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wide uppercase text-rose-700">
            ร้อยละผู้มีความเสี่ยงสูง
          </span>
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-sm shadow-rose-500/30">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {kpi.highRiskPercentage.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-rose-800/80">
              ({kpi.highRiskCount} คน)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpi.highRiskPercentage)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>เสี่ยงปานกลาง: {kpi.moderateRiskCount} คน</span>
            <span>เสี่ยงต่ำ: {kpi.lowRiskCount} คน</span>
          </p>
        </div>
      </div>
    </div>
  );
};
