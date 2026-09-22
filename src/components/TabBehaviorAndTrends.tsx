import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { HealthRecord } from '../types';
import { normalizeRiskLevel } from '../data/mockHealthData';
import { HeartPulse, Flame, Wine, Dumbbell, TrendingUp, Sparkles, Activity } from 'lucide-react';

interface TabBehaviorAndTrendsProps {
  records: HealthRecord[];
}

export const TabBehaviorAndTrends: React.FC<TabBehaviorAndTrendsProps> = ({ records }) => {
  const [selectedBehavior, setSelectedBehavior] = useState<'smoking' | 'alcohol' | 'exercise'>('exercise');

  // 1. Data for Scatter: BMI vs Blood Sugar
  const scatterBmiSugarData = useMemo(() => {
    return records.map((r) => {
      const norm = normalizeRiskLevel(r.riskLevel);
      return {
        id: r.id,
        bmi: r.bmi,
        sugar: r.bloodSugar,
        riskLevel: norm,
        color: norm === 'เสี่ยงสูง' ? '#E11D48' : norm === 'เสี่ยงปานกลาง' ? '#F59E0B' : '#10B981',
        age: r.age,
        gender: r.gender,
      };
    });
  }, [records]);

  // 2. Data for Scatter: BMI vs SBP
  const scatterBmiSbpData = useMemo(() => {
    return records.map((r) => {
      const norm = normalizeRiskLevel(r.riskLevel);
      return {
        id: r.id,
        bmi: r.bmi,
        sbp: r.sbp,
        riskLevel: norm,
        color: norm === 'เสี่ยงสูง' ? '#E11D48' : norm === 'เสี่ยงปานกลาง' ? '#F59E0B' : '#10B981',
        age: r.age,
        gender: r.gender,
      };
    });
  }, [records]);

  // 3. พฤติกรรมกับระดับความเสี่ยง (Behavior vs Risk Level)
  const behaviorRiskData = useMemo(() => {
    const keyMap = {
      smoking: 'smoking',
      alcohol: 'alcohol',
      exercise: 'exercise',
    } as const;

    const currentKey = keyMap[selectedBehavior];
    const groups: Record<string, { เสี่ยงต่ำ: number; เสี่ยงปานกลาง: number; เสี่ยงสูง: number; total: number }> = {};

    records.forEach((r) => {
      const val = r[currentKey];
      if (!groups[val]) {
        groups[val] = { เสี่ยงต่ำ: 0, เสี่ยงปานกลาง: 0, เสี่ยงสูง: 0, total: 0 };
      }
      groups[val].total++;
      const norm = normalizeRiskLevel(r.riskLevel);
      if (norm === 'เสี่ยงสูง') groups[val].เสี่ยงสูง++;
      else if (norm === 'เสี่ยงปานกลาง') groups[val].เสี่ยงปานกลาง++;
      else groups[val].เสี่ยงต่ำ++;
    });

    return Object.entries(groups).map(([behavior, data]) => ({
      behavior,
      เสี่ยงต่ำ: data.เสี่ยงต่ำ,
      เสี่ยงปานกลาง: data.เสี่ยงปานกลาง,
      เสี่ยงสูง: data.เสี่ยงสูง,
      total: data.total,
      highRiskRate: data.total > 0 ? ((data.เสี่ยงสูง / data.total) * 100).toFixed(1) : '0',
    }));
  }, [records, selectedBehavior]);

  // 4. แนวโน้มสุขภาพตามวันที่ตรวจ BMI (Screening Date Health Trends)
  const dateTrendData = useMemo(() => {
    const parseDateToMs = (str: string) => {
      if (!str) return 0;
      if (str.includes('/')) {
        const [d, m, y] = str.split('/');
        return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)).getTime();
      }
      return new Date(str).getTime() || 0;
    };

    const dateMap: Record<string, { sugarSum: number; sbpSum: number; bmiSum: number; pulseSum: number; count: number }> = {};

    records.forEach((r) => {
      const d = r.screenDate || '2026-01-01';
      if (!dateMap[d]) {
        dateMap[d] = { sugarSum: 0, sbpSum: 0, bmiSum: 0, pulseSum: 0, count: 0 };
      }
      dateMap[d].sugarSum += r.bloodSugar;
      dateMap[d].sbpSum += r.sbp;
      dateMap[d].bmiSum += r.bmi;
      dateMap[d].pulseSum += r.pulseBpm;
      dateMap[d].count++;
    });

    const monthNames = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    return Object.entries(dateMap)
      .sort(([a], [b]) => parseDateToMs(a) - parseDateToMs(b))
      .map(([date, data]) => {
        let label = date;
        if (date.includes('/')) {
          const [d, m] = date.split('/');
          const mNum = parseInt(m, 10);
          label = `${parseInt(d, 10)} ${monthNames[mNum] || m}`;
        } else if (date.includes('-')) {
          const parts = date.split('-');
          const m = parseInt(parts[1] || '1', 10);
          const day = parts[2] || '01';
          label = `${parseInt(day, 10)} ${monthNames[m] || ''}`;
        }

        return {
          rawDate: date,
          dateLabel: label,
          avgSugar: parseFloat((data.sugarSum / data.count).toFixed(1)),
          avgSbp: parseFloat((data.sbpSum / data.count).toFixed(1)),
          avgBmi: parseFloat((data.bmiSum / data.count).toFixed(1)),
          avgPulse: parseFloat((data.pulseSum / data.count).toFixed(1)),
          count: data.count,
        };
      });
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Row 1: สองกราฟความสัมพันธ์ (Correlations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter 1: ความสัมพันธ์ระหว่าง BMI กับ น้ำตาล */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">ความสัมพันธ์ระหว่าง BMI กับ ระดับน้ำตาลในเลือด</h3>
                <p className="text-xs text-slate-500">เส้นประแสดงเกณฑ์เตือน 100 (เสี่ยง) และ 126 mg/dL (สงสัยเบาหวาน)</p>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="bmi"
                  name="BMI"
                  domain={[15, 38]}
                  unit=" kg/m²"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="sugar"
                  name="น้ำตาล"
                  domain={[60, 240]}
                  unit=" mg/dL"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />
                <ZAxis range={[50, 50]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-pink-200 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-800">{data.id} ({data.gender}, {data.age} ปี)</p>
                          <p className="text-slate-600">BMI: <strong className="text-pink-600">{data.bmi}</strong> kg/m²</p>
                          <p className="text-slate-600">น้ำตาลในเลือด: <strong className="text-rose-600">{data.sugar}</strong> mg/dL</p>
                          <p className="text-slate-600">ระดับความเสี่ยง: <strong style={{ color: data.color }}>{data.riskLevel}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Guidelines */}
                <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '100 mg/dL (กลุ่มเสี่ยง)', fill: '#D97706', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={126} stroke="#E11D48" strokeDasharray="3 3" label={{ value: '126 mg/dL (สงสัยป่วย)', fill: '#BE123C', fontSize: 10, position: 'insideTopRight' }} />
                <Scatter name="ผู้คัดกรอง" data={scatterBmiSugarData} fill="#EC4899">
                  {scatterBmiSugarData.map((entry, index) => (
                    <Cell key={`sugar-dot-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> เสี่ยงต่ำ</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> เสี่ยงปานกลาง</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> เสี่ยงสูง</span>
          </div>
        </div>

        {/* Scatter 2: ความสัมพันธ์ระหว่าง BMI กับ ความดัน SBP */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">ความสัมพันธ์ระหว่าง BMI กับ ความดันโลหิต SBP</h3>
                <p className="text-xs text-slate-500">เส้นประแสดงเกณฑ์เตือน 120 (เสี่ยง) และ 140 mmHg (สงสัยความดันสูง)</p>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="bmi"
                  name="BMI"
                  domain={[15, 38]}
                  unit=" kg/m²"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="sbp"
                  name="SBP"
                  domain={[90, 190]}
                  unit=" mmHg"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />
                <ZAxis range={[50, 50]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-pink-200 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-800">{data.id} ({data.gender}, {data.age} ปี)</p>
                          <p className="text-slate-600">BMI: <strong className="text-pink-600">{data.bmi}</strong> kg/m²</p>
                          <p className="text-slate-600">ความดัน SBP: <strong className="text-rose-600">{data.sbp}</strong> mmHg</p>
                          <p className="text-slate-600">ระดับความเสี่ยง: <strong style={{ color: data.color }}>{data.riskLevel}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={120} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '120 mmHg (กลุ่มเสี่ยง)', fill: '#D97706', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={140} stroke="#E11D48" strokeDasharray="3 3" label={{ value: '140 mmHg (สงสัยป่วย)', fill: '#BE123C', fontSize: 10, position: 'insideTopRight' }} />
                <Scatter name="ผู้คัดกรอง" data={scatterBmiSbpData} fill="#A855F7">
                  {scatterBmiSbpData.map((entry, index) => (
                    <Cell key={`sbp-dot-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> เสี่ยงต่ำ</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> เสี่ยงปานกลาง</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> เสี่ยงสูง</span>
          </div>
        </div>
      </div>

      {/* Row 2: พฤติกรรมกับระดับความเสี่ยง (Health Behavior vs Risk Level) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">พฤติกรรมกับระดับความเสี่ยงสุขภาพ (Health Behavior)</h3>
              <p className="text-xs text-slate-500">เปรียบเทียบระดับความเสี่ยงแยกตามพฤติกรรมการใช้ชีวิต</p>
            </div>
          </div>

          {/* Behavior Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-pink-50/70 border border-pink-100 self-start sm:self-auto">
            <button
              onClick={() => setSelectedBehavior('exercise')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBehavior === 'exercise'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>การออกกำลังกาย</span>
            </button>

            <button
              onClick={() => setSelectedBehavior('smoking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBehavior === 'smoking'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>การสูบบุหรี่</span>
            </button>

            <button
              onClick={() => setSelectedBehavior('alcohol')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBehavior === 'alcohol'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              <span>การดื่มแอลกอฮอล์</span>
            </button>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={behaviorRiskData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="behavior" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(val: any, name: any) => [`${val} คน`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="เสี่ยงต่ำ" stackId="b" fill="#10B981" />
              <Bar dataKey="เสี่ยงปานกลาง" stackId="b" fill="#F59E0B" />
              <Bar dataKey="เสี่ยงสูง" stackId="b" fill="#E11D48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Behavior Insights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          {behaviorRiskData.map((item) => (
            <div key={item.behavior} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs">{item.behavior}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">รวมผู้ให้ข้อมูล {item.total} คน</p>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xs text-rose-600 font-semibold">อัตราเสี่ยงสูง:</span>
                <span className="text-lg font-black text-rose-600">{item.highRiskRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Health Trend ตามวันที่ตรวจ BMI (Screening Trend) */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-pink-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">แนวโน้มสุขภาพตามวันที่ตรวจ BMI (Health Trend Timeline)</h3>
              <p className="text-xs text-slate-500">ติดตามค่าเฉลี่ยน้ำตาลในเลือด (mg/dL), ความดัน SBP (mmHg), BMI และชีพจร_bpm ในแต่ละช่วงเวลา</p>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dateTrendData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[20, 180]} />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="avgSbp" name="ความดัน SBP เฉลี่ย (mmHg)" stroke="#E11D48" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="avgSugar" name="น้ำตาลเฉลี่ย (mg/dL)" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="avgPulse" name="ชีพจรเฉลี่ย (bpm)" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="avgBmi" name="BMI เฉลี่ย (kg/m²)" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
