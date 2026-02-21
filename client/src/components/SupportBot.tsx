import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Terminal, Cpu, Zap, Radio } from "lucide-react";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  options?: { label: string; action: string }[];
}

export const SupportBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadMetrics, setLoadMetrics] = useState({ cpu: 12, mem: 45, ping: 24 });

  // ASCII ART LOGO
  const forgeAscii = `
   ________  _____  ____________
  / __/ __ \\/ _ \\/ ___/ __/ _ )
 / _// /_/ / , _/ (_ / _// _  |
/_/  \\____/_/|_|\\___/___/____/ 
  `;

  const initialMessages: Message[] = [
    {
      id: "1",
      type: "bot",
      text: `${forgeAscii}\n\n[SYSTEM INITIALIZED]\nACCESS GRANTED. Halo Operator! Saya ForgeBot, asisten virtual FactoryForge. Ada yang bisa saya bantu terkait sistem ini?`,
      options: [
        { label: "🚀 Cara Pakai Dashboard", action: "how_to_use" },
        { label: "📂 Liat Dokumentasi GitHub", action: "github_docs" },
        { label: "🔐 Cek Status Sistem", action: "system_status" },
      ],
    },
  ];

  // METRICS SIMULATION
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadMetrics({
        cpu: Math.floor(Math.random() * (40 - 5) + 5),
        mem: Math.floor(Math.random() * (60 - 40) + 40),
        ping: Math.floor(Math.random() * (50 - 15) + 15),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(initialMessages);
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleAction = (action: string) => {
    let responseText = "";
    let nextOptions: { label: string; action: string }[] = [];

    setIsTyping(true);

    setTimeout(() => {
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
          responseText = "UPLINK_GUIDE: Buat konek hardware, abang butuh file .ino di WiFi firmware. SSID & Password diisi WiFi abang, terus arahin ke `factoryforge.up.railway.app` port 1883.";
          nextOptions = [
            { label: "Liat Repo GitHub", action: "github_docs" },
            { label: "Kembali", action: "start" },
          ];
          break;
        case "github_docs":
          window.open("https://github.com/abyanmaheswara/Industrial-IoT-Dashboard", "_blank");
          responseText = "RETRIEVAL_SUCCESS: Dokumentasi lengkap dan kode firmware sudah dibuka. Pastikan baca README ya bang! 📖";
          nextOptions = [{ label: "Ada lagi?", action: "start" }];
          break;
        case "system_status":
          responseText = "DIAGNOSTICS_RUNNING...\n- Frontend: ONLINE (Vercel)\n- Backend: ONLINE (Railway)\n- Database: ONLINE (PostgreSQL)\n- MQTT Broker: ACTIVE\nStatus: OPTIMAL 🔋";
          nextOptions = [{ label: "Mantap", action: "start" }];
          break;
        case "export_data":
          responseText = "DATA_EXTRACTION: Masuk ke halaman 'Deep Intel', pilih periode data, klik tombol ekspor di pojok kanan atas. Tersedia format PDF, Excel, dan CSV.";
          nextOptions = [{ label: "Oke, paham", action: "start" }];
          break;
        case "start":
          setMessages([...messages, { id: Date.now().toString(), type: "bot", text: "Ada lagi yang mau ditanyain bang?", options: initialMessages[0].options }]);
          setIsTyping(false);
          return;
        default:
          responseText = "ERROR: Command tidak dikenali.";
      }
      setMessages([...messages, { id: Date.now().toString(), type: "bot", text: responseText, options: nextOptions }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Bot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-brand-main rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(180,83,9,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 group relative border-2 border-brand-light/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 scanline-premium opacity-20" />
          <MessageSquare size={24} className="relative z-10 group-hover:animate-float" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-lg border-2 border-industrial-950 animate-pulse shadow-[0_0_10px_#10b981]" />
        </button>
      )}

      {/* Bot Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[550px] bg-industrial-950/98 backdrop-blur-3xl border-2 border-brand-main/40 rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-500">
          {/* Laser Scanner Animation */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-main/50 z-20 animate-scan pointer-events-none shadow-[0_0_15px_#b45309]" />

          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-industrial-900 to-brand-main/30 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 industrial-grid-premium opacity-10 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-industrial-950 border border-brand-main/50 rounded-xl flex items-center justify-center shadow-[inset_0_0_10px_rgba(180,83,9,0.2)]">
                <Terminal size={20} className="text-brand-main animate-pulse" />
              </div>
              <div>
                <h3 className="text-[12px] font-black text-white uppercase tracking-[0.25em]">
                  ForgeBot <span className="text-brand-main/70">X-01</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-brand-main rounded-full animate-pulse shadow-[0_0_8px_#b45309]" />
                  <span className="text-[8px] font-mono text-industrial-400 uppercase tracking-widest">UPLINK_STABLE // ENC_MODE</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-industrial-500 hover:text-white hover:bg-white/5 rounded-xl transition-all relative z-10">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar industrial-grid-premium bg-opacity-5 relative">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[90%] p-4 rounded-2xl text-[10px] sm:text-[11px] leading-relaxed font-mono ${
                    msg.type === "user" ? "bg-brand-main text-white rounded-tr-none shadow-xl border border-white/10" : "bg-industrial-900/80 border border-brand-main/20 text-brand-light rounded-tl-none shadow-inner backdrop-blur-md"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-mono break-words leading-tight">{msg.text}</pre>
                </div>

                {msg.options && !isTyping && (
                  <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(opt.action)}
                        className="px-3 py-2 bg-brand-main/5 hover:bg-brand-main/20 border border-brand-main/30 text-brand-light text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 hover:border-brand-main/60 active:scale-95 bg-industrial-900/40"
                      >
                        <div className="w-1 h-1 bg-brand-main rounded-full" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="bg-industrial-900/40 border border-brand-main/20 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-brand-main rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-brand-main rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-brand-main rounded-full animate-bounce" />
                </div>
                <span className="text-[8px] font-mono text-industrial-600 mt-2 uppercase tracking-tighter">Bot Thinking...</span>
              </div>
            )}
          </div>

          {/* Footer Telemetry */}
          <div className="p-4 bg-industrial-900/80 border-t border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center px-1 mb-3">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <Cpu size={10} className="text-industrial-500" />
                  <span className="text-[8px] font-mono text-industrial-500">CPU:{loadMetrics.cpu}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={10} className="text-industrial-500" />
                  <span className="text-[8px] font-mono text-industrial-500">MEM:{loadMetrics.mem}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Radio size={10} className="text-brand-main" />
                  <span className="text-[8px] font-mono text-brand-main">PING:{loadMetrics.ping}ms</span>
                </div>
              </div>
              <span className="text-[8px] font-mono text-emerald-500/50 uppercase tracking-widest animate-pulse">Kernel_Online</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-industrial-950/80 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3 opacity-40">
                <Terminal size={12} className="text-brand-main" />
                <span className="text-[9px] font-mono text-industrial-600 uppercase tracking-widest animate-pulse">Waiting for directive...</span>
              </div>
            </div>

            {/* PROGRESS BAR DECORATIVE */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
              <div className="h-full bg-brand-main/40 transition-all duration-1000" style={{ width: `${(messages.length / 10) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Scanner Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
};
