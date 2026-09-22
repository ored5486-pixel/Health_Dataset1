import React, { useState, useMemo } from 'react';
import { HealthRecord } from '../types';
import { PatientDetailModal } from './PatientDetailModal';
import {
  Search,
  ArrowUpDown,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';

interface TabDataTableProps {
  records: HealthRecord[];
}

type SortKey = 'id' | 'area' | 'gender' | 'age' | 'bmi' | 'sbp' | 'bloodSugar' | 'exercise' | 'riskScore' | 'riskLevel';

export const TabDataTable: React.FC<TabDataTableProps> = ({ records }) => {
  const [search, setSearch] = useState('');
  const [riskTab, setRiskTab] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  // Group counts for quick filter pills
  const riskCounts = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let low = 0;
    records.forEach((r) => {
      const norm = (r.riskLevel || '').trim();
      const isHigh = norm === 'เสี่ยงสูง' || norm === 'สูง' || r.bloodSugar >= 126 || r.sbp >= 140 || r.dbp >= 90;
      const isMod = !isHigh && (norm === 'เสี่ยงปานกลาง' || norm === 'ปานกลาง' || r.bloodSugar >= 100 || r.sbp >= 120 || r.dbp >= 80);
      if (isHigh) high++;
      else if (isMod) moderate++;
      else low++;
    });
    return { high, moderate, low, total: records.length };
  }, [records]);

  // Filter with local search & riskTab
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (riskTab !== 'all') {
      result = result.filter((r) => {
        const norm = (r.riskLevel || '').trim();
        const isHigh = norm === 'เสี่ยงสูง' || norm === 'สูง' || r.bloodSugar >= 126 || r.sbp >= 140 || r.dbp >= 90;
        const isMod = !isHigh && (norm === 'เสี่ยงปานกลาง' || norm === 'ปานกลาง' || r.bloodSugar >= 100 || r.sbp >= 120 || r.dbp >= 80);
        if (riskTab === 'high') return isHigh;
        if (riskTab === 'moderate') return isMod;
        if (riskTab === 'low') return !isHigh && !isMod;
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q) ||
          r.gender.toLowerCase().includes(q) ||
          r.riskLevel.toLowerCase().includes(q) ||
          r.exercise.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, 'th');
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, riskTab, search, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Export filtered CSV
  const handleExportCSV = () => {
    const headers = [
      'รหัสบุคคล',
      'พื้นที่',
      'เพศ',
      'อายุ',
      'ส่วนสูง(cm)',
      'น้ำหนัก(kg)',
      'BMI',
      'SBP(mmHg)',
      'DBP(mmHg)',
      'น้ำตาล(mg/dL)',
      'ชีพจร(bpm)',
      'วันที่ตรวจ',
      'การออกกำลังกาย',
      'การสูบบุหรี่',
      'การดื่มแอลกอฮอล์',
      'คัดกรองเบาหวาน',
      'คัดกรองความดัน',
      'คะแนนความเสี่ยง',
      'ระดับความเสี่ยง',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      r.area,
      r.gender,
      r.age,
      r.heightCm,
      r.weightKg,
      r.bmi,
      r.sbp,
      r.dbp,
      r.bloodSugar,
      r.pulseBpm,
      r.screenDate,
      r.exercise,
      r.smoking,
      r.alcohol,
      r.diabetesScreening,
      r.htScreening,
      r.riskScore,
      r.riskLevel,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานคัดกรองสุขภาพ_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper styles for Conditional Formatting
  const getRiskLevelBadge = (level: string, score: number) => {
    const norm = (level || '').trim();
    if (norm === 'เสี่ยงสูง' || norm === 'สูง') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          <span>เสี่ยงสูง</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200/80 font-semibold">{score} คะแนน</span>
        </span>
      );
    }
    if (norm === 'เสี่ยงปานกลาง' || norm === 'ปานกลาง') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>เสี่ยงปานกลาง</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/80 font-semibold">{score} คะแนน</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>เสี่ยงต่ำ</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200/80 font-semibold">{score} คะแนน</span>
      </span>
    );
  };

  const getSugarBadge = (sugar: number) => {
    if (sugar >= 126) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          <span>{sugar}</span>
          <span className="text-[10px] bg-rose-200 text-rose-800 px-1 py-0.2 rounded font-normal">สูงเกินเกณฑ์</span>
        </span>
      );
    }
    if (sugar >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <span>{sugar}</span>
          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-normal">เสี่ยง</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span>{sugar}</span>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-normal">ปกติ</span>
      </span>
    );
  };

  const getBpBadge = (sbp: number, dbp: number) => {
    const isHigh = sbp >= 140 || dbp >= 90;
    const isMod = sbp >= 120 || dbp >= 80;
    if (isHigh) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          <span>{sbp}/{dbp}</span>
          <span className="text-[10px] bg-rose-200 text-rose-800 px-1 py-0.2 rounded font-normal">สูงเกินเกณฑ์</span>
        </span>
      );
    }
    if (isMod) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <span>{sbp}/{dbp}</span>
          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-normal">เฝ้าระวัง</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span>{sbp}/{dbp}</span>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-normal">ปกติ</span>
      </span>
    );
  };

  const getBmiBadge = (bmi: number) => {
    if (bmi >= 25.0) {
      return <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{bmi}</span>;
    }
    if (bmi >= 23.0) {
      return <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{bmi}</span>;
    }
    return <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{bmi}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>ตารางแสดงรายละเอียดเชิงลึกรายบุคคล (Data Table / Detail View)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">
              {filteredRecords.length} รายการ
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ใช้ระบบ <strong className="text-pink-600 font-semibold">Conditional Formatting</strong> เน้นสีแดง (กลุ่มเสี่ยงสูง / ค่าน้ำตาล-ความดันสูงเกินเกณฑ์), สีเหลือง (เสี่ยงปานกลาง), สีเขียว (เสี่ยงต่ำ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารหัส, พื้นที่, เพศ, ความเสี่ยง..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-700 w-44 sm:w-60"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs for Conditional Formatting & Legend */}
      <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-pink-500" />
            <span>ปุ่มแท็บกรองด่วนตามระดับความเสี่ยง:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setRiskTab('all'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                riskTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-800/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                riskTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {riskCounts.total}
              </span>
            </button>
            <button
              onClick={() => { setRiskTab('high'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                riskTab === 'high'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/30'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>🔴 เสี่ยงสูง/เกินเกณฑ์</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                riskTab === 'high' ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-800'
              }`}>
                {riskCounts.high}
              </span>
            </button>
            <button
              onClick={() => { setRiskTab('moderate'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                riskTab === 'moderate'
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/30'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>🟡 เสี่ยงปานกลาง</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                riskTab === 'moderate' ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-950'
              }`}>
                {riskCounts.moderate}
              </span>
            </button>
            <button
              onClick={() => { setRiskTab('low'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                riskTab === 'low'
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>🟢 เสี่ยงต่ำ</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                riskTab === 'low' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-950'
              }`}>
                {riskCounts.low}
              </span>
            </button>
          </div>
        </div>

        {/* Conditional Formatting Color Legend Pill */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
            <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0 animate-pulse" />
            <div>
              <span className="text-rose-800 font-bold block">สีแดง: เสี่ยงสูง / เกินเกณฑ์มาตรฐาน</span>
              <span className="text-[11px] text-rose-600 font-medium">ระดับเสี่ยงสูง • น้ำตาล ≥ 126 mg/dL • ความดัน ≥ 140/90 mmHg</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <span className="text-amber-900 font-bold block">สีเหลือง: เสี่ยงปานกลาง / เฝ้าระวัง</span>
              <span className="text-[11px] text-amber-700 font-medium">ระดับเสี่ยงปานกลาง • น้ำตาล 100-125 • ความดัน 120-139/80-89</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="text-emerald-900 font-bold block">สีเขียว: เสี่ยงต่ำ / ปกติ</span>
              <span className="text-[11px] text-emerald-700 font-medium">ระดับเสี่ยงต่ำ • น้ำตาล &lt; 100 mg/dL • ความดัน &lt; 120/&lt; 80</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50/90 border-b border-pink-100 text-slate-600 font-bold uppercase text-[11px] tracking-wider select-none">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-pink-600"
                >
                  <div className="flex items-center gap-1">
                    <span>รหัสบุคคล</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('area')}
                  className="py-3 px-4 cursor-pointer hover:text-pink-600"
                >
                  <div className="flex items-center gap-1">
                    <span>พื้นที่</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gender')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600"
                >
                  <div className="flex items-center gap-1">
                    <span>เพศ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('age')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>อายุ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bmi')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>BMI</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sbp')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ความดัน SBP/DBP</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bloodSugar')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>น้ำตาล FBS</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('exercise')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600"
                >
                  <div className="flex items-center gap-1">
                    <span>การออกกำลังกาย</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('riskScore')}
                  className="py-3 px-3 cursor-pointer hover:text-pink-600 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>คะแนนเสี่ยง</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('riskLevel')}
                  className="py-3 px-4 cursor-pointer hover:text-pink-600"
                >
                  <div className="flex items-center gap-1">
                    <span>ระดับความเสี่ยง</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row) => {
                  const norm = (row.riskLevel || '').trim();
                  const isHigh = norm === 'เสี่ยงสูง' || norm === 'สูง' || row.bloodSugar >= 126 || row.sbp >= 140 || row.dbp >= 90;
                  const isMod = !isHigh && (norm === 'เสี่ยงปานกลาง' || norm === 'ปานกลาง' || row.bloodSugar >= 100 || row.sbp >= 120 || row.dbp >= 80);
                  
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRecord(row)}
                      className={`transition-colors cursor-pointer border-l-4 ${
                        isHigh
                          ? 'bg-rose-50/40 hover:bg-rose-100/60 border-l-rose-500'
                          : isMod
                          ? 'bg-amber-50/25 hover:bg-amber-100/50 border-l-amber-400'
                          : 'hover:bg-emerald-50/20 border-l-emerald-400'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {isHigh && <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" title="กลุ่มเสี่ยงสูง" />}
                          {isMod && <span className="w-2 h-2 rounded-full bg-amber-500" title="กลุ่มเสี่ยงปานกลาง" />}
                          {!isHigh && !isMod && <span className="w-2 h-2 rounded-full bg-emerald-500" title="กลุ่มเสี่ยงต่ำ" />}
                          <span>{row.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {row.area}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {row.gender}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        {row.age} ปี
                      </td>
                      <td className="py-3 px-3 text-right">
                        {getBmiBadge(row.bmi)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getBpBadge(row.sbp, row.dbp)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getSugarBadge(row.bloodSugar)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-xs">
                        {row.exercise}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${row.riskScore >= 9 ? 'text-rose-600' : row.riskScore >= 5 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {row.riskScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/15</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRiskLevelBadge(row.riskLevel, row.riskScore)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(row);
                          }}
                          className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-all cursor-pointer"
                          title="ดูรายละเอียดฉบับเต็ม"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>แสดงหน้าละ:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              จากทั้งหมด <strong>{filteredRecords.length}</strong> รายการ (หน้า {currentPage} / {totalPages})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-pink-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-pink-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};
