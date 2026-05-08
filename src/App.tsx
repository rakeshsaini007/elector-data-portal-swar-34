import { useState, useEffect } from "react";
import { Search, Loader2, Database, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ElectorRecord } from "./types";
import { gasService } from "./services/gasService";
import { RecordCard } from "./components/RecordCard";

export default function App() {
  const [searchEpic, setSearchEpic] = useState("");
  const [record, setRecord] = useState<ElectorRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchEpic.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await gasService.fetchRecord(searchEpic.trim());
      if (res.success && res.data) {
        setRecord(res.data as ElectorRecord);
      } else {
        setRecord(null);
        setError(res.message || "Record not found");
      }
    } catch (err) {
      setError("Failed to connect to the database");
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Polling for real-time updates if a record is displayed
  useEffect(() => {
    if (!record) return;

    const interval = setInterval(async () => {
      try {
        const res = await gasService.fetchRecord(record.epicNumber);
        if (res.success && res.data) {
          const freshData = res.data as ElectorRecord;
          // Only update if something changed (to avoid jitter)
          if (JSON.stringify(freshData) !== JSON.stringify(record)) {
            setRecord(freshData);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [record]);

  return (
    <div id="app-container" className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-black selection:text-white pb-20">
      {/* Header Bar */}
      <header className="border-b-2 border-black p-4 flex justify-between items-center bg-[#E4E3E0]">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-black" />
          <h1 className="text-lg font-bold font-mono tracking-tighter uppercase">Elector Data Portal</h1>
        </div>
        <div className="text-[10px] uppercase font-mono tracking-widest text-black/50">
          Status: Operational / Sheets v1.0
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-12 px-4">
        {/* Search Section */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold font-mono tracking-tighter uppercase mb-2">Search Electorate</h2>
            <p className="text-black/60 font-mono text-sm italic">Enter the unique Epic Number to retrieve comprehensive records</p>
          </motion.div>

          <form id="search-form" onSubmit={handleSearch} className="relative max-w-xl mx-auto group">
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-transform" />
            <div className="relative flex items-stretch border-2 border-black bg-white overflow-hidden">
              <div className="flex items-center px-4 border-r-2 border-black bg-white">
                <Search size={20} className="text-black/40" />
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Ex: SXY2472983"
                value={searchEpic}
                onChange={(e) => setSearchEpic(e.target.value.toUpperCase())}
                className="flex-1 p-4 font-mono text-lg focus:outline-none placeholder:text-black/20"
              />
              <button
                id="search-submit"
                type="submit"
                disabled={isLoading}
                className="bg-black text-[#E4E3E0] px-8 font-mono uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] cursor-pointer"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : "FIND"}
              </button>
            </div>
          </form>
        </div>

        {/* Content Section */}
        <div id="content-display" className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading && !record && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-xs uppercase tracking-widest">Querying Cloud Registry...</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto p-8 border-2 border-red-700 bg-red-50 flex flex-col items-center gap-4 text-center"
              >
                <AlertCircle size={48} className="text-red-700" />
                <div>
                  <h3 className="font-bold font-mono text-lg text-red-700 uppercase">Resource Not Found</h3>
                  <p className="text-sm font-mono text-red-700/70">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-[10px] font-mono border border-red-700 px-4 py-1 uppercase tracking-wider hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {record && (
              <RecordCard 
                key={`${record.epicNumber}-${record.mobileNumber}`} 
                record={record} 
                onUpdate={(updated) => setRecord(updated)}
              />
            )}

            {!record && !isLoading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 opacity-20 filter grayscale"
              >
                <Database size={64} className="mx-auto mb-4" />
                <p className="font-mono text-xs uppercase tracking-[0.3em]">IDLE / Waiting for Input</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 font-mono text-[9px] uppercase tracking-widest opacity-30 pointer-events-none text-center">
        Elector Management System // AI Studio Deployment // {new Date().getFullYear()}
      </footer>
    </div>
  );
}
