"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileQuestion, Plus, CheckCircle, Clock, XCircle,
  X, Loader2, AlertCircle, ChevronRight, MessageSquare,
  ShieldCheck, Star, Send, ArrowRight, User as UserIcon, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";

interface PPIDRequest {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  informationType: string;
  urgency: string;
  status: string;
  response?: string;
  responseAt?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const statusConfig = {
  OPEN: { label: "Baru Masuk", color: "text-blue-600 bg-blue-50 border-blue-100", icon: AlertCircle },
  IN_PROGRESS: { label: "Diproses", color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock },
  RESOLVED: { label: "Selesai", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  REJECTED: { label: "Ditolak", color: "text-red-600 bg-red-50 border-red-100", icon: XCircle },
  CLOSED: { label: "Ditutup", color: "text-zinc-600 bg-zinc-50 border-zinc-100", icon: XCircle },
};

const INFO_TYPES = [
  { id: "DOKUMEN", label: "Dokumen Resmi" },
  { id: "DATA_STATISTIK", label: "Data & Statistik Pajak" },
  { id: "KEBIJAKAN", label: "Kebijakan & Regulasi" },
  { id: "ANGGARAN", label: "Anggaran & Realisasi" },
  { id: "LAINNYA", label: "Lainnya" },
];

export default function PPIDPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PPIDRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeRespon, setActiveRespon] = useState<string | null>(null);
  const [responContent, setResponContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PPIDRequest | null>(null);
  
  const role = (session?.user as { role: string })?.role ?? "USER";
  const isAdminOrOfficer = ["ADMIN", "OFFICER"].includes(role);

  const [form, setForm] = useState({
    title: "", description: "", informationType: "DOKUMEN", urgency: "NORMAL",
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ppid");
      const d = await res.json();
      setRequests(d.requests ?? []);
    } catch {
      toast("Error", "Gagal memuat permohonan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/ppid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast("Berhasil", "Tiket permohonan PPID Anda telah dibuat.", "success");
      setShowForm(false);
      fetchRequests();
    } catch {
      toast("Error", "Gagal mengirim permohonan.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespon = async (id: string) => {
    if (!responContent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ppid/${id}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responContent, status: "RESOLVED" }),
      });
      if (!res.ok) throw new Error();
      toast("Terikirim", "Tanggapan permohonan telah dikirimkan.", "success");
      setActiveRespon(null);
      setResponContent("");
      fetchRequests();
    } catch {
      toast("Error", "Gagal mengirim tanggapan.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">{isAdminOrOfficer ? "Regulatory Oversight" : "Public Transparency Gateway"}</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            PPID <span className="text-primary italic">Permohonan.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Sistem permohonan informasi publik terpadu untuk memastikan keterbukaan data sesuai regulasi nasional bagi masyarakat Kota Medan.&quot;
          </p>
        </div>
        {!isAdminOrOfficer && (
          <Button
            onClick={() => setShowForm(true)}
            size="xl"
            className="rounded-full px-12 h-20 btn-premium group font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30"
          >
            <Plus className="w-6 h-6 mr-3" /> Ajukan Ticket Baru
          </Button>
        )}
      </div>

      {/* ── Insight Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 px-4">
         <StatCard label="Total Ticket" value={requests.length.toString()} color="zinc" />
         <StatCard label="Baru Masuk" value={requests.filter(r => r.status === "OPEN").length.toString()} color="blue" />
         <StatCard label="Syncing" value={requests.filter(r => r.status === "IN_PROGRESS").length.toString()} color="amber" />
         <StatCard label="Resolved" value={requests.filter(r => r.status === "RESOLVED").length.toString()} color="emerald" />
      </div>

      {/* ── Main Activity Feed ── */}
      <div className="space-y-10">
         <div className="flex items-center justify-between border-b border-zinc-100 pb-8 px-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase italic">{isAdminOrOfficer ? "Ledger Review" : "Arsip Permohonan."}</h2>
            <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic leading-none font-sans">Authorized Transparency Hub</span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-12 px-4">
            {loading ? (
               [1, 2].map(i => <div key={i} className="h-60 bg-zinc-50 border border-zinc-100 rounded-[4rem] animate-pulse" />)
            ) : requests.length === 0 ? (
               <div className="py-32 text-center bg-white border-2 border-dashed border-zinc-100 rounded-[5rem] group hover:border-primary/20 transition-all shadow-inner">
                  <FileQuestion className="w-20 h-20 text-zinc-100 mx-auto mb-8" />
                  <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Repository Empty — No Tickets Logged.</p>
               </div>
            ) : (
               requests.map(r => {
                  const sc = statusConfig[r.status as keyof typeof statusConfig] ?? statusConfig.OPEN;
                  const canRespond = isAdminOrOfficer && !r.response;
                  const isResponding = activeRespon === r.id;

                  return (
                    <div key={r.id} className="bg-white border border-zinc-100 rounded-[4rem] p-10 lg:p-14 hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.08)] hover:scale-[1.01] transition-all duration-700 shadow-xl shadow-primary/[0.03] group relative overflow-hidden flex flex-col gap-10">
                       <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
                       
                       <div className="flex flex-col md:flex-row md:items-start gap-12">
                          <div className="w-20 h-20 shrink-0 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                             <FileQuestion className={cn("w-10 h-10", sc.color.split(" ")[0])} />
                          </div>

                          <div className="flex-1 space-y-6">
                             <div className="flex flex-wrap items-center gap-4">
                                <span className={cn("px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm", sc.color)}>
                                  {sc.label}
                                </span>
                                <span className="font-black text-[9px] text-zinc-300 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-full uppercase tracking-widest italic">{r.ticketNumber}</span>
                                {isAdminOrOfficer && (
                                   <span className="flex items-center gap-2 text-[10px] font-black uppercase italic text-zinc-400 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
                                      <UserIcon className="w-3.5 h-3.5" /> {r.user.name}
                                   </span>
                                )}
                             </div>
                             
                             <div className="space-y-3">
                               <h3 className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors leading-tight uppercase italic">{r.title}</h3>
                               <p className="text-sm font-medium text-muted-foreground italic leading-relaxed border-l-4 border-zinc-50 pl-8 ml-2">&quot;{r.description}&quot;</p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic pl-10">Type: {INFO_TYPES.find(t => t.id === r.informationType)?.label}</p>
                             </div>

                             {r.response && (
                                <div className="mt-10 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 animate-in fade-in duration-500 relative overflow-hidden group/reply">
                                   <div className="absolute top-0 right-0 p-8 opacity-5 -z-0 group-hover/reply:scale-125 transition-transform duration-1000">
                                      <MessageSquare className="w-24 h-24 text-emerald-600" />
                                   </div>
                                   <div className="flex items-center gap-3 mb-4 relative z-10">
                                      <div className="w-8 h-8 bg-white border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                         <CheckCircle className="w-4 h-4" />
                                      </div>
                                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest italic leading-none">Respon Verifikasi PPID</p>
                                   </div>
                                   <p className="text-lg font-bold text-emerald-800 italic leading-relaxed border-l-2 border-emerald-100 pl-8 ml-2 relative z-10">&quot;{r.response}&quot;</p>
                                </div>
                             )}

                             {canRespond && (
                                <div className="mt-8 border-t border-zinc-50 pt-10">
                                   {!isResponding ? (
                                      <Button onClick={() => setActiveRespon(r.id)} className="h-16 rounded-[2rem] px-10 btn-premium flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl">
                                         Kirim Tanggapan PPID <ArrowRight className="w-4 h-4" />
                                      </Button>
                                   ) : (
                                      <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                         <textarea 
                                          rows={4}
                                          className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                                          placeholder="Tuliskan respon resmi permohonan informasi..."
                                          value={responContent}
                                          onChange={e => setResponContent(e.target.value)}
                                         />
                                         <div className="flex gap-4">
                                            <Button disabled={submitting} onClick={() => handleRespon(r.id)} className="flex-1 h-16 bg-primary text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20">
                                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publikasikan Tanggapan"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setActiveRespon(null)} className="h-16 px-10 rounded-full font-black uppercase text-[10px] tracking-widest border-zinc-100 italic transition-all">Batal</Button>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             )}
                          </div>

                           <div className="flex flex-col items-end gap-6 shrink-0">
                              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic text-right leading-none group-hover:text-primary transition-colors italic">Inscribed On: <br/> {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                              <button 
                                 onClick={() => setSelectedRequest(r)}
                                 className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-200 hover:scale-105 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all shadow-inner cursor-pointer"
                              >
                                 <ArrowRight className="w-6 h-6" />
                              </button>
                           </div>
                       </div>
                    </div>
                  );
               })
            )}
         </div>
      </div>
      
      {/* ── Detail Modal ── */}
       {selectedRequest && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-300 text-left">
            <Card padding="none" className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-zinc-100 animate-in zoom-in-95 duration-300 relative p-8">
               <div className="flex items-start justify-between mb-6">
                  <div>
                     <span className="text-[10px] font-black uppercase text-zinc-400">Rincian Permohonan Informasi</span>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 mt-1">{selectedRequest.ticketNumber}</h3>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all">
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="space-y-4 text-xs font-bold">
                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                     <p className="text-[9px] font-black uppercase text-zinc-400">Subjek Permohonan</p>
                     <p className="text-zinc-900 font-black text-sm">{selectedRequest.title}</p>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                     <p className="text-[9px] font-black uppercase text-zinc-400">Deskripsi Detail</p>
                     <p className="text-zinc-650 font-medium font-sans leading-relaxed">{selectedRequest.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-zinc-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Tipe Informasi</p>
                        <p className="text-zinc-800 text-xs font-black uppercase tracking-wider">{INFO_TYPES.find(t => t.id === selectedRequest.informationType)?.label || selectedRequest.informationType}</p>
                     </div>
                     <div className="bg-zinc-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Tingkat Urgensi</p>
                        <p className={cn(
                           "text-xs font-black uppercase tracking-wider",
                           selectedRequest.urgency === "HIGH" ? "text-red-500" :
                           selectedRequest.urgency === "NORMAL" ? "text-amber-500" : "text-zinc-500"
                        )}>{selectedRequest.urgency}</p>
                     </div>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                     <p className="text-[9px] font-black uppercase text-zinc-400">Status Permohonan</p>
                     <div className="flex items-center gap-2">
                        <span className={cn(
                           "px-4 py-1.5 rounded-full text-[9px] font-black border leading-none uppercase tracking-widest",
                           statusConfig[selectedRequest.status as keyof typeof statusConfig]?.color || "bg-zinc-150"
                        )}>
                           {statusConfig[selectedRequest.status as keyof typeof statusConfig]?.label || selectedRequest.status}
                        </span>
                     </div>
                  </div>

                  {selectedRequest.response && (
                     <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-1">
                        <p className="text-[9px] font-black uppercase text-emerald-700">Respon Resmi PPID</p>
                        <p className="text-emerald-800 text-xs font-bold leading-relaxed">&quot;{selectedRequest.response}&quot;</p>
                        {selectedRequest.responseAt && (
                           <p className="text-[8px] text-emerald-600 font-sans mt-1">Diberikan pada: {new Date(selectedRequest.responseAt).toLocaleString("id-ID")}</p>
                        )}
                     </div>
                  )}

                  <div className="bg-zinc-50 p-4 rounded-2xl">
                     <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Pemohon / Pengaju</p>
                     <p className="text-zinc-800 text-xs font-black">{selectedRequest.user?.name || "—"}</p>
                     <p className="text-zinc-400 text-[10px] font-medium font-sans mt-0.5">{selectedRequest.user?.email || ""}</p>
                  </div>
               </div>

               <div className="mt-8 flex gap-3">
                  <Button onClick={() => setSelectedRequest(null)} className="flex-1 h-12 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                     Tutup Rincian
                  </Button>
               </div>
            </Card>
         </div>
       )}

      {/* ── Submit Modal (For User) ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-500 text-left">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-16">
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-3">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase italic leading-none">Ajukan <span className="text-primary italic">Informasi.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans italic opacity-70 leading-none mt-2">Certified Information Request Line</p>
                 </div>
                 <button onClick={() => setShowForm(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Judul Permohonan</label>
                    <input 
                      required 
                      className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                      placeholder="Apa informasi yang Anda ingin tanyakan?" 
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Grup Informasi</label>
                    <div className="relative">
                       <select
                         className="w-full pl-8 pr-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-[10px] uppercase tracking-[0.2em] italic shadow-inner appearance-none cursor-pointer"
                         value={form.informationType}
                         onChange={e => setForm({...form, informationType: e.target.value})}
                       >
                         {INFO_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                       </select>
                       <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Deskripsi Narasi</label>
                    <textarea 
                      required rows={5} 
                      className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                      placeholder="Jelaskan kebutuhan data Anda secara spesifik..." 
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                 </div>
                 
                 <Button disabled={submitting} type="submit" className="w-full h-20 bg-primary text-white font-black rounded-full shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase">
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Terbitkan Tiket PPID"}
                 </Button>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    zinc: "text-zinc-500 bg-zinc-50",
    blue: "text-blue-500 bg-blue-50",
    amber: "text-amber-500 bg-amber-50",
    emerald: "text-emerald-500 bg-emerald-50",
  };
  return (
    <Card padding="lg" className="bg-white border-zinc-100 rounded-[2.5rem] shadow-xl shadow-primary/[0.03] text-left hover:scale-[1.05] transition-all group overflow-hidden relative">
       <div className={cn("absolute inset-0 opacity-10 -z-0", colors[color].split(" ")[1])} />
       <p className={cn("text-5xl font-black italic tracking-tighter leading-none relative z-10", colors[color].split(" ")[0])}>{value}</p>
       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4 relative z-10 italic">{label}</p>
    </Card>
  );
}
