import React from 'react';
import { HealthRecord } from '../types';
import { X, Heart, Droplets, Activity, User, MapPin, Calendar, ShieldAlert, Dumbbell, Wine, Flame, FileText } from 'lucide-react';

interface PatientDetailModalProps {
  record: HealthRecord | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const isHighRisk = record.riskLevel === 'เสี่ยงสูง' || record.riskLevel === 'สูง';
  const isModerateRisk = record.riskLevel === 'เสี่ยงปานกลาง' || record.riskLevel === 'ปานกลาง';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Pink Gradient */}
        <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl">
              {record.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">ข้อมูลการคัดกรองสุขภาพรายบุคคล</h2>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    isHighRisk
                      ? 'bg-rose-900/40 text-rose-100 border border-rose-300/40'
                      : isModerateRisk
                      ? 'bg-amber-900/40 text-amber-100 border border-amber-300/40'
                      : 'bg-emerald-900/40 text-emerald-100 border border-emerald-300/40'
                  }`}
                >
                  {isHighRisk ? 'เสี่ยงสูง' : isModerateRisk ? 'เสี่ยงปานกลาง' : 'เสี่ยงต่ำ'}
                </span>
              </div>
              <p className="text-xs text-pink-100 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> พื้นที่: {record.area}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> วันที่คัดกรอง: {record.screenDate}</span>
                {record.month && <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px]">เดือน: {record.month}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Basic Demographic */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">เพศ</span>
              <p className="text-sm font-bold text-slate-800">{record.gender}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">อายุ</span>
              <p className="text-sm font-bold text-slate-800">{record.age} ปี</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">ส่วนสูง / น้ำหนัก</span>
              <p className="text-sm font-bold text-slate-800">{record.heightCm} ซม. / {record.weightKg} กก.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">ดัชนีมวลกาย (BMI)</span>
              <p className={`text-sm font-bold ${record.bmi >= 25 ? 'text-rose-600' : record.bmi >= 23 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {record.bmi} kg/m²
              </p>
            </div>
          </div>

          {/* Clinical Vital Signs & Risk Metrics */}
          <div className="rounded-2xl p-4 border border-pink-100 bg-pink-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-pink-600" />
                <span>ผลตรวจคัดกรองสัญญาณชีพและชีวเคมี (Conditional Formatting)</span>
              </h3>
              <span className="text-[11px] text-slate-500">เกณฑ์สี: 🔴 แดงสูงเกินเกณฑ์ | 🟡 เหลืองเฝ้าระวัง | 🟢 เขียวปกติ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Blood Sugar */}
              <div className={`p-4 rounded-xl border ${record.bloodSugar >= 126 ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200' : record.bloodSugar >= 100 ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200' : 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'}`}>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">น้ำตาลในเลือด (FBS)</span>
                  <Droplets className={`w-4 h-4 ${record.bloodSugar >= 126 ? 'text-rose-600' : record.bloodSugar >= 100 ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${record.bloodSugar >= 126 ? 'text-rose-700' : record.bloodSugar >= 100 ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {record.bloodSugar}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">mg/dL</span>
                </div>
                <div className="mt-2 space-y-1">
                  {record.bloodSugar >= 126 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-200/90 text-rose-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                      สูงเกินเกณฑ์ (≥ 126 mg/dL)
                    </span>
                  ) : record.bloodSugar >= 100 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-200/80 text-amber-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      เฝ้าระวัง / เสี่ยง (100-125)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-200/70 text-emerald-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      เกณฑ์ปกติ (&lt; 100 mg/dL)
                    </span>
                  )}
                  <p className="text-[11px] text-slate-600">
                    ผลคัดกรอง: <strong className="text-slate-800">{record.diabetesScreening}</strong>
                  </p>
                </div>
              </div>

              {/* Blood Pressure SBP/DBP */}
              <div className={`p-4 rounded-xl border ${record.sbp >= 140 || record.dbp >= 90 ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200' : record.sbp >= 120 || record.dbp >= 80 ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200' : 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'}`}>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">ความดันโลหิต (SBP/DBP)</span>
                  <Heart className={`w-4 h-4 ${record.sbp >= 140 || record.dbp >= 90 ? 'text-rose-600' : record.sbp >= 120 || record.dbp >= 80 ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${record.sbp >= 140 || record.dbp >= 90 ? 'text-rose-700' : record.sbp >= 120 || record.dbp >= 80 ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {record.sbp} / {record.dbp}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">mmHg</span>
                </div>
                <div className="mt-2 space-y-1">
                  {record.sbp >= 140 || record.dbp >= 90 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-200/90 text-rose-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                      สูงเกินเกณฑ์ (≥ 140/90)
                    </span>
                  ) : record.sbp >= 120 || record.dbp >= 80 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-200/80 text-amber-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      เฝ้าระวัง / เสี่ยง (120-139/80-89)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-200/70 text-emerald-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      เกณฑ์ปกติ (&lt; 120/&lt; 80)
                    </span>
                  )}
                  <p className="text-[11px] text-slate-600">
                    ผลคัดกรอง: <strong className="text-slate-800">{record.htScreening}</strong>
                  </p>
                </div>
              </div>

              {/* Risk Score */}
              <div className={`p-4 rounded-xl border ${isHighRisk ? 'bg-rose-50/50 border-rose-300' : isModerateRisk ? 'bg-amber-50/50 border-amber-300' : 'bg-emerald-50/50 border-emerald-300'}`}>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">คะแนนความเสี่ยง NCDs</span>
                  <ShieldAlert className={`w-4 h-4 ${isHighRisk ? 'text-rose-600' : isModerateRisk ? 'text-amber-600' : 'text-emerald-600'}`} />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${isHighRisk ? 'text-rose-700' : isModerateRisk ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {record.riskScore}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ 15 คะแนน</span>
                </div>
                <div className="mt-2 space-y-1">
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isHighRisk
                      ? 'bg-rose-200 text-rose-800'
                      : isModerateRisk
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {record.riskLevel}
                  </span>
                  <p className="text-[11px] text-slate-600">
                    อัตราชีพจร: <strong className="text-slate-800">{record.pulseBpm} bpm</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lifestyle Behaviors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              พฤติกรรมสุขภาพ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">การออกกำลังกาย</span>
                  <p className="text-xs font-bold text-slate-800">{record.exercise}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">การสูบบุหรี่</span>
                  <p className="text-xs font-bold text-slate-800">{record.smoking}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Wine className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">การดื่มแอลกอฮอล์</span>
                  <p className="text-xs font-bold text-slate-800">{record.alcohol}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Advice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
            <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">คำแนะนำการดูแลสุขภาพเบื้องต้น:</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {isHighRisk
                  ? 'ควรส่งต่อพบแพทย์เพื่อตรวจยืนยันโรคเบาหวานและความดันโลหิตสูง ควบคุมอาหารหวานมันเค็มอย่างเคร่งครัด และงดสูบบุหรี่/แอลกอฮอล์'
                  : isModerateRisk
                  ? 'ปรับเปลี่ยนพฤติกรรม ออกกำลังกายอย่างน้อย 150 นาที/สัปดาห์ ลดอาหารเค็มและหวาน นัดตรวจซ้ำในอีก 3-6 เดือน'
                  : 'สุขภาพอยู่ในเกณฑ์ดี ควรรักษาน้ำหนักตัวมาตรฐาน ออกกำลังกายสม่ำเสมอ และตรวจคัดกรองประจำปี'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-medium text-xs shadow-sm cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
