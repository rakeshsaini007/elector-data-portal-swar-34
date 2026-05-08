import { useState } from "react";
import { ElectorRecord } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Save, Phone, User, Calendar, MapPin, Hash, UserCircle, AlertCircle } from "lucide-react";
import { gasService } from "../services/gasService";

interface RecordCardProps {
  record: ElectorRecord;
  onUpdate: (updatedRecord: ElectorRecord) => void;
}

export function RecordCard({ record, onUpdate }: RecordCardProps) {
  const [mobileNumber, setMobileNumber] = useState(record.mobileNumber);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setMessage(null);
    try {
      const res = await gasService.updateMobileNumber(record.epicNumber, mobileNumber);
      if (res.success) {
        setMessage({ text: "✓ RECORD UPDATED SUCCESSFULLY", type: "success" });
        onUpdate({ ...record, mobileNumber });
        // Optional: clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ text: "✗ UPDATE FAILED: " + (res.message || "Unknown Error"), type: "error" });
      }
    } catch (err) {
      setMessage({ text: "✗ NETWORK ERROR: Service UNREACHABLE", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const Field = ({ label, value, icon: Icon, isHindi = false }: { label: string; value: string; icon: any; isHindi?: boolean }) => (
    <div id={`field-${label.toLowerCase().replace(/\s/g, '-')}`} className="border-b border-[#1414141a] py-3 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-black/50 font-mono">
        <Icon size={12} />
        {label}
      </div>
      <div className={`text-sm font-medium ${isHindi ? 'font-sans' : 'font-mono'}`}>
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex items-center gap-3 font-mono text-sm font-bold uppercase tracking-tighter ${
              message.type === "success" ? "bg-green-400" : "bg-red-400"
            }`}
          >
            {message.type === "success" ? <Save size={18} /> : <AlertCircle size={18} />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-4 hover:opacity-50 cursor-pointer">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        id={`record-card-${record.epicNumber}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#E4E3E0] border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] max-w-2xl mx-auto"
    >
      <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tighter uppercase">Elector Detail</h2>
          <p className="text-xs font-mono text-black/60 italic">Record for {record.epicNumber}</p>
        </div>
        <div className="bg-black text-[#E4E3E0] px-3 py-1 text-xs font-mono">
          REF: {record.serialNo}/{record.partNo}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <Field label="Elector Name" value={record.electorName} icon={User} />
        <Field label="नाम (हिंदी)" value={record.electorNameHindi} icon={User} isHindi />
        
        <Field label="Relative Name" value={record.relativeName} icon={UserCircle} />
        <Field label="पिता/पति का नाम" value={record.relativeNameHindi} icon={UserCircle} isHindi />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Gender" value={record.electorGender} icon={User} />
          <Field label="Age" value={record.age} icon={Calendar} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="AC Number" value={record.acNo} icon={MapPin} />
          <Field label="Part Number" value={record.partNo} icon={Hash} />
        </div>
        <Field label="Relative Type" value={record.relativeType} icon={UserCircle} />
      </div>

      <div className="mt-8 pt-6 border-t-2 border-black">
        <label className="block text-[10px] uppercase tracking-wider text-black/50 font-mono mb-2">
          Mobile Number (Editable)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={16} />
            <input
              id="mobile-input"
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full bg-white border border-black p-3 pl-10 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter mobile number"
            />
          </div>
          <button
            id="save-button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-black text-[#E4E3E0] px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? "Saving..." : <><Save size={16} /> Save</>}
          </button>
        </div>
        {/* Message removed from here as it is now a floating alert */}
      </div>
    </motion.div>
  </div>
);
}
