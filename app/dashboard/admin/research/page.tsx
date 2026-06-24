"use client";

import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Info,
  Building,
  User,
  MessageSquare, X
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ResearchRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  status: string;
  institution: string;
  supervisorName: string;
  dataNeeded: string;
  purpose: string;
  documentUrl?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  REVIEW: "bg-blue-50 text-blue-600 border-blue-100",
  APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  REJECTED: "bg-red-50 text-red-600 border-red-100",
};

export default function AdminResearchPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ResearchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeReview, setActiveReview] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResearchRequest | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/research");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      toast("Error", "Gagal memuat data riset.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/research/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes }),
      });
      if (!res.ok) throw new Error();
      
      toast("Berhasil", `Status riset telah diperbarui menjadi ${status}.`, "success");
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      setActiveReview(null);
      setReviewNotes("");
    } catch {
      toast("Gagal", "Sistem gagal memproses audit riset.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchSearch = 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.user.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Research Integrity Dashboard</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            Review <span className="text-primary italic">Akademisi.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Manajemen persetujuan permohonan data dan izin penelitian bagi mahasiswa dan instansi akademik oleh Bapenda Medan.&quot;
          </p>
        </div>
        <div className="flex items-center gap-6">
            <Card padding="lg" variant="outline" className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] shadow-inner py-4 px-8 min-w-[200px] text-right">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] italic leading-none">Pending Tasks</p>
                  <p className="text-2xl font-black italic tracking-tighter uppercase">{requests.filter(r => r.status === "PENDING").length} <span className="text-primary tracking-normal font-sans text-xs">Waiting</span></p>
               </div>
            </Card>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col md:flex-row gap-6 pt-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Judul, No. Request, atau Nama Peneliti..."
            className="w-full pl-22 pr-10 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.04] focus:ring-4 focus:ring-primary/10 transition-all font-black text-lg tracking-tight italic"
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-zinc-50 rounded-[2rem] border border-zinc-100 shadow-inner">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                filterStatus === s ? "bg-white text-primary shadow-xl border border-primary/10" : "text-zinc-400 hover:text-zinc-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Requests List ── */}
      <div className="grid grid-cols-1 gap-12">
        {loading ? (
           [1, 2].map(i => <div key={i} className="h-64 bg-zinc-50 border border-zinc-100 rounded-[4rem] animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center bg-white border-2 border-dashed border-zinc-100 rounded-[5rem] group hover:border-primary/20 transition-all shadow-inner">
             <GraduationCap className="w-20 h-20 mx-auto text-zinc-100 mb-8" />
             <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Ledger Empty — No Academic Requests.</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-white border border-zinc-100 rounded-[4rem] p-10 lg:p-14 hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.08)] hover:scale-[1.01] transition-all duration-700 shadow-xl shadow-primary/[0.03] group relative overflow-hidden flex flex-col gap-10">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
               
               <div className="flex flex-col lg:flex-row lg:items-start gap-12">
                  <div className="w-24 h-24 shrink-0 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-center justify-center font-black text-3xl italic text-primary shadow-inner group-hover:rotate-12 transition-transform">
                     {r.user.name[0]}
                  </div>

                  <div className="flex-1 space-y-8">
                     <div className="flex flex-wrap items-center gap-4">
                        <span className={cn("px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm", statusBadge[r.status])}>
                           {r.status}
                        </span>
                        <span className="text-[10px] font-black text-zinc-300 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-full uppercase tracking-widest italic font-sans">{r.requestNumber}</span>
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase italic text-primary/60 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                           <Building className="w-3.5 h-3.5" /> {r.institution}
                        </span>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors leading-tight uppercase italic">{r.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground italic leading-relaxed border-l-4 border-zinc-100 pl-8 ml-2">&quot;{r.description}&quot;</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50/50 p-10 rounded-[3rem] border border-zinc-100 shadow-inner">
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic mb-2">Peneliti / Supervisor</p>
                           <div className="flex items-center gap-4 text-xs font-bold text-zinc-900 italic">
                             <User className="w-4 h-4 text-primary" /> {r.user.name} <span className="text-zinc-400 font-medium">({r.supervisorName})</span>
                           </div>
                           <div className="flex items-center gap-4 text-xs font-bold text-zinc-900 italic">
                             <MessageSquare className="w-4 h-4 text-primary" /> {r.user.email}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic mb-2">Data Yang Dibutuhkan</p>
                           <div className="flex items-start gap-4 text-xs font-bold text-zinc-900 italic leading-relaxed">
                              <Info className="w-4 h-4 text-primary mt-1 shrink-0" /> {r.dataNeeded}
                           </div>
                        </div>
                     </div>

                     {activeReview === r.id ? (
                        <div className="mt-8 pt-10 border-t border-zinc-50 animate-in slide-in-from-top-4 duration-500 space-y-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Audit & Review Notes</label>
                              <textarea 
                                rows={4}
                                className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                                placeholder="Cantumkan catatan persetujuan atau alasan penolakan..."
                                value={reviewNotes}
                                onChange={e => setReviewNotes(e.target.value)}
                              />
                           </div>
                           <div className="flex gap-4">
                              <Button 
                                disabled={submitting} 
                                onClick={() => handleReview(r.id, "APPROVED")} 
                                className="flex-1 h-18 bg-emerald-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-600/20"
                              >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Setujui Permohonan"}
                              </Button>
                              <Button 
                                variant="outline" 
                                disabled={submitting} 
                                onClick={() => handleReview(r.id, "REJECTED")} 
                                className="flex-1 h-18 border-red-500 text-red-500 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all"
                              >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tolak Pengajuan"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                onClick={() => setActiveReview(null)} 
                                className="h-18 px-10 rounded-full font-black uppercase text-[10px] tracking-widest border border-zinc-100 italic"
                              >
                                Batal
                              </Button>
                           </div>
                        </div>
                     ) : r.status === "PENDING" ? (
                        <Button 
                          onClick={() => setActiveReview(r.id)} 
                          className="mt-8 h-18 rounded-[2rem] px-12 btn-premium flex items-center gap-4 font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20"
                        >
                          Audit Permohonan <ArrowRight className="w-5 h-5" />
                        </Button>
                     ) : (
                        <div className="mt-8 pt-10 border-t border-zinc-50 flex items-center gap-4 opacity-50 italic">
                           <ShieldCheck className="w-5 h-5 text-zinc-400" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Archived: This entry has been audited by the system.</p>
                        </div>
                     )}
                  </div>

                  <div className="flex flex-col items-end gap-6 shrink-0 pt-4">
                     <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic text-right leading-none group-hover:text-primary transition-colors italic">Inscribed On: <br/> {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                     <button 
                        onClick={() => setSelectedRequest(r)}
                        className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex items-center justify-center text-zinc-200 hover:scale-105 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all shadow-inner cursor-pointer"
                     >
                        <ArrowRight className="w-7 h-7" />
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
      {/* ── Detail Modal ── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-300 text-left">
           <Card padding="none" className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-zinc-100 animate-in zoom-in-95 duration-300 relative p-8">
              <div className="flex items-start justify-between mb-6">
                 <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400">Rincian Pengajuan Riset Kampus</span>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 mt-1">{selectedRequest.requestNumber}</h3>
                 </div>
                 <button onClick={() => setSelectedRequest(null)} className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-4 text-xs font-bold">
                 <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Judul Riset / Penelitian</p>
                    <p className="text-zinc-900 font-black text-sm">{selectedRequest.title}</p>
                 </div>

                 <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Deskripsi / Abstrak</p>
                    <p className="text-zinc-650 font-medium font-sans leading-relaxed">{selectedRequest.description}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Institusi / Kampus</p>
                       <p className="text-zinc-800 text-xs font-black uppercase tracking-wider">{selectedRequest.institution}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Dosen Pembimbing</p>
                       <p className="text-zinc-800 text-xs font-black">{selectedRequest.supervisorName}</p>
                    </div>
                 </div>

                 <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Data Yang Dibutuhkan</p>
                    <p className="text-zinc-700 font-medium font-sans leading-relaxed">{selectedRequest.dataNeeded}</p>
                 </div>

                 <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Tujuan Penelitian</p>
                    <p className="text-zinc-700 font-medium font-sans leading-relaxed">{selectedRequest.purpose}</p>
                 </div>

                 <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Status Pengajuan</p>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black border leading-none uppercase tracking-widest",
                          statusBadge[selectedRequest.status] || "bg-zinc-150"
                       )}>
                          {selectedRequest.status}
                       </span>
                    </div>
                 </div>

                 <div className="bg-zinc-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Pengaju / Mahasiswa</p>
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
    </div>
  );
}
