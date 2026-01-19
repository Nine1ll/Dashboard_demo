import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dashboard from "./Dashboard";
import Chatbot from "./Chatbot";
import { useApi } from "./api";

const DeepDiveReport = ({ report, onClose }) => (
  <motion.section
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="overflow-hidden"
  >
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Generated Deep Dive Report
          </h2>
          <p className="text-xs text-slate-500">
            Auto-generated insights pulled from the context database.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600"
        >
          Collapse report
        </button>
      </div>
      <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-slate-700">
        {report}
      </div>
    </div>
  </motion.section>
);

const App = () => {
  const api = useApi();
  const [activeCommodity, setActiveCommodity] = useState("corn");
  const [showReport, setShowReport] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [reportMode, setReportMode] = useState("Short-term (LSTM)");

  const handleGenerateReport = async (mode = reportMode) => {
    const response = await api.generateReport({
      commodity: activeCommodity,
      mode,
    });
    setReportMode(mode);
    setReportContent(response.data.report);
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Commodity Futures Forecasting Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Agricultural Markets Intelligence
            </h1>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
            Live simulation • FastAPI mock
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
          <Dashboard
            activeCommodity={activeCommodity}
            onCommodityChange={setActiveCommodity}
            onGenerateReport={handleGenerateReport}
          />
          <Chatbot
            activeCommodity={activeCommodity}
            onGenerateReport={handleGenerateReport}
          />
        </div>

        <AnimatePresence>
          {showReport && (
            <DeepDiveReport
              report={reportContent}
              onClose={() => setShowReport(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
