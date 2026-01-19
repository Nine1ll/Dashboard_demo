import { useState } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import { useApi } from "./api";

const suggestedQueries = [
  "What is driving corn volatility?",
  "Summarize supply risks for wheat",
  "Generate a detailed report",
];

const Chatbot = ({ onGenerateReport, activeCommodity }) => {
  const api = useApi();
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "I can break down futures signals, model drivers, and risk scenarios for you.",
      reference: "Reference: 2021.03.12 Case",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (message) => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setSending(true);

    const response = await api.sendChat({ message, commodity: activeCommodity });
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: response.data.reply, reference: response.data.reference },
    ]);
    setSending(false);

    if (message.toLowerCase().includes("report")) {
      await onGenerateReport();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">AI Market Analyst</h3>
          <p className="text-xs text-slate-500">Context-aware futures assistant</p>
        </div>
        <Sparkles className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed shadow-sm ${
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            <p>{message.text}</p>
            {message.reference && (
              <p className="mt-2 text-[10px] text-slate-400">
                {message.reference}
              </p>
            )}
          </div>
        ))}
        {sending && (
          <div className="w-fit rounded-2xl bg-white px-4 py-2 text-xs text-slate-400">
            Analyst is typing...
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedQueries.map((query) => (
          <button
            key={query}
            type="button"
            onClick={() => handleSend(query)}
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
          >
            {query}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about a commodity..."
          className="flex-1 text-xs text-slate-700 outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-blue-600 p-2 text-white"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
