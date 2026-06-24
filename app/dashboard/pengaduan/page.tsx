"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Megaphone, Plus, CheckCircle, Clock, XCircle,
  X, Loader2, AlertTriangle, MessageSquare, Eye, EyeOff,
  ShieldCheck, Star, Send, ArrowRight, User as UserIcon,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";

interface Complaint {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  isAnonymous: boolean;
  response?: string;
  responseAt?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const statusConfig = {
  OPEN: { label: "Baru Masuk", color: "text-blue-600 bg-blue-50 border-blue-100", icon: AlertTriangle },
  IN_PROGRESS: { label: "Diproses", color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock },
  RESOLVED: { label: "Diselesaikan", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  CLOSED: { label: "Ditutup", color: "text-zinc-600 bg-zinc-50 border-zinc-100", icon: XCircle },
};

const CATEGORIES = [
  { id: "PELAYANAN", label: "Kualitas Pelayanan", emoji: "🏛️" },
  { id: "TEKNIS_SISTEM", label: "Gangguan Sistem", emoji: "💻" },
  { id: "PAJAK", label: "Masalah Perpajakan", emoji: "📋" },
  { id: "PETUGAS", label: "Perilaku Petugas", emoji: "👤" },
  { id: "LAINNYA", label: "Lainnya", emoji: "📝" },
];

export default function PengaduanPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeRespon, setActiveRespon] = useState<string | null>(null);
  const [responContent, setResponContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  const role = (session?.user as { role: string })?.role ?? "USER";
  const isAdminOrOfficer = ["ADMIN", "OFFICER"].includes(role);

  const [form, setForm] = useState({
    subject: "", description: "", category: "PELAYANAN",
    priority: "NORMAL", isAnonymous: false,
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/complaints");
      const d = await res.json();
      setComplaints(d.complaints ?? []);
    } catch {
      toast("Error", "Gagal memuat aduan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast("Sukses", "Aduan Anda telah terenkripsi dalam sistem.", "success");
      setShowForm(false);
      fetchComplaints();
    } catch {
      toast("Error", "Gagal mengirim aduan.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespon = async (id: string) => {
    if (!responContent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${id}/response`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responContent, status: "RESOLVED" }),
      });
      if (!res.ok) throw new Error();
      toast("Terkirim", "Respon telah dipublikasikan ke pelapor.", "success");
      setActiveRespon(null);
      setResponContent("");
      fetchComplaints();
    } catch {
      toast("Error", "Gagal mengirim respon.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">{isAdminOrOfficer ? "Supervisory Hub" : "Community Node"}</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            {isAdminOrOfficer ? "Audit" : "Aduan"} <span className="text-primary italic">Publik.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Sistem pengادuan terintegrasi untuk menjamin integritas pelayanan publik dan transparansi tata kelola perpajakan di Kota Medan.&quot;
          </p>
        </div>
        {!isAdminOrOfficer && (
          <Button
            onClick={() => setShowForm(true)}
            size="xl"
            className="rounded-full px-12 h-20 btn-premium group font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30"
          >
            <Plus className="w-6 h-6 mr-3" /> Buat Aduan Baru
          </Button>
        )}
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
         <StatItem label="Total Task" value={complaints.length.toString()} color="zinc" />
         <StatItem label="New Feed" value={complaints.filter(c => c.status === "OPEN").length.toString()} color="blue" />
         <StatItem label="In Progress" value={complaints.filter(c => c.status === "IN_PROGRESS").length.toString()} color="amber" />
         <StatItem label="Success" value={complaints.filter(c => c.status === "RESOLVED").length.toString()} color="emerald" />
      </div>

      {/* ── Main Feed ── */}
      <div className="space-y-10">
         <div className="flex items-center justify-between border-b border-zinc-100 pb-8">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase italic">{isAdminOrOfficer ? "Dispatch Feed" : "Arsip Saya."}</h2>
            <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans leading-none">Safe & Encrypted Connection</span>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-12">
            {loading ? (
               [1, 2].map(i => <div key={i} className="h-60 bg-zinc-50 border border-zinc-100 rounded-[4rem] animate-pulse" />)
            ) : complaints.length === 0 ? (
               <div className="py-32 text-center bg-white border-2 border-dashed border-zinc-100 rounded-[5rem] group hover:border-primary/20 transition-all shadow-inner">
                  <Megaphone className="w-20 h-20 text-zinc-100 mx-auto mb-8" />
                  <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Void Feed — No Complaints Logged.</p>
               </div>
            ) : (
               complaints.map(c => {
                  const sc = statusConfig[c.status as keyof typeof statusConfig] ?? statusConfig.OPEN;
                  const canRespond = isAdminOrOfficer && !c.response;
                  const isResponding = activeRespon === c.id;

                  return (
                    <div key={c.id} className="bg-white border border-zinc-100 rounded-[4rem] p-10 lg:p-14 hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.08)] hover:scale-[1.01] transition-all duration-700 shadow-xl shadow-primary/[0.03] group relative overflow-hidden flex flex-col gap-10">
                       <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
                       
                       <div className="flex flex-col md:flex-row md:items-start gap-12 text-left">
                          <div className="w-20 h-20 shrink-0 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                             <ShieldAlert className={cn("w-10 h-10", sc.color.split(" ")[0])} />
                          </div>

                          <div className="flex-1 space-y-6">
                             <div className="flex flex-wrap items-center gap-4">
                                <span className={cn("px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm", sc.color)}>
                                  {sc.label}
                                </span>
                                <span className="font-black text-[9px] text-zinc-300 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-full uppercase tracking-widest italic">{c.ticketNumber}</span>
                                {isAdminOrOfficer && (
                                   <span className="flex items-center gap-2 text-[10px] font-black uppercase italic text-zinc-400 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
                                      <UserIcon className="w-3.5 h-3.5" /> {c.isAnonymous ? "ANONYMOUS" : c.user.name}
                                   </span>
                                )}
                             </div>
                             
                             <div className="space-y-3">
                               <h3 className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors leading-tight uppercase italic">{c.subject}</h3>
                               <p className="text-sm font-medium text-muted-foreground italic leading-relaxed border-l-4 border-zinc-50 pl-8 ml-2">&quot;{c.description}&quot;</p>
                             </div>

                             {c.response && (
                                <div className="mt-10 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-10 animate-in fade-in duration-500 relative overflow-hidden group/reply">
                                   <div className="absolute top-0 right-0 p-8 opacity-5 -z-0 group-hover/reply:scale-125 transition-transform duration-1000">
                                      <MessageSquare className="w-24 h-24 text-emerald-600" />
                                   </div>
                                   <div className="flex items-center gap-3 mb-4 relative z-10">
                                      <div className="w-8 h-8 bg-white border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                         <CheckCircle className="w-4 h-4" />
                                      </div>
                                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest italic leading-none">Respon Verifikasi Final</p>
                                   </div>
                                   <p className="text-lg font-bold text-emerald-800 italic leading-relaxed border-l-2 border-emerald-100 pl-8 ml-2 relative z-10">&quot;{c.response}&quot;</p>
                                </div>
                             )}

                             {canRespond && (
                                <div className="mt-8 border-t border-zinc-50 pt-10">
                                   {!isResponding ? (
                                      <Button onClick={() => setActiveRespon(c.id)} className="h-16 rounded-[2rem] px-10 btn-premium flex items-center gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl">
                                         Kirim Respon Petugas <ArrowRight className="w-4 h-4" />
                                      </Button>
                                   ) : (
                                      <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                         <textarea 
                                          rows={4}
                                          className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                                          placeholder="Tuliskan respon resmi untuk pelapor..."
                                          value={responContent}
                                          onChange={e => setResponContent(e.target.value)}
                                         />
                                         <div className="flex gap-4">
                                            <Button disabled={submitting} onClick={() => handleRespon(c.id)} className="flex-1 h-16 bg-primary text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20">
                                              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publikasikan Respon"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setActiveRespon(null)} className="h-16 px-10 rounded-full font-black uppercase text-[10px] tracking-widest border-zinc-100 italic">Batal</Button>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             )}
                          </div>

                          <div className="flex flex-col items-end gap-6 shrink-0">
                              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic text-right leading-none group-hover:text-primary transition-colors">Arrived On: <br/> {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                              <button 
                                 onClick={() => setSelectedComplaint(c)}
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
       {selectedComplaint && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-300 text-left">
            <Card padding="none" className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-zinc-100 animate-in zoom-in-95 duration-300 relative p-8">
               <div className="flex items-start justify-between mb-6">
                  <div>
                     <span className="text-[10px] font-black uppercase text-zinc-400">Rincian Pengaduan / Keluhan</span>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 mt-1">{selectedComplaint.ticketNumber}</h3>
                  </div>
                  <button onClick={() => setSelectedComplaint(null)} className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all">
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="space-y-4 text-xs font-bold">
                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                     <p className="text-[9px] font-black uppercase text-zinc-400">Subjek Aduan</p>
                     <p className="text-zinc-900 font-black text-sm">{selectedComplaint.subject}</p>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                     <p className="text-[9px] font-black uppercase text-zinc-400">Deskripsi Masalah</p>
                     <p className="text-zinc-650 font-medium font-sans leading-relaxed">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-zinc-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Kategori Masalah</p>
                        <p className="text-zinc-800 text-xs font-black uppercase tracking-wider">{CATEGORIES.find(cat => cat.id === selectedComplaint.category)?.label || selectedComplaint.category}</p>
                     </div>
                     <div className="bg-zinc-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Prioritas</p>
                        <p className={cn(
                           "text-xs font-black uppercase tracking-wider",
                           selectedComplaint.priority === "HIGH" ? "text-red-500" :
                           selectedComplaint.priority === "NORMAL" ? "text-amber-500" : "text-zinc-500"
                        )}>{selectedComplaint.priority}</p>
                     </div>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                     <p className="text-[9px] font-black uppercase text-zinc-400">Status Aduan</p>
                     <div className="flex items-center gap-2">
                        <span className={cn(
                           "px-4 py-1.5 rounded-full text-[9px] font-black border leading-none uppercase tracking-widest",
                           statusConfig[selectedComplaint.status as keyof typeof statusConfig]?.color || "bg-zinc-150"
                        )}>
                           {statusConfig[selectedComplaint.status as keyof typeof statusConfig]?.label || selectedComplaint.status}
                        </span>
                     </div>
                  </div>

                  {selectedComplaint.response && (
                     <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-1">
                        <p className="text-[9px] font-black uppercase text-emerald-700">Respon Resmi Petugas</p>
                        <p className="text-emerald-800 text-xs font-bold leading-relaxed">&quot;{selectedComplaint.response}&quot;</p>
                        {selectedComplaint.responseAt && (
                           <p className="text-[8px] text-emerald-600 font-sans mt-1">Diberikan pada: {new Date(selectedComplaint.responseAt).toLocaleString("id-ID")}</p>
                        )}
                     </div>
                  )}

                  <div className="bg-zinc-50 p-4 rounded-2xl">
                     <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Pengaju / Pelapor</p>
                     <p className="text-zinc-800 text-xs font-black">
                        {selectedComplaint.isAnonymous ? "Anonim (Dirahasiakan)" : (selectedComplaint.user?.name || "—")}
                     </p>
                     {!selectedComplaint.isAnonymous && selectedComplaint.user?.email && (
                        <p className="text-zinc-400 text-[10px] font-medium font-sans mt-0.5">{selectedComplaint.user.email}</p>
                     )}
                  </div>
               </div>

               <div className="mt-8 flex gap-3">
                  <Button onClick={() => setSelectedComplaint(null)} className="flex-1 h-12 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                     Tutup Rincian
                  </Button>
               </div>
            </Card>
         </div>
       )}

      {/* ── Submit Modal (For User) ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-6 animate-in fade-in duration-500 text-left">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-16">
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-3">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase italic leading-none">Buat <span className="text-primary italic">Aduan.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic font-sans italic opacity-70">Secured Transmission Line</p>
                 </div>
                 <button onClick={() => setShowForm(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Subjek Masalah</label>
                    <input 
                      required 
                      className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                      placeholder="Contoh: Kesalahan input NOP..." 
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Detail Pengaduan</label>
                    <textarea 
                      required rows={5} 
                      className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                      placeholder="Ceritakan kendala Anda secara terperinci..." 
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setForm(p => ({...p, isAnonymous: !p.isAnonymous}))}
                      className={cn(
                        "flex items-center gap-4 px-8 h-18 rounded-[2rem] border-2 transition-all shadow-inner uppercase text-[10px] font-black tracking-widest italic",
                        form.isAnonymous ? "border-amber-200 bg-amber-50 text-amber-600" : "border-zinc-50 bg-zinc-50 text-zinc-400"
                      )}
                    >
                       {form.isAnonymous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       Anonim
                    </button>
                    <Button disabled={submitting} type="submit" className="flex-1 h-20 bg-primary text-white font-black rounded-full shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase">
                       {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Kirim Pengaduan"}
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
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
