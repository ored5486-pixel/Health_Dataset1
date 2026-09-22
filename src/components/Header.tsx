import React from 'react';
import { Activity, RefreshCw, FileSpreadsheet, User, Clock, CheckCircle2, Upload, Sparkles } from 'lucide-react';

interface HeaderProps {
  sheetId: string;
  source: 'google_sheet' | 'local_verified';
  timestamp: string;
  totalRecords: number;
  filteredCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetId,
  source,
  timestamp,
  totalRecords,
  filteredCount,
  isLoading,
  onRefresh,
  onOpenImport,
}) => {
  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-xl shadow-pink-500/15 mb-6">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-rose-400/20 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Title and Descriptions */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-pink-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>ระบบสารสนเทศสุขภาพชุมชนและการคัดกรอง NCDs</span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner inline-flex">
              <Activity className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </span>
            รายงานการคัดกรองสุขภาพ
          </h1>

          <p className="text-sm md:text-base text-pink-100 font-normal leading-relaxed">
            ผลรายงานการคัดกรองสุขภาพของบุคคลแต่ละพื้นที่ เพื่อประเมินความเสี่ยงโรคไม่ติดต่อเรื้อรัง (NCDs) เบาหวาน และความดันโลหิตสูง
          </p>

          {/* Metadata badges: Author & Last update */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs md:text-sm text-pink-50">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/15 backdrop-blur-sm border border-white/10">
              <User className="w-4 h-4 text-pink-300" />
              <span>ผู้จัดทำ: <strong className="font-semibold text-white">นางสาวณัฐธิดา อินทร</strong></span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/15 backdrop-blur-sm border border-white/10">
              <Clock className="w-4 h-4 text-pink-300" />
              <span>อัปเดตข้อมูลล่าสุด: <span className="font-medium text-white">{timestamp}</span></span>
            </div>
          </div>
        </div>

        {/* Action Controls & Sheet Connection Indicator */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          {/* Sheet ID Badge */}
          <div className="w-full sm:w-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-xs text-white">
            <FileSpreadsheet className="w-4 h-4 text-pink-200 shrink-0" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">Google Sheet ID:</span>
                <span className="font-mono text-pink-100 truncate max-w-[130px] sm:max-w-[160px]">{sheetId}</span>
              </div>
              <span className="text-[11px] text-pink-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                {source === 'google_sheet' ? 'เชื่อมต่อ Google Sheet สด' : 'เชื่อมต่อฐานข้อมูลตามรหัสชีตแล้ว'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-pink-600 hover:bg-pink-50 active:scale-95 transition-all text-xs md:text-sm font-semibold shadow-md shadow-pink-900/20 disabled:opacity-60 cursor-pointer"
              title="ซิงค์ข้อมูลใหม่"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังซิงค์...' : 'รีเฟรชข้อมูล'}</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-900/30 hover:bg-pink-900/40 text-white border border-white/20 active:scale-95 transition-all text-xs md:text-sm font-medium backdrop-blur-sm cursor-pointer"
              title="นำเข้าไฟล์ CSV หรือเปลี่ยน Sheet ID"
            >
              <Upload className="w-4 h-4 text-pink-200" />
              <span>นำเข้า CSV / ตั้งค่า</span>
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-pink-200/90 self-start lg:self-end">
            แสดงข้อมูล <span className="font-bold text-white">{filteredCount}</span> จากทั้งหมด <span className="font-bold text-white">{totalRecords}</span> รายการ
          </div>
        </div>
      </div>
    </header>
  );
};
