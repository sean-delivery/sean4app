// src/types/lead.ts
export interface Lead {
  id: string;               // מזהה ייחודי
  business_name?: string;   // שם העסק
  phone?: string;           // מספר טלפון
  email?: string;           // מייל
  address?: string;         // כתובת
  category?: string;        // קטגוריה
  status?: string;          // סטטוס (חדש, בטיפול, נסגר)
  notes?: string;           // הערות
  callSchedule?: string;    // תזמון שיחה
}
