import React from "react";
import { User, Mail, Shield, Camera, Trash2, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const ProfileSection: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [fullName, setFullName] = React.useState(user?.full_name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user?.username) {
      const savedAvatar = localStorage.getItem(`avatar_${user.username}`);
      if (savedAvatar) setAvatar(savedAvatar);
    }
  }, [user]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Batasan Keamanan: Ukuran file melebihi batas 10.0MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Incompatible File Format");
      return;
    }

    setIsUploading(true);
    try {
      const compressedImage = await compressImage(file);
      setAvatar(compressedImage);
      if (user?.username) {
        localStorage.setItem(`avatar_${user.username}`, compressedImage);
        window.dispatchEvent(new Event("avatarUpdate"));
      }
    } catch (error) {
      console.error("Core Image Processing Failure:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = () => {
    if (confirm("Verify Deletion: Permanently remove personnel identification image?")) {
      setAvatar(null);
      if (user?.username) {
        localStorage.removeItem(`avatar_${user.username}`);
        window.dispatchEvent(new Event("avatarUpdate"));
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
        }),
      });

      if (!response.ok) throw new Error("Synchronization Failure");

      const data = await response.json();
      updateUser(data.user);
      setMessage({ type: "success", text: "Identity Protocol Updated" });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: "error", text: "Core Data Sync Failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-8 bg-white/[0.01] border-white/5 relative overflow-hidden group">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className={`relative group/avatar ${user?.role === "viewer" ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={user?.role === "viewer" ? undefined : triggerFileInput}>
            <div className="w-28 h-28 rounded-2xl bg-industrial-950 border border-white/10 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover/avatar:border-brand-main/40 shadow-2xl relative">
              {isUploading ? (
                <Loader className="animate-spin text-brand-main" size={32} />
              ) : avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
              ) : (
                <div className="text-4xl font-black text-industrial-800 uppercase tracking-tighter">{user?.username?.charAt(0) || "U"}</div>
              )}
              {user?.role !== "viewer" && (
                <div className="absolute inset-0 bg-brand-main/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Camera className="text-white" size={24} />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
          </div>
          {avatar && !isUploading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAvatar();
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 size={12} />
              Purge ID
            </button>
          )}
        </div>

        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">Personnel Identification</h3>
              <p className="text-[10px] font-mono text-industrial-500 uppercase tracking-widest">Operator Node Management</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={user?.role === "viewer"}
                className={`px-4 py-2 bg-brand-main/10 hover:bg-brand-main/20 border border-brand-main/20 text-brand-main text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${user?.role === "viewer" ? "opacity-30 cursor-not-allowed" : ""}`}
                title={user?.role === "viewer" ? "Disabled in Demo Mode" : ""}
              >
                Modify Identity
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-industrial-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  disabled={loading}
                >
                  Abort
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-brand-main hover:bg-brand-light text-industrial-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader size={12} className="animate-spin" />}
                  Commit Changes
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`mb-6 p-3 rounded-lg border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"} text-[10px] font-bold uppercase tracking-widest text-center`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-industrial-600 uppercase tracking-[0.2em] px-1">Operator Alias (ID)</label>
              <div className="flex items-center gap-4 p-4 bg-industrial-950/20 border border-white/5 rounded-xl shadow-inner cursor-not-allowed opacity-60">
                <User size={16} className="text-brand-main opacity-50" />
                <span className="text-[12px] font-black text-industrial-400 uppercase tracking-widest">{user?.username || "GUEST_NODE"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-industrial-600 uppercase tracking-[0.2em] px-1">Personnel Name</label>
              {!isEditing ? (
                <div className="flex items-center gap-4 p-4 bg-industrial-950/40 border border-white/5 rounded-xl shadow-inner">
                  <User size={16} className="text-brand-main opacity-50" />
                  <span className="text-[12px] font-black text-white uppercase tracking-widest">{user?.full_name || "UNREGISTERED"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-brand-main/5 border border-brand-main/20 rounded-xl shadow-inner group/input focus-within:border-brand-main/50 transition-all">
                  <User size={16} className="text-brand-main" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-transparent border-none outline-none text-[12px] font-black text-white uppercase tracking-widest w-full placeholder:text-industrial-700"
                    placeholder="Enter Personnel Name"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-industrial-600 uppercase tracking-[0.2em] px-1">Deployment Contact (Email)</label>
              {!isEditing ? (
                <div className="flex items-center gap-4 p-4 bg-industrial-950/40 border border-white/5 rounded-xl shadow-inner">
                  <Mail size={16} className="text-brand-main opacity-50" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{user?.email || "NO_COMM_LINK"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-brand-main/5 border border-brand-main/20 rounded-xl shadow-inner group/input focus-within:border-brand-main/50 transition-all">
                  <Mail size={16} className="text-brand-main" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-black text-white uppercase tracking-widest w-full placeholder:text-industrial-700"
                    placeholder="Enter Communication Cipher"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-industrial-600 uppercase tracking-[0.2em] px-1">Security Clearance</label>
              <div className="flex items-center gap-4 p-4 bg-industrial-950/40 border border-white/5 rounded-xl shadow-inner">
                <Shield size={16} className="text-brand-main opacity-50" />
                <span className="text-[10px] font-black text-brand-main uppercase tracking-widest">{user?.role || "VIEWER"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* SUBTLE GLOSS OVERLAY */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-main/5 blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
};
