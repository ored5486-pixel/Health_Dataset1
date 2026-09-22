export type RiskLevel = 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'เสี่ยงต่ำ' | 'เสี่ยงปานกลาง' | 'เสี่ยงสูง';
export type Gender = 'ชาย' | 'หญิง';
export type ScreeningStatus = 'ไม่มี' | 'มีแนวโน้ม/เสี่ยง' | 'ปกติ' | 'กลุ่มเสี่ยง' | 'สงสัยป่วย' | 'ป่วย';
export type ExerciseLevel = 'สม่ำเสมอ' | 'บางครั้ง' | 'นานๆ ครั้ง' | 'ไม่ออกกำลังกาย';
export type SmokingStatus = 'ไม่สูบ' | 'สูบ' | 'เคยสูบ (เลิกแล้ว)' | 'สูบเป็นประจำ';
export type AlcoholStatus = 'ไม่ดื่ม' | 'ดื่ม' | 'ดื่มเป็นครั้งคราว' | 'ดื่มเป็นประจำ';

export interface HealthRecord {
  id: string; // รหัสบุคคล H0001 - H0030
  screenDate: string; // วันที่คัดกรอง e.g. 3/1/2026
  area: string; // พื้นที่ เมือง, เหนือ, ตะวันออก, ตะวันตก, ใต้
  gender: Gender; // เพศ
  age: number; // อายุ
  heightCm: number; // ส่วนสูง_cm
  weightKg: number; // น้ำหนัก_kg
  bmi: number; // BMI
  sbp: number; // SBP_mmHg
  dbp: number; // DBP_mmHg
  pulseBpm: number; // ชีพจร_bpm
  bloodSugar: number; // น้ำตาล_mg_dL
  smoking: SmokingStatus; // สูบบุหรี่
  alcohol: AlcoholStatus; // ดื่มแอลกอฮอล์
  exercise: ExerciseLevel; // การออกกำลังกาย
  diabetesScreening: ScreeningStatus; // เบาหวาน_คัดกรอง
  htScreening: ScreeningStatus; // ความดันโลหิตสูง_คัดกรอง
  riskScore: number; // คะแนนความเสี่ยง
  riskLevel: RiskLevel; // ระดับความเสี่ยง
  month?: string; // เดือน e.g. 2026-01
  notes?: string;
}

export interface FilterState {
  area: string;
  ageGroup: string;
  gender: string;
  riskLevel: string;
  searchQuery: string;
}

export interface KPIData {
  totalCount: number;
  avgBloodSugar: number;
  avgRiskScore: number;
  minSbp: number;
  maxSbp: number;
  avgSbp: number;
  highRiskCount: number;
  highRiskPercentage: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  highSugarCount: number;
  highBpCount: number;
}
