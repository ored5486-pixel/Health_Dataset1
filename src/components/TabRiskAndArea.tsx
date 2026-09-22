import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { HealthRecord } from '../types';
import { normalizeRiskLevel } from '../data/mockHealthData';
import {
  ShieldAlert,
  MapPin,
  Users,
  HeartPulse,
  Activity,
  AlertTriangle,
  Droplets,
  Heart,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText,
} from 'lucide-react';

interface TabRiskAndAreaProps {
  records: HealthRecord[];
}

export const TabRiskAndArea: React.FC<TabRiskAndAreaProps> = ({ records }) => {
  // 1. ระดับความเสี่ยง (Risk Level Distribution)
  const riskLevelData = useMemo(() => {
    const counts: Record<string, number> = {
      เสี่ยงต่ำ: 0,
      เสี่ยงปานกลาง: 0,
      เสี่ยงสูง: 0,
    };
    records.forEach((r) => {
      const norm = normalizeRiskLevel(r.riskLevel);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      }
    });

    const total = records.length || 1;
    return [
      { name: 'เสี่ยงต่ำ', value: counts['เสี่ยงต่ำ'], percent: ((counts['เสี่ยงต่ำ'] / total) * 100).toFixed(1), color: '#10B981' },
      { name: 'เสี่ยงปานกลาง', value: counts['เสี่ยงปานกลาง'], percent: ((counts['เสี่ยงปานกลาง'] / total) * 100).toFixed(1), color: '#F59E0B' },
      { name: 'เสี่ยงสูง', value: counts['เสี่ยงสูง'], percent: ((counts['เสี่ยงสูง'] / total) * 100).toFixed(1), color: '#E11D48' },
    ];
  }, [records]);

  // 2. ผลการคัดกรองเบาหวาน & ความดันโลหิตสูง (Screening Status Comparison)
  const screeningComparisonData = useMemo(() => {
    let dmNormal = 0;
    let dmRisk = 0;
    let htNormal = 0;
    let htRisk = 0;

    records.forEach((r) => {
      if (
        r.diabetesScreening === 'มีแนวโน้ม/เสี่ยง' ||
        r.diabetesScreening === 'กลุ่มเสี่ยง' ||
        r.diabetesScreening === 'สงสัยป่วย' ||
        r.diabetesScreening === 'ป่วย'
      ) {
        dmRisk++;
      } else {
        dmNormal++;
      }

      if (
        r.htScreening === 'มีแนวโน้ม/เสี่ยง' ||
        r.htScreening === 'กลุ่มเสี่ยง' ||
        r.htScreening === 'สงสัยป่วย' ||
        r.htScreening === 'ป่วย'
      ) {
        htRisk++;
      } else {
        htNormal++;
      }
    });

    return [
      {
        category: 'ไม่มีความเสี่ยง (ปกติ)',
        เบาหวาน: dmNormal,
        ความดันโลหิตสูง: htNormal,
      },
      {
        category: 'มีแนวโน้ม / เสี่ยง',
        เบาหวาน: dmRisk,
        ความดันโลหิตสูง: htRisk,
      },
    ];
  }, [records]);

  // 3. พื้นที่ที่มีผู้เสี่ยงสูง (High Risk by Area)
  const highRiskByAreaData = useMemo(() => {
    const areaMap: Record<string, { total: number; highRisk: number; avgScore: number; sumScore: number }> = {};
    records.forEach((r) => {
      if (!areaMap[r.area]) {
        areaMap[r.area] = { total: 0, highRisk: 0, avgScore: 0, sumScore: 0 };
      }
      areaMap[r.area].total++;
      areaMap[r.area].sumScore += r.riskScore;
      if (normalizeRiskLevel(r.riskLevel) === 'เสี่ยงสูง') {
        areaMap[r.area].highRisk++;
      }
    });

    return Object.entries(areaMap)
      .map(([area, data]) => ({
        area,
        ผู้เสี่ยงสูง: data.highRisk,
        รวมผู้คัดกรอง: data.total,
        อัตราส่วนเสี่ยงสูง: parseFloat(((data.highRisk / data.total) * 100).toFixed(1)),
        คะแนนเสี่ยงเฉลี่ย: parseFloat((data.sumScore / data.total).toFixed(1)),
      }))
      .sort((a, b) => b.ผู้เสี่ยงสูง - a.ผู้เสี่ยงสูง);
  }, [records]);

  // 4. กลุ่มอายุที่มีความเสี่ยงสูง (Risk by Age Group)
  const riskByAgeGroupData = useMemo(() => {
    const ageGroups: Record<string, { เสี่ยงต่ำ: number; เสี่ยงปานกลาง: number; เสี่ยงสูง: number; total: number }> = {
      'ต่ำกว่า 35 ปี': { เสี่ยงต่ำ: 0, เสี่ยงปานกลาง: 0, เสี่ยงสูง: 0, total: 0 },
      '35 - 44 ปี': { เสี่ยงต่ำ: 0, เสี่ยงปานกลาง: 0, เสี่ยงสูง: 0, total: 0 },
      '45 - 59 ปี': { เสี่ยงต่ำ: 0, เสี่ยงปานกลาง: 0, เสี่ยงสูง: 0, total: 0 },
      '60 ปีขึ้นไป': { เสี่ยงต่ำ: 0, เสี่ยงปานกลาง: 0, เสี่ยงสูง: 0, total: 0 },
    };

    records.forEach((r) => {
      let grp = 'ต่ำกว่า 35 ปี';
      if (r.age >= 60) grp = '60 ปีขึ้นไป';
      else if (r.age >= 45) grp = '45 - 59 ปี';
      else if (r.age >= 35) grp = '35 - 44 ปี';

      ageGroups[grp].total++;
      const norm = normalizeRiskLevel(r.riskLevel);
      if (norm === 'เสี่ยงสูง') ageGroups[grp].เสี่ยงสูง++;
      else if (norm === 'เสี่ยงปานกลาง') ageGroups[grp].เสี่ยงปานกลาง++;
      else ageGroups[grp].เสี่ยงต่ำ++;
    });

    return Object.entries(ageGroups).map(([group, counts]) => ({
      group,
      เสี่ยงต่ำ: counts.เสี่ยงต่ำ,
      เสี่ยงปานกลาง: counts.เสี่ยงปานกลาง,
      เสี่ยงสูง: counts.เสี่ยงสูง,
      total: counts.total,
      highRiskRate: counts.total > 0 ? ((counts.เสี่ยงสูง / counts.total) * 100).toFixed(1) : '0',
    }));
  }, [records]);

  // 5. การกระจายของคะแนนความเสี่ยง (Risk Score Distribution 0-15)
  const scoreDistributionData = useMemo(() => {
    const scoreBins = [
      { range: '0-3 (ต่ำ)', count: 0, color: '#10B981' },
      { range: '4-6 (ปานกลางช่วงล่าง)', count: 0, color: '#FBBF24' },
      { range: '7-9 (ปานกลางช่วงบน)', count: 0, color: '#F59E0B' },
      { range: '10-12 (สูง)', count: 0, color: '#FB7185' },
      { range: '13-15 (วิกฤติ/สูงมาก)', count: 0, color: '#E11D48' },
    ];

    records.forEach((r) => {
      if (r.riskScore <= 3) scoreBins[0].count++;
      else if (r.riskScore <= 6) scoreBins[1].count++;
      else if (r.riskScore <= 9) scoreBins[2].count++;
      else if (r.riskScore <= 12) scoreBins[3].count++;
      else scoreBins[4].count++;
    });

    return scoreBins;
  }, [records]);

  // 6. ส่วนรายละเอียดเชิงลึก หัวข้อระดับความเสี่ยง (In-Depth Risk Level & Clinical Threshold Breakdown)
  const inDepthRiskDetails = useMemo(() => {
    const highRiskList: HealthRecord[] = [];
    const modRiskList: HealthRecord[] = [];
    const lowRiskList: HealthRecord[] = [];

    let totalHighSugar = 0;
    let totalHighBp = 0;
    let totalModSugar = 0;
    let totalModBp = 0;
    let totalNormalSugar = 0;
    let totalNormalBp = 0;

    records.forEach((r) => {
      const norm = normalizeRiskLevel(r.riskLevel);
      if (norm === 'เสี่ยงสูง') {
        highRiskList.push(r);
      } else if (norm === 'เสี่ยงปานกลาง') {
        modRiskList.push(r);
      } else {
        lowRiskList.push(r);
      }

      // Sugar thresholds
      if (r.bloodSugar >= 126) totalHighSugar++;
      else if (r.bloodSugar >= 100) totalModSugar++;
      else totalNormalSugar++;

      // BP thresholds
      if (r.sbp >= 140 || r.dbp >= 90) totalHighBp++;
      else if (r.sbp >= 120 || r.dbp >= 80) totalModBp++;
      else totalNormalBp++;
    });

    const calcAvg = (list: HealthRecord[], key: 'bloodSugar' | 'sbp' | 'dbp' | 'bmi' | 'riskScore') => {
      if (list.length === 0) return '0';
      const sum = list.reduce((acc, cur) => acc + (cur[key] || 0), 0);
      return (sum / list.length).toFixed(1);
    };

    return {
      high: {
        records: highRiskList,
        count: highRiskList.length,
        percent: records.length > 0 ? ((highRiskList.length / records.length) * 100).toFixed(1) : '0',
        avgSugar: calcAvg(highRiskList, 'bloodSugar'),
        avgSbp: calcAvg(highRiskList, 'sbp'),
        avgDbp: calcAvg(highRiskList, 'dbp'),
        avgBmi: calcAvg(highRiskList, 'bmi'),
        avgScore: calcAvg(highRiskList, 'riskScore'),
      },
      moderate: {
        records: modRiskList,
        count: modRiskList.length,
        percent: records.length > 0 ? ((modRiskList.length / records.length) * 100).toFixed(1) : '0',
        avgSugar: calcAvg(modRiskList, 'bloodSugar'),
        avgSbp: calcAvg(modRiskList, 'sbp'),
        avgDbp: calcAvg(modRiskList, 'dbp'),
        avgBmi: calcAvg(modRiskList, 'bmi'),
        avgScore: calcAvg(modRiskList, 'riskScore'),
      },
      low: {
        records: lowRiskList,
        count: lowRiskList.length,
        percent: records.length > 0 ? ((lowRiskList.length / records.length) * 100).toFixed(1) : '0',
        avgSugar: calcAvg(lowRiskList, 'bloodSugar'),
        avgSbp: calcAvg(lowRiskList, 'sbp'),
        avgDbp: calcAvg(lowRiskList, 'dbp'),
        avgBmi: calcAvg(lowRiskList, 'bmi'),
        avgScore: calcAvg(lowRiskList, 'riskScore'),
      },
      totals: {
        totalHighSugar,
        totalHighBp,
        totalModSugar,
        totalModBp,
        totalNormalSugar,
        totalNormalBp,
      },
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Overview Cards Row 1: Donut Level + Screening Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: สัดส่วนระดับความเสี่ยง (Health Risk Level) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">สัดส่วนระดับความเสี่ยงสุขภาพ</h3>
                <p className="text-xs text-slate-500">จำแนกตามเกณฑ์ความเสี่ยง NCDs</p>
              </div>
            </div>
          </div>

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskLevelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} คน (${item?.payload?.percent ?? ''}%)`,
                    `กลุ่ม${name}`,
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800">{records.length}</span>
              <span className="text-xs text-slate-400">ผู้คัดกรอง</span>
            </div>
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            {riskLevelData.map((item) => (
              <div key={item.name} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-center">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 mt-1">{item.value} คน</span>
                <span className="text-[11px] text-slate-500">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: การคัดกรองเบาหวาน และ ความดันโลหิตสูง (Health Risk 4 Field) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">ผลคัดกรองเบาหวาน และ ความดันโลหิตสูง</h3>
                <p className="text-xs text-slate-500">เปรียบเทียบจำนวนผู้มีภาวะปกติ กลุ่มเสี่ยง และสงสัยป่วย</p>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={screeningComparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} คน`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="เบาหวาน" fill="#EC4899" radius={[6, 6, 0, 0]} barSize={26} />
                <Bar dataKey="ความดันโลหิตสูง" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 p-3 rounded-xl bg-pink-50/60 border border-pink-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-rose-700 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>สงสัยป่วย/กลุ่มเสี่ยงเบาหวาน (น้ำตาล ≥ 100 mg/dL):</span>
              <strong className="font-bold">{screeningComparisonData[1]?.เบาหวาน || 0} คน</strong>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700 font-medium">
              <span>สงสัยป่วย/กลุ่มเสี่ยงความดัน (SBP ≥ 120 mmHg):</span>
              <strong className="font-bold">{screeningComparisonData[1]?.ความดันโลหิตสูง || 0} คน</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนรายละเอียดเชิงลึก: หัวข้อระดับความเสี่ยง (In-Depth Risk Level & Clinical Breakdown with Conditional Formatting) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-100 text-pink-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                <span>ส่วนรายละเอียดเชิงลึก: หัวข้อระดับความเสี่ยง (Risk Level In-Depth Analysis)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                การใช้สีเพื่อเน้นข้อมูล (Conditional Formatting): <span className="font-bold text-rose-600">🔴 สีแดงกลุ่มเสี่ยงสูง/ค่าน้ำตาล-ความดันสูงเกินเกณฑ์</span> • <span className="font-bold text-amber-600">🟡 สีเหลืองเสี่ยงปานกลาง</span> • <span className="font-bold text-emerald-600">🟢 สีเขียวเสี่ยงต่ำ</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3 Detail Cards with Conditional Formatting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 🔴 กลุ่มเสี่ยงสูง */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border-2 border-rose-300 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  กลุ่มเสี่ยงสูง (High Risk)
                </span>
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200">
                  เน้นสีแดง
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-700">{inDepthRiskDetails.high.count}</span>
                <span className="text-sm font-semibold text-rose-800">คน ({inDepthRiskDetails.high.percent}%)</span>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-white/80 border border-rose-200 space-y-2 text-xs">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>เกณฑ์ระบุกลุ่มเสี่ยงสูง / เกินเกณฑ์:</span>
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
                  <li>ระดับความเสี่ยง = <strong className="text-rose-700">เสี่ยงสูง</strong></li>
                  <li>น้ำตาลในเลือด ≥ <strong className="text-rose-700">126 mg/dL</strong> (พบทั้งกลุ่ม {inDepthRiskDetails.totals.totalHighSugar} คน)</li>
                  <li>ความดัน SBP ≥ <strong className="text-rose-700">140</strong> หรือ DBP ≥ <strong className="text-rose-700">90 mmHg</strong> (พบ {inDepthRiskDetails.totals.totalHighBp} คน)</li>
                </ul>
              </div>

              {/* Averages */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white border border-rose-100">
                  <span className="text-[10px] text-slate-500 block">น้ำตาลเฉลี่ย</span>
                  <span className="font-bold text-rose-700 text-sm">{inDepthRiskDetails.high.avgSugar}</span>
                  <span className="text-[10px] text-slate-400"> mg/dL</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-rose-100">
                  <span className="text-[10px] text-slate-500 block">ความดันเฉลี่ย</span>
                  <span className="font-bold text-rose-700 text-sm">{inDepthRiskDetails.high.avgSbp}/{inDepthRiskDetails.high.avgDbp}</span>
                  <span className="text-[10px] text-slate-400"> mmHg</span>
                </div>
              </div>

              {/* Individual Pills */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">รหัสบุคคลในกลุ่มนี้:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inDepthRiskDetails.high.records.map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 rounded-md bg-rose-200/90 text-rose-900 font-mono text-xs font-bold border border-rose-300 shadow-2xs"
                      title={`${r.id}: ${r.area} | น้ำตาล ${r.bloodSugar} mg/dL | BP ${r.sbp}/${r.dbp}`}
                    >
                      {r.id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-rose-200/80 text-[11px] text-rose-900 font-medium flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>ส่งต่อพบแพทย์เพื่อตรวจยืนยันและควบคุมอาหาร ยา อย่างเข้มงวด</span>
            </div>
          </div>

          {/* Card 2: 🟡 กลุ่มเสี่ยงปานกลาง */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-300 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  กลุ่มเสี่ยงปานกลาง (Moderate)
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                  เน้นสีเหลือง
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-800">{inDepthRiskDetails.moderate.count}</span>
                <span className="text-sm font-semibold text-amber-900">คน ({inDepthRiskDetails.moderate.percent}%)</span>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-white/80 border border-amber-200 space-y-2 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>เกณฑ์ระบุกลุ่มเสี่ยงปานกลาง / เฝ้าระวัง:</span>
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
                  <li>ระดับความเสี่ยง = <strong className="text-amber-800">เสี่ยงปานกลาง</strong></li>
                  <li>น้ำตาลในเลือด <strong className="text-amber-800">100 - 125 mg/dL</strong> (Pre-DM {inDepthRiskDetails.totals.totalModSugar} คน)</li>
                  <li>ความดัน SBP <strong className="text-amber-800">120 - 139</strong> หรือ DBP <strong className="text-amber-800">80 - 89 mmHg</strong> (Pre-HT {inDepthRiskDetails.totals.totalModBp} คน)</li>
                </ul>
              </div>

              {/* Averages */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">น้ำตาลเฉลี่ย</span>
                  <span className="font-bold text-amber-800 text-sm">{inDepthRiskDetails.moderate.avgSugar}</span>
                  <span className="text-[10px] text-slate-400"> mg/dL</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">ความดันเฉลี่ย</span>
                  <span className="font-bold text-amber-800 text-sm">{inDepthRiskDetails.moderate.avgSbp}/{inDepthRiskDetails.moderate.avgDbp}</span>
                  <span className="text-[10px] text-slate-400"> mmHg</span>
                </div>
              </div>

              {/* Individual Pills */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">รหัสบุคคลในกลุ่มนี้:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inDepthRiskDetails.moderate.records.map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 rounded-md bg-amber-200/90 text-amber-950 font-mono text-xs font-semibold border border-amber-300 shadow-2xs"
                      title={`${r.id}: ${r.area} | น้ำตาล ${r.bloodSugar} mg/dL | BP ${r.sbp}/${r.dbp}`}
                    >
                      {r.id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-200/80 text-[11px] text-amber-900 font-medium flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>ปรับเปลี่ยนพฤติกรรม ลดหวาน มัน เค็ม และนัดตรวจซ้ำ 3-6 เดือน</span>
            </div>
          </div>

          {/* Card 3: 🟢 กลุ่มเสี่ยงต่ำ */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-300 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  กลุ่มเสี่ยงต่ำ (Low Risk)
                </span>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                  เน้นสีเขียว
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700">{inDepthRiskDetails.low.count}</span>
                <span className="text-sm font-semibold text-emerald-800">คน ({inDepthRiskDetails.low.percent}%)</span>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-white/80 border border-emerald-200 space-y-2 text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>เกณฑ์ระบุกลุ่มเสี่ยงต่ำ / สุขภาพปกติ:</span>
                </div>
                <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
                  <li>ระดับความเสี่ยง = <strong className="text-emerald-700">เสี่ยงต่ำ</strong></li>
                  <li>น้ำตาลในเลือด &lt; <strong className="text-emerald-700">100 mg/dL</strong> (ปกติ {inDepthRiskDetails.totals.totalNormalSugar} คน)</li>
                  <li>ความดัน SBP &lt; <strong className="text-emerald-700">120</strong> และ DBP &lt; <strong className="text-emerald-700">80 mmHg</strong> (ปกติ {inDepthRiskDetails.totals.totalNormalBp} คน)</li>
                </ul>
              </div>

              {/* Averages */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">น้ำตาลเฉลี่ย</span>
                  <span className="font-bold text-emerald-700 text-sm">{inDepthRiskDetails.low.avgSugar}</span>
                  <span className="text-[10px] text-slate-400"> mg/dL</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">ความดันเฉลี่ย</span>
                  <span className="font-bold text-emerald-700 text-sm">{inDepthRiskDetails.low.avgSbp}/{inDepthRiskDetails.low.avgDbp}</span>
                  <span className="text-[10px] text-slate-400"> mmHg</span>
                </div>
              </div>

              {/* Individual Pills */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">รหัสบุคคลในกลุ่มนี้:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inDepthRiskDetails.low.records.map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-0.5 rounded-md bg-emerald-200/90 text-emerald-950 font-mono text-xs font-semibold border border-emerald-300 shadow-2xs"
                      title={`${r.id}: ${r.area} | น้ำตาล ${r.bloodSugar} mg/dL | BP ${r.sbp}/${r.dbp}`}
                    >
                      {r.id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200/80 text-[11px] text-emerald-900 font-medium flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>รักษาสุขภาพดีต่อเนื่อง ออกกำลังกายสม่ำเสมอ และตรวจประจำปี</span>
            </div>
          </div>
        </div>

        {/* Clinical Threshold Comparison Matrix */}
        <div className="rounded-2xl border border-pink-100 overflow-hidden">
          <div className="bg-pink-50/70 p-3.5 border-b border-pink-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-xs md:text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-pink-600" />
              <span>ตารางเกณฑ์เปรียบเทียบ Conditional Formatting ตามมาตรฐานสาธารณสุข</span>
            </h4>
            <span className="text-[11px] text-slate-500">ข้อมูลกลุ่มตัวอย่าง 30 รายการ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <th className="py-2.5 px-3">ตัวชี้วัดสุขภาพ</th>
                  <th className="py-2.5 px-3 text-emerald-800 bg-emerald-50/60">🟢 สีเขียว (เสี่ยงต่ำ / ปกติ)</th>
                  <th className="py-2.5 px-3 text-amber-900 bg-amber-50/60">🟡 สีเหลือง (เสี่ยงปานกลาง / เฝ้าระวัง)</th>
                  <th className="py-2.5 px-3 text-rose-800 bg-rose-50/60">🔴 สีแดง (เสี่ยงสูง / สูงเกินเกณฑ์)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[12px]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">ระดับความเสี่ยง (Risk Level)</td>
                  <td className="py-2.5 px-3 bg-emerald-50/20 text-emerald-900">ระดับเสี่ยงต่ำ (คะแนน 0-4)</td>
                  <td className="py-2.5 px-3 bg-amber-50/20 text-amber-950">ระดับเสี่ยงปานกลาง (คะแนน 5-8)</td>
                  <td className="py-2.5 px-3 bg-rose-50/20 text-rose-900 font-bold">ระดับเสี่ยงสูง (คะแนน ≥ 9)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">น้ำตาลในเลือด FBS (mg/dL)</td>
                  <td className="py-2.5 px-3 bg-emerald-50/20 text-emerald-900">&lt; 100 mg/dL (ปกติ: {inDepthRiskDetails.totals.totalNormalSugar} คน)</td>
                  <td className="py-2.5 px-3 bg-amber-50/20 text-amber-950">100 - 125 mg/dL (เสี่ยง: {inDepthRiskDetails.totals.totalModSugar} คน)</td>
                  <td className="py-2.5 px-3 bg-rose-50/20 text-rose-900 font-bold">≥ 126 mg/dL (สูงเกินเกณฑ์: {inDepthRiskDetails.totals.totalHighSugar} คน)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">ความดันโลหิต SBP/DBP (mmHg)</td>
                  <td className="py-2.5 px-3 bg-emerald-50/20 text-emerald-900">SBP &lt; 120 และ DBP &lt; 80 (ปกติ: {inDepthRiskDetails.totals.totalNormalBp} คน)</td>
                  <td className="py-2.5 px-3 bg-amber-50/20 text-amber-950">SBP 120-139 หรือ DBP 80-89 (เฝ้าระวัง: {inDepthRiskDetails.totals.totalModBp} คน)</td>
                  <td className="py-2.5 px-3 bg-rose-50/20 text-rose-900 font-bold">SBP ≥ 140 หรือ DBP ≥ 90 (สูงเกินเกณฑ์: {inDepthRiskDetails.totals.totalHighBp} คน)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">ดัชนีมวลกาย BMI (kg/m²)</td>
                  <td className="py-2.5 px-3 bg-emerald-50/20 text-emerald-900">18.5 - 22.9 (สมส่วน)</td>
                  <td className="py-2.5 px-3 bg-amber-50/20 text-amber-950">23.0 - 24.9 (น้ำหนักเกิน)</td>
                  <td className="py-2.5 px-3 bg-rose-50/20 text-rose-900 font-bold">≥ 25.0 (อ้วน / เสี่ยงสูง)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">มาตรการทางสาธารณสุข</td>
                  <td className="py-2.5 px-3 bg-emerald-50/20 text-emerald-900">ส่งเสริมสุขภาพ ตรวจคัดกรองประจำปี</td>
                  <td className="py-2.5 px-3 bg-amber-50/20 text-amber-950">ปรับพฤติกรรม ลดหวานมันเค็ม ตรวจซ้ำ 3-6 ด.</td>
                  <td className="py-2.5 px-3 bg-rose-50/20 text-rose-900 font-bold">ส่งต่อแพทย์ รพ.สต./รพช. วินิจฉัยรักษาทันที</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: พื้นที่ที่มีผู้เสี่ยงสูง (High Risk by Area) & กลุ่มอายุที่มีความเสี่ยงสูง (High Risk by Age) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: พื้นที่ที่มีผู้เสี่ยงสูง */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">พื้นที่ที่มีผู้เสี่ยงสูง (Area Analysis)</h3>
                <p className="text-xs text-slate-500">เรียงตามจำนวนผู้มีความเสี่ยงสูงในแต่ละพื้นที่/ชุมชน</p>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={highRiskByAreaData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  dataKey="area"
                  type="category"
                  stroke="#475569"
                  fontSize={12}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} คน (${item?.payload?.อัตราส่วนเสี่ยงสูง ?? ''}% ของพื้นที่)`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="ผู้เสี่ยงสูง" fill="#E11D48" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: กลุ่มอายุที่มีความเสี่ยงสูง */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-fuchsia-50 text-fuchsia-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">กลุ่มอายุที่มีความเสี่ยงสูง</h3>
                <p className="text-xs text-slate-500">ระดับความเสี่ยงจำแนกตามช่วงอายุ</p>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByAgeGroupData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="group" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} คน`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="เสี่ยงต่ำ" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="เสี่ยงปานกลาง" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="เสี่ยงสูง" stackId="a" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: การกระจายคะแนนความเสี่ยง (คะแนนความเสี่ยง 0-15) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">การแจกแจงช่วงคะแนนความเสี่ยง (Risk Score Distribution)</h3>
              <p className="text-xs text-slate-500">ประเมินจากปัจจัยเสี่ยงรวม 15 คะแนน (ยิ่งคะแนนสูง ยิ่งมีความเสี่ยงต่อโรค NCDs)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {scoreDistributionData.map((bin) => {
            const pct = records.length > 0 ? ((bin.count / records.length) * 100).toFixed(1) : '0';
            return (
              <div
                key={bin.range}
                className="p-4 rounded-xl border border-pink-50 bg-slate-50/60 hover:bg-white hover:border-pink-200 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">{bin.range}</span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: bin.color }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{bin.count}</span>
                  <span className="text-xs text-slate-500">คน</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: bin.color }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">{pct}% ของทั้งหมด</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
