import React from 'react';
import { Filter, RotateCcw, Search, MapPin, Users, HeartPulse, UserCircle } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  areas: string[];
  totalFiltered: number;
  totalAll: number;
  riskCounts?: {
    total: number;
    high: number;
    moderate: number;
    low: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  areas,
  totalFiltered,
  totalAll,
  riskCounts = { total: totalAll, high: 0, moderate: 0, low: 0 },
}) => {
  const isFiltered =
    filters.area !== 'all' ||
    filters.ageGroup !== 'all' ||
    filters.gender !== 'all' ||
    filters.riskLevel !== 'all' ||
    filters.searchQuery.trim() !== '';

  const isRiskActive = (key: 'all' | 'high' | 'moderate' | 'low') => {
    if (key === 'all') return filters.riskLevel === 'all';
    if (key === 'high') {
      return (
        filters.riskLevel === 'high' ||
        filters.riskLevel === 'เสี่ยงสูง' ||
        filters.riskLevel === 'เสี่ยงสูง/เกินเกณฑ์'
      );
    }
    if (key === 'moderate') {
      return filters.riskLevel === 'moderate' || filters.riskLevel === 'เสี่ยงปานกลาง';
    }
    if (key === 'low') {
      return filters.riskLevel === 'low' || filters.riskLevel === 'เสี่ยงต่ำ';
    }
    return false;
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-pink-100 shadow-sm shadow-pink-500/5 mb-6 space-y-4">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
            <Filter className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 text-sm md:text-base">
            ตัวกรองข้อมูลสุขภาพ (Filters)
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 font-medium border border-pink-100">
            พบ {totalFiltered} จาก {totalAll} คน
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Quick Filter Tabs by Risk Level (ปุ่มแท็บกรองด่วนตามระดับความเสี่ยง) */}
      <div className="p-3 rounded-xl bg-pink-50/40 border border-pink-100/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <HeartPulse className="w-4 h-4 text-pink-600" />
          <span>ปุ่มแท็บกรองด่วนตามระดับความเสี่ยง:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ทั้งหมด */}
          <button
            type="button"
            onClick={() => onFilterChange('riskLevel', 'all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isRiskActive('all')
                ? 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-800/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>ทั้งหมด</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                isRiskActive('all') ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {riskCounts.total}
            </span>
          </button>

          {/* 🔴 เสี่ยงสูง/เกินเกณฑ์ */}
          <button
            type="button"
            onClick={() => onFilterChange('riskLevel', 'high')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isRiskActive('high')
                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>🔴 เสี่ยงสูง/เกินเกณฑ์</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isRiskActive('high') ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-800'
              }`}
            >
              {riskCounts.high}
            </span>
          </button>

          {/* 🟡 เสี่ยงปานกลาง */}
          <button
            type="button"
            onClick={() => onFilterChange('riskLevel', 'moderate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isRiskActive('moderate')
                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/30'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>🟡 เสี่ยงปานกลาง</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isRiskActive('moderate') ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-950'
              }`}
            >
              {riskCounts.moderate}
            </span>
          </button>

          {/* 🟢 เสี่ยงต่ำ */}
          <button
            type="button"
            onClick={() => onFilterChange('riskLevel', 'low')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isRiskActive('low')
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>🟢 เสี่ยงต่ำ</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isRiskActive('low') ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-950'
              }`}
            >
              {riskCounts.low}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Search Query */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            ค้นหา (รหัส/คำสำคัญ)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารหัส H0001, พื้นที่..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-slate-400 text-slate-700"
            />
          </div>
        </div>

        {/* 2. Filter: พื้นที่ (Area) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-pink-500" />
            <span>พื้นที่ / ชุมชน</span>
          </label>
          <select
            value={filters.area}
            onChange={(e) => onFilterChange('area', e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-700 cursor-pointer"
          >
            <option value="all">ทุกพื้นที่ (ทั้งหมด)</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Filter: ช่วงอายุ (Age Group) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-pink-500" />
            <span>ช่วงอายุ</span>
          </label>
          <select
            value={filters.ageGroup}
            onChange={(e) => onFilterChange('ageGroup', e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-700 cursor-pointer"
          >
            <option value="all">ทุกช่วงอายุ (ทั้งหมด)</option>
            <option value="under35">น้อยกว่า 35 ปี</option>
            <option value="35-44">35 - 44 ปี</option>
            <option value="45-59">45 - 59 ปี</option>
            <option value="60plus">60 ปีขึ้นไป (ผู้สูงอายุ)</option>
          </select>
        </div>

        {/* 4. Filter: เพศ (Gender) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
            <UserCircle className="w-3 h-3 text-pink-500" />
            <span>เพศ</span>
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-700 cursor-pointer"
          >
            <option value="all">ทุกเพศ (ชายและหญิง)</option>
            <option value="ชาย">เพศชาย</option>
            <option value="หญิง">เพศหญิง</option>
          </select>
        </div>

        {/* 5. Filter: ระดับความเสี่ยง (Risk Level) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-pink-500" />
            <span>ระดับความเสี่ยง</span>
          </label>
          <select
            value={
              isRiskActive('high')
                ? 'high'
                : isRiskActive('moderate')
                ? 'moderate'
                : isRiskActive('low')
                ? 'low'
                : 'all'
            }
            onChange={(e) => onFilterChange('riskLevel', e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-700 cursor-pointer"
          >
            <option value="all">ทุกระดับความเสี่ยง ({riskCounts.total})</option>
            <option value="high">🔴 เสี่ยงสูง/เกินเกณฑ์ ({riskCounts.high})</option>
            <option value="moderate">🟡 เสี่ยงปานกลาง ({riskCounts.moderate})</option>
            <option value="low">🟢 เสี่ยงต่ำ ({riskCounts.low})</option>
          </select>
        </div>
      </div>
    </div>
  );
};
