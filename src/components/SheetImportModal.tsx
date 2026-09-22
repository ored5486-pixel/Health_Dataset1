import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { DEFAULT_SHEET_ID } from '../data/mockHealthData';
import { parseUploadedCSV } from '../services/sheetService';
import { HealthRecord } from '../types';

interface SheetImportModalProps {
  currentSheetId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplySheetId: (newSheetId: string) => void;
  onImportRecords: (records: HealthRecord[]) => void;
  onResetToDefault: () => void;
}

export const SheetImportModal: React.FC<SheetImportModalProps> = ({
  currentSheetId,
  isOpen,
  onClose,
  onApplySheetId,
  onImportRecords,
  onResetToDefault,
}) => {
  const [sheetInput, setSheetInput] = useState(currentSheetId);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const records = parseUploadedCSV(content);
          if (records.length > 0) {
            onImportRecords(records);
            setImportStatus(`นำเข้าข้อมูลสำเร็จ ${records.length} รายการ`);
            setTimeout(() => {
              onClose();
              setImportStatus(null);
            }, 1000);
          } else {
            setImportStatus('ไม่พบแถวข้อมูลในไฟล์ CSV ที่ถูกต้อง');
          }
        } catch (err) {
          setImportStatus('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV');
        }
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ตั้งค่าและเชื่อมต่อ Google Sheet</h2>
              <p className="text-xs text-pink-100">เชื่อมโยงข้อมูลชีตสุขภาพ หรือนำเข้าไฟล์ CSV</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Section 1: Sheet ID */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Google Sheet ID หรือ URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="กรอก Google Sheet ID หรือแชร์ลิงก์..."
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800"
              />
              <button
                onClick={() => {
                  let cleaned = sheetInput.trim();
                  // Extract sheet ID if full URL was pasted
                  const match = cleaned.match(/\/d\/([a-zA-Z0-9-_]+)/);
                  if (match && match[1]) {
                    cleaned = match[1];
                  }
                  onApplySheetId(cleaned);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                บันทึก & ซิงค์
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              ค่าเริ่มต้นตามโจทย์: <code className="text-pink-600 font-mono font-semibold">{DEFAULT_SHEET_ID}</code>
            </p>
          </div>

          {/* Section 2: CSV Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              หรือ นำเข้าไฟล์ CSV โดยตรง
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-pink-500 bg-pink-50/50'
                  : 'border-slate-200 hover:border-pink-300 bg-slate-50/50'
              }`}
            >
              <Upload className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                ลากไฟล์ CSV มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                รองรับไฟล์ CSV ที่ส่งออกจาก Google Sheets หรือระบบคัดกรอง NCDs
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-white border border-pink-200 text-pink-700 text-xs font-semibold hover:bg-pink-50 shadow-sm cursor-pointer"
              >
                เลือกไฟล์จากเครื่อง
              </label>
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-xs text-pink-700 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          {/* Reset to Default */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onResetToDefault();
                setSheetInput(DEFAULT_SHEET_ID);
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ตกลับเป็นชุดข้อมูลมาตรฐาน</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
