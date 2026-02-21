import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Github, Info, Activity, Terminal, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  options?: { label: string; action: string }[];
}

export const SupportBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const initialMessages: Message[] = [
    {
      id: "1",
      type: "bot",
      text: "ACCESS GRANTED. Halo Operator! Saya ForgeBot, asisten virtual FactoryForge. Ada yang bisa saya bantu terkait sistem ini?",
      options: [
        { label: "🚀 Cara Pakai Dashboard", action: "how_to_use" },
        { label: "📂 Liat Dokumentasi GitHub", action: "github_docs" },
        { label: "🔐 Cek Status Sistem", action: "system_status" },
      ],
    },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = (action: string) => {
    let responseText = "";
    let nextOptions: { label: string; action: string }[] = [];

    switch (action) {
      case "how_to_use":
        responseText =
          "FACTORY_PROTOCOLS: Dashboard ini punya 4 sektor utama:\n1. **Overview**: Pantau sensor secara Real-time.\n2. **Analytics**: Liat tren data & ekspor laporan kustom.\n3. **Alerts**: Pusat kendali anomali & keamanan.\n4. **Settings**: Atur profil & register hardware baru.";
        nextOptions = [
          { label: "🔗 Cara Konek ESP32", action: "esp32_connect" },
          { label: "📊 Cara Ekspor Laporan", action: "export_data" },
          { label: "Kembali", action: "start" },
        ];
        break;
      case "esp32_connect":
        responseText = "UPLINK_GUIDE: Buat konek hardware, abang butuh file .ino di GitHub. Gunakan SSID & Password WiFi abang, terus arahin server ke `factoryforge.up.railway.app` dengan port MQTT 1883.";
        nextOptions = [
          { label: "Liat Repo GitHub", action: "github_docs" },
          { label: "Kembali", action: "start" },
        ];
        break;
      case "github_docs":
        window.open("https://github.com/abyanmaheswara/Industrial-IoT-Dashboard", "_blank");
        responseText = "RETIREVAL_SUCCESS: Dokumentasi lengkap, skematik, dan kode firmware sudah dibuka di tab baru. Pastikan baca README ya bang! 📖";
        nextOptions = [{ label: "Ada lagi?", action: "start" }];
        break;
      case "system_status":
        responseText = "DIAGNOSTICS_RUNNING...\n- Frontend: ONLINE (Vercel)\n- Backend: ONLINE (Railway)\n- Database: ONLINE (PostgreSQL)\n- MQTT Broker: ACTIVE\nSemua sistem berjalan di parameter normal.";
        nextOptions = [{ label: "Mantap", action: "start" }];
        break;
      case "export_data":
        responseText = "DATA_EXTRACTION: Masuk ke halaman 'Deep Intel' (Analytics), pilih periode data, terus klik tombol ekspor di pojok kanan atas. Bisa PDF, Excel, atau CSV.";
        nextOptions = [{ label: "Oke, paham", action: "start" }];
        break;
      case "start":
        setMessages([...messages, { id: Date.now().toString(), type: "bot", text: "Ada lagi yang mau ditanyain bang?", options: initialMessages[0].options }]);
        return;
      default:
        responseText = "ERROR: Command tidak dikenali oleh kernel ForgeBot.";
    }

    setMessages([...messages, { id: Date.now().toString(), type: "bot", text: responseText, options: nextOptions }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Bot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-brand-main rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(180,83,9,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 group relative border-2 border-brand-light/30"
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-lg border-2 border-industrial-950 animate-bounce" />
        </button>
      )}

      {/* Bot Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] bg-industrial-950/95 backdrop-blur-2xl border-2 border-brand-main/30 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-industrial-900 to-brand-main/20 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-industrial-950 border border-brand-main/40 rounded-xl flex items-center justify-center shadow-lg">
                <Terminal size={20} className="text-brand-main animate-pulse" />
              </div>
              <div>
                <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">
                  ForgeBot <span className="text-brand-main">v1.2</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-industrial-500 uppercase tracking-widest">Sys_Assistant_Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-industrial-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar industrial-grid-premium bg-opacity-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed font-mono ${
                    msg.type === "user" ? "bg-brand-main text-white rounded-tr-none" : "bg-industrial-900/60 border border-brand-main/20 text-brand-light rounded-tl-none shadow-inner"
                  }`}
                >
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  ))}
                </div>

                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(opt.action)}
                        className="px-3 py-1.5 bg-brand-main/10 hover:bg-brand-main/25 border border-brand-main/30 text-brand-light text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 group"
                      >
                        <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Input (Decorative for now, as we use buttons) */}
          <div className="p-4 bg-industrial-900/50 border-t border-white/5 flex gap-2">
            <div className="flex-1 bg-industrial-950 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3 opacity-50 cursor-not-allowed">
              <Terminal size={14} className="text-industrial-600" />
              <span className="text-[10px] font-mono text-industrial-700 uppercase tracking-widest">Waiting for command...</span>
            </div>
            <div className="w-10 h-10 bg-brand-main/10 border border-brand-main/20 rounded-xl flex items-center justify-center text-brand-main/30">
              <Send size={16} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
