import React, { useState, useEffect } from "react";
import { X, Trash2, Zap } from "lucide-react";
import { Lead } from "../../types/lead"; // ✅ ייבוא מהקובץ המשותף

interface PhoneCleanupModalProps {
  leads: Lead[];
  onClose: () => void;
  onCleanup: (cleanedLeads: Lead[]) => void; // ✅ תואם ל-LeadsPage
}

const PhoneCleanupModal: React.FC<PhoneCleanupModalProps> = ({ leads, onClose, onCleanup }) => {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [cleanupResults, setCleanupResults] = useState<{
    valid: Lead[];
    invalid: Lead[];
    duplicates: Lead[];
    empty: Lead[];
  } | null>(null);

  /** 🔎 ניתוח טלפונים */
  const analyzePhones = () => {
    const valid: Lead[] = [];
    const invalid: Lead[] = [];
    const duplicates: Lead[] = [];
    const empty: Lead[] = [];
    const phoneMap = new Map<string, Lead[]>();

    leads.forEach((lead) => {
      if (!lead.phone || lead.phone.trim() === "") {
        empty.push(lead);
        return;
      }

      const cleanPhone = lead.phone.replace(/[^\d]/g, "");
      const isValid =
        (cleanPhone.startsWith("972") && cleanPhone.length === 12) ||
        (cleanPhone.startsWith("05") && cleanPhone.length === 10) ||
        (cleanPhone.startsWith("0") &&
          cleanPhone.length === 9 &&
          ["02", "03", "04", "08", "09"].some((prefix) => cleanPhone.startsWith(prefix)));

      if (isValid) {
        if (phoneMap.has(cleanPhone)) {
          phoneMap.get(cleanPhone)!.push(lead);
          if (!duplicates.some((d) => d.phone === lead.phone)) {
            duplicates.push(...phoneMap.get(cleanPhone)!);
          }
        } else {
          phoneMap.set(cleanPhone, [lead]);
          valid.push(lead);
        }
      } else {
        invalid.push(lead);
      }
    });

    setCleanupResults({ valid, invalid, duplicates, empty });
  };

  /** 📱 עיצוב מספר טלפון */
  const formatPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    if (cleanPhone.startsWith("972")) {
      const local = cleanPhone.substring(3);
      return local.startsWith("5")
        ? `0${local.substring(0, 2)}-${local.substring(2)}`
        : `0${local.substring(0, 1)}-${local.substring(1)}`;
    } else if (cleanPhone.startsWith("05")) {
      return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3)}`;
    } else if (cleanPhone.startsWith("0")) {
      return `${cleanPhone.substring(0, 2)}-${cleanPhone.substring(2)}`;
    }
    return phone;
  };

  /** ✅ בחירה מרובה */
  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  /** 🗑️ מחיקה */
  const handleDeleteSelected = () => {
    if (selectedLeads.size === 0) return alert("❌ בחר לידים למחיקה");
    if (!confirm(`למחוק ${selectedLeads.size} לידים?`)) return;

    const updated = leads.filter((l) => !selectedLeads.has(l.id));
    onCleanup(updated);
    setSelectedLeads(new Set());
    analyzePhones();
    alert(`✅ נמחקו ${selectedLeads.size} לידים`);
  };

  /** 🎨 עיצוב */
  const handleFormatSelected = () => {
    if (selectedLeads.size === 0) return alert("❌ בחר לידים לעיצוב");

    const updated = leads.map((l) =>
      selectedLeads.has(l.id) ? { ...l, phone: formatPhone(l.phone ?? "") } : l
    );

    onCleanup(updated);
    setSelectedLeads(new Set());
    setTimeout(() => analyzePhones(), 100);
    alert(`✅ עוצבו ${selectedLeads.size} מספרי טלפון`);
  };

  useEffect(() => {
    analyzePhones();
  }, [leads]);

  if (!cleanupResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 text-center border border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">מנתח מספרי טלפון...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">📱 ניקוי מספרי טלפון</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        {selectedLeads.size > 0 && (
          <div className="bg-slate-700/50 rounded-lg p-4 m-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center">
                <Trash2 className="h-4 w-4 mr-2" /> מחק נבחרים
              </button>
              <button onClick={handleFormatSelected} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                <Zap className="h-4 w-4 mr-2" /> עצב טלפונים
              </button>
              <span className="text-slate-300">נבחרו {selectedLeads.size}</span>
            </div>
          </div>
        )}

        {/* Lists */}
        <div className="p-6 space-y-6">
          {cleanupResults.invalid.length > 0 && (
            <CategoryBlock title="לא תקינים" color="text-red-400" border="border-red-500/30" leads={cleanupResults.invalid} toggleSelect={toggleSelect} selected={selectedLeads} />
          )}
          {cleanupResults.duplicates.length > 0 && (
            <CategoryBlock title="כפולים" color="text-orange-400" border="border-orange-500/30" leads={cleanupResults.duplicates} toggleSelect={toggleSelect} selected={selectedLeads} />
          )}
          {cleanupResults.empty.length > 0 && (
            <CategoryBlock title="ריקים" color="text-gray-400" border="border-gray-500/30" leads={cleanupResults.empty} toggleSelect={toggleSelect} selected={selectedLeads} />
          )}
        </div>
      </div>
    </div>
  );
};

/** 🔧 בלוק קטגוריה לשימוש חוזר */
function CategoryBlock({ title, color, border, leads, toggleSelect, selected }: any) {
  return (
    <div className={`bg-slate-700/30 rounded-lg p-4 border ${border}`}>
      <h3 className={`text-lg font-semibold ${color} mb-2 text-right`}>
        {title} ({leads.length})
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {leads.map((lead: Lead) => (
          <div key={lead.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
            <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
            <div className="text-right">
              <div className="text-white text-sm">{lead.business_name}</div>
              <div className={`${color} text-xs`}>{lead.phone || "אין טלפון"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhoneCleanupModal;
