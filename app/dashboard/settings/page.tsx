"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Settings, User, Lock, Save, Camera, ShieldCheck, Mail, Phone, MapPin, Fingerprint, History, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Load current user data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name ?? "");
          setPhone(data.phone ?? "");
          setAddress(data.address ?? "");
        }
      } catch {
        setName(session?.user?.name ?? "");
      }
    };
    if (session?.user?.id) fetchProfile();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      if (!res.ok) throw new Error();
      await update({ name }); // refresh session
      toast("Profil Terupdate", "Seluruh perubahan identitas Anda telah disinkronisasi.", "success");
    } catch {
      toast("Gagal", "Tidak dapat menyimpan perubahan profil.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) {
      toast("Terlalu Pendek", "Kata sandi baru minimal 8 karakter.", "error");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal");
      }
      toast("Kata Sandi Diperbarui", "Kredensial Anda telah berhasil diubah.", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast("Gagal", err instanceof Error ? err.message : "Gagal mengubah kata sandi.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profil & Identitas", icon: User },
    { id: "security" as const, label: "Keamanan Akun", icon: Lock },
  ];

  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 selection:bg-primary/20 text-left">

      {/* ── Page Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-zinc-950 dark:text-zinc-300">
          <div className="w-8 h-1 bg-zinc-950 dark:bg-zinc-300 rounded-full shadow-glow" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Account Settings Portal</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-zinc-950 dark:text-white leading-none uppercase">
          Pengaturan <span className="text-zinc-950 dark:text-zinc-100 italic">Akun Saya.</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-zinc-950/20 dark:border-zinc-800 pl-6">
          Kelola data pribadi Anda, sesuaikan keamanan kata sandi, serta pantau integritas kredensial Anda di platform Bapenda.Hub Kota Medan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left Navigation / Sidebar ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-2 shadow-sm space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full flex items-center justify-between px-5 h-14 rounded-xl font-bold transition-all text-left",
                  activeTab === t.id
                    ? "bg-[#1E40AF] text-white shadow-md shadow-[#1E40AF]/15"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                  )}>
                    <t.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase tracking-wider">{t.label}</span>
                </div>
                {activeTab === t.id && <CheckCircle className="w-4 h-4 opacity-75" />}
              </button>
            ))}
          </div>

          <Card padding="md" className="border border-zinc-200 bg-zinc-50/50 rounded-2xl">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Keamanan & Privasi</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800 uppercase tracking-tight">Sesi Terenkripsi</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Kredensial Anda aman dienkripsi</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 italic leading-relaxed pl-1 border-l-2 border-zinc-200">
                Semua data Anda terlindungi dengan standar enkripsi SSL 256-bit and autentikasi NextAuth.js terenkripsi penuh.
              </p>
            </div>
          </Card>
        </div>

        {/* ── Right Content Panel ── */}
        <div className="lg:col-span-8">
          {activeTab === "profile" ? (
            <Card padding="md" className="relative overflow-hidden border border-zinc-200 shadow-sm bg-white rounded-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 -z-0">
                <User className="w-32 h-32 text-primary" />
              </div>

              <form onSubmit={handleSave} className="relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100">
                  <div className="relative group/avatar">
                    <div className="w-24 h-24 rounded-2xl bg-[#1E40AF] text-white flex items-center justify-center font-bold text-4xl shadow-md">
                      {name?.[0]?.toUpperCase() ?? session?.user?.name?.[0] ?? "W"}
                    </div>
                    <button
                      type="button"
                      onClick={() => toast("Unggah Foto", "Fitur unggah foto profil akan segera hadir.", "info")}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-primary border border-zinc-200 rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                      title="Ubah Foto"
                    >
                      <Camera className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Terverifikasi</p>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-800 uppercase tracking-tight">{name || session?.user?.name}</h2>
                    <p className="text-xs text-zinc-400 font-mono">BPN-M-{session?.user?.id?.slice(-8).toUpperCase() ?? "------"}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Nama Lengkap</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#1E40AF] transition-colors" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Alamat Email (Akun)</label>
                    <div className="relative opacity-70">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        readOnly
                        value={session?.user?.email ?? ""}
                        className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-400 cursor-not-allowed font-medium text-sm italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Nomor Handphone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#1E40AF] transition-colors" />
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Alamat Domisili</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#1E40AF] transition-colors" />
                      <input
                        type="text"
                        placeholder="Masukkan alamat domisili..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-white font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card padding="md" className="relative overflow-hidden border border-zinc-200 shadow-sm bg-white rounded-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 -z-0">
                  <Fingerprint className="w-32 h-32 text-primary" />
                </div>

                <form onSubmit={handleChangePassword} className="relative z-10 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800 uppercase tracking-tight">Perbarui Kata Sandi</h3>
                    <p className="text-xs text-zinc-400 mt-1">Gunakan minimal 8 karakter dengan kombinasi angka dan huruf untuk kata sandi yang kuat.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Kata Sandi Saat Ini</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#1E40AF] transition-colors" />
                        <input
                          type="password"
                          placeholder="Masukkan password saat ini"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm tracking-widest"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-1">Kata Sandi Baru (min. 8 Karakter)</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#1E40AF] transition-colors" />
                        <input
                          type="password"
                          placeholder="Masukkan password baru"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm tracking-widest"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex justify-end">
                    <Button
                      type="submit"
                      disabled={pwLoading}
                      className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-white font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 shadow-sm"
                    >
                      {pwLoading ? "Memperbarui..." : "Update Kata Sandi"}
                      <Lock className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </Card>

              <Card padding="md" className="bg-white border border-zinc-200 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-200 shrink-0">
                      <History className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="text-xs font-bold text-zinc-800 uppercase tracking-tight">Log Aktivitas Akun</p>
                      <p className="text-[10px] text-zinc-400 max-w-md font-medium leading-relaxed">
                        Pantau riwayat sesi masuk dan aktivitas akun Anda di platform SIPADA untuk memastikan tidak ada aktivitas mencurigakan.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => toast("Log Aktivitas", "Fitur log aktivitas rinci sedang dikembangkan.", "info")}
                    className="w-full sm:w-auto h-10 px-5 rounded-lg border-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-50"
                  >
                    Lihat Log
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
