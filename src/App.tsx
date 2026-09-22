import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HealthRecord, FilterState, KPIData } from './types';
import { DEFAULT_SHEET_ID, INITIAL_HEALTH_RECORDS, normalizeRiskLevel } from './data/mockHealthData';
import { fetchHealthRecords } from './services/sheetService';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { FilterBar } from './components/FilterBar';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { TabRiskAndArea } from './components/TabRiskAndArea';
import { TabBehaviorAndTrends } from './components/TabBehaviorAndTrends';
import { TabDataTable } from './components/TabDataTable';
import { SheetImportModal } from './components/SheetImportModal';
import { Heart, Activity } from 'lucide-react';

export default function App() {
  const [sheetId, setSheetId] = useState<string>(DEFAULT_SHEET_ID);
  const [records, setRecords] = useState<HealthRecord[]>(INITIAL_HEALTH_RECORDS);
  const [source, setSource] = useState<'google_sheet' | 'local_verified'>('local_verified');
  const [timestamp, setTimestamp] = useState<string>(() => {
    const d = new Date();
    return `${d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} เวลา ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tab1_risk_area');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    area: 'all',
    ageGroup: 'all',
    gender: 'all',
    riskLevel: 'all',
    searchQuery: '',
  });

  // Load data from Google Sheet or fallback
  const loadData = useCallback(async (targetSheetId: string) => {
    setIsLoading(true);
    try {
      const res = await fetchHealthRecords(targetSheetId);
      setRecords(res.records);
      setSource(res.source);
      setTimestamp(res.timestamp);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(sheetId);
  }, [loadData, sheetId]);

  // Extract unique areas for filter
  const areas = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.area) set.add(r.area);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [records]);

  // Risk counts for quick filter tabs
  const riskCounts = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let low = 0;
    records.forEach((r) => {
      const norm = normalizeRiskLevel(r.riskLevel);
      const isHigh = norm === 'เสี่ยงสูง' || r.bloodSugar >= 126 || r.sbp >= 140 || r.dbp >= 90;
      const isMod = !isHigh && (norm === 'เสี่ยงปานกลาง' || r.bloodSugar >= 100 || r.sbp >= 120 || r.dbp >= 80);
      if (isHigh) high++;
      else if (isMod) moderate++;
      else low++;
    });
    return { total: records.length, high, moderate, low };
  }, [records]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Area filter
      if (filters.area !== 'all' && r.area !== filters.area) {
        return false;
      }

      // Age group filter
      if (filters.ageGroup !== 'all') {
        if (filters.ageGroup === 'under35' && r.age >= 35) return false;
        if (filters.ageGroup === '35-44' && (r.age < 35 || r.age > 44)) return false;
        if (filters.ageGroup === '45-59' && (r.age < 45 || r.age > 59)) return false;
        if (filters.ageGroup === '60plus' && r.age < 60) return false;
      }

      // Gender filter
      if (filters.gender !== 'all' && r.gender !== filters.gender) {
        return false;
      }

      // Risk level filter (รองรับทั้งระดับเสี่ยง และเกณฑ์ Conditional Formatting เกินเกณฑ์)
      if (filters.riskLevel !== 'all') {
        const norm = normalizeRiskLevel(r.riskLevel);
        const isHigh = norm === 'เสี่ยงสูง' || r.bloodSugar >= 126 || r.sbp >= 140 || r.dbp >= 90;
        const isMod = !isHigh && (norm === 'เสี่ยงปานกลาง' || r.bloodSugar >= 100 || r.sbp >= 120 || r.dbp >= 80);
        const isLow = !isHigh && !isMod;

        if (
          filters.riskLevel === 'high' ||
          filters.riskLevel === 'เสี่ยงสูง' ||
          filters.riskLevel === 'เสี่ยงสูง/เกินเกณฑ์'
        ) {
          if (!isHigh) return false;
        } else if (filters.riskLevel === 'moderate' || filters.riskLevel === 'เสี่ยงปานกลาง') {
          if (!isMod) return false;
        } else if (filters.riskLevel === 'low' || filters.riskLevel === 'เสี่ยงต่ำ') {
          if (!isLow) return false;
        }
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchId = r.id.toLowerCase().includes(q);
        const matchArea = r.area.toLowerCase().includes(q);
        if (!matchId && !matchArea) return false;
      }

      return true;
    });
  }, [records, filters]);

  // Compute KPI summaries
  const kpiData: KPIData = useMemo(() => {
    const total = filteredRecords.length;
    if (total === 0) {
      return {
        totalCount: 0,
        avgBloodSugar: 0,
        avgRiskScore: 0,
        minSbp: 0,
        maxSbp: 0,
        avgSbp: 0,
        highRiskCount: 0,
        highRiskPercentage: 0,
        moderateRiskCount: 0,
        lowRiskCount: 0,
        highSugarCount: 0,
        highBpCount: 0,
      };
    }

    let sugarSum = 0;
    let scoreSum = 0;
    let sbpSum = 0;
    let minSbp = filteredRecords[0].sbp;
    let maxSbp = filteredRecords[0].sbp;
    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let lowRiskCount = 0;
    let highSugarCount = 0;
    let highBpCount = 0;

    filteredRecords.forEach((r) => {
      sugarSum += r.bloodSugar;
      scoreSum += r.riskScore;
      sbpSum += r.sbp;
      if (r.sbp < minSbp) minSbp = r.sbp;
      if (r.sbp > maxSbp) maxSbp = r.sbp;

      const norm = normalizeRiskLevel(r.riskLevel);
      if (norm === 'เสี่ยงสูง') highRiskCount++;
      else if (norm === 'เสี่ยงปานกลาง') moderateRiskCount++;
      else lowRiskCount++;

      if (r.bloodSugar >= 126 || r.diabetesScreening === 'มีแนวโน้ม/เสี่ยง' || r.diabetesScreening === 'สงสัยป่วย') highSugarCount++;
      if (r.sbp >= 140 || r.htScreening === 'มีแนวโน้ม/เสี่ยง' || r.htScreening === 'สงสัยป่วย') highBpCount++;
    });

    return {
      totalCount: total,
      avgBloodSugar: sugarSum / total,
      avgRiskScore: scoreSum / total,
      minSbp,
      maxSbp,
      avgSbp: sbpSum / total,
      highRiskCount,
      highRiskPercentage: (highRiskCount / total) * 100,
      moderateRiskCount,
      lowRiskCount,
      highSugarCount,
      highBpCount,
    };
  }, [filteredRecords]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      area: 'all',
      ageGroup: 'all',
      gender: 'all',
      riskLevel: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-slate-800 pb-16 font-['Prompt',sans-serif]">
      {/* Top subtle glow banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        {/* 1. ส่วนหัวและระบบควบคุม (Header & System Controls) */}
        <Header
          sheetId={sheetId}
          source={source}
          timestamp={timestamp}
          totalRecords={records.length}
          filteredCount={filteredRecords.length}
          isLoading={isLoading}
          onRefresh={() => loadData(sheetId)}
          onOpenImport={() => setIsImportModalOpen(true)}
        />

        {/* 2. การสรุปข้อมูลสำคัญ (KPI Cards / Summary Cards - Health Overview) */}
        <KPICards kpi={kpiData} totalUnfiltered={records.length} />

        {/* 1.2 ส่วนตัวกรอง (Filters: พื้นที่, อายุ, เพศ, ระดับความเสี่ยง) */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          areas={areas}
          totalFiltered={filteredRecords.length}
          totalAll={records.length}
          riskCounts={riskCounts}
        />

        {/* 5. ระบบนำทาง (Navigation Controls: Tab 1, 2, 3) */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={{
            totalRecords: filteredRecords.length,
            highRiskCount: kpiData.highRiskCount,
          }}
        />

        {/* Tab Views */}
        <section aria-label="Dashboard Content">
          {activeTab === 'tab1_risk_area' && (
            <TabRiskAndArea records={filteredRecords} />
          )}

          {activeTab === 'tab2_behavior_trends' && (
            <TabBehaviorAndTrends records={filteredRecords} />
          )}

          {activeTab === 'tab3_data_table' && (
            <TabDataTable records={filteredRecords} />
          )}
        </section>

        {/* Sheet Settings & CSV Import Modal */}
        <SheetImportModal
          currentSheetId={sheetId}
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onApplySheetId={(newId) => {
            setSheetId(newId);
            loadData(newId);
          }}
          onImportRecords={(imported) => {
            setRecords(imported);
            setSource('local_verified');
            const now = new Date();
            setTimestamp(
              `${now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} เวลา ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`
            );
          }}
          onResetToDefault={() => {
            setSheetId(DEFAULT_SHEET_ID);
            setRecords(INITIAL_HEALTH_RECORDS);
            setSource('local_verified');
          }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-pink-200/60 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-700">
            <span>รายงานการคัดกรองสุขภาพ</span>
            <span>•</span>
            <span>จัดทำโดย <strong>นางสาวณัฐธิดา อินทร</strong></span>
          </p>
          <p className="text-[11px] text-slate-400">
            ระบบสารสนเทศสุขภาพชุมชน เชื่อมโยงข้อมูล Google Sheet ID: <span className="font-mono text-pink-600">{sheetId}</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
