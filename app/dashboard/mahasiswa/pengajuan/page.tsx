"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Upload, 
  Send, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Building,
  User,
  BookOpen,
  Clock,
  ChevronRight,
  MoreVertical,
  Plus,
  ArrowRight,
  Loader2,
  FileText,
  X
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ResearchRequest {
  id: string;
  requestNumber: string;
  title: string;
  status: string;
  createdAt: string;
  institution: string;
  description?: string;
  supervisorName?: string;
  dataNeeded?: string;
  purpose?: string;
}

export default function PengajuanRisetPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [myRequests, setMyRequests] = useState<ResearchRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ResearchRequest | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    institution: "",
    supervisorName: "",
    supervisorNip: "",
    dataNeeded: "",
    purpose: "",
    documentUrl: "",
  });

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/research");
      const data = await res.json();
      setMyRequests(data.requests || []);
    } catch {
      toast("Error", "Gagal memuat riwayat pengajuan.", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim pengajuan");
      
      setSuccess(true);
      fetchMyRequests();
      toast("Berhasil", "Pengajuan riset Anda telah dikirim.", "success");
    } catch (err: unknown) {
      toast("Kesalahan", err instanceof Error ? err.message : "Gagal memproses data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    REVIEW: "bg-blue-50 text-blue-600 border-blue-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-red-50 text-red-600 border-red-100",
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-in zoom-in-95 duration-500 text-left">
        <div className="bg-white border border-border/50 p-12 lg:p-24 rounded-[4rem] shadow-2xl text-center max-w-2xl relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-green-500/5 rounded-full blur-[100px] group-hover:bg-green-500/10 transition-all duration-1000" />
          <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 animate-bounce shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter mb-4 uppercase italic">Pengajuan <span className="text-emerald-500 italic">Terkirim!</span></h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-12 italic border-l-4 border-emerald-100 pl-8 ml-4">
            &quot;Terima kasih. Permohonan riset Anda telah direkam dalam sistem. Petugas akan melakukan verifikasi berkas dalam waktu 3-5 hari kerja.&quot;
          </p>
          <button 
            onClick={() => { setSuccess(false); setShowForm(false); }}
            className="w-full py-6 bg-primary text-white font-black rounded-full hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-primary/20 uppercase text-xs tracking-widest italic"
          >
            Lihat Status Pengajuan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left pb-20">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
         <div className="space-y-4">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-100 italic">
             Academic Research Gateway
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase italic leading-none flex items-center gap-6">
             <GraduationCap className="w-14 h-14 text-primary" /> Pusat <span className="text-primary italic">Riset Data.</span>
           </h1>
           <p className="text-xl text-muted-foreground font-medium italic leading-relaxed max-w-2xl border-l-4 border-primary/10 pl-10">
             &quot;Layanan permohonan data sekunder dan izin penelitian resmi Pemerintah Kota Medan untuk keperluan skripsi, tesis, dan jurnal ilmiah.&quot;
           </p>
         </div>
         {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn-premium px-12 h-20 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 flex items-center gap-4 group"
            >
              Ajukan Riset Baru <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
         )}
      </div>

      {!showForm ? (
        <div className="space-y-10">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase italic">Status <span className="text-primary italic">Pengajuan Saya.</span></h2>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{myRequests.length} Entries</div>
           </div>

           <div className="grid grid-cols-1 gap-8">
              {fetching ? (
                 [1, 2].map(i => <div key={i} className="h-40 bg-zinc-50 border border-zinc-100 rounded-[4rem] animate-pulse" />)
              ) : myRequests.length === 0 ? (
                 <div className="py-24 text-center bg-white border-2 border-dashed border-zinc-100 rounded-[5rem] group hover:border-primary/20 transition-all shadow-inner">
                    <FileText className="w-20 h-20 text-zinc-100 mx-auto mb-8" />
                    <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Ledger Null — Belum Ada Pengajuan.</p>
                    <button onClick={() => setShowForm(true)} className="mt-8 text-primary font-black uppercase text-[10px] tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all">Mulai Pengajuan Pertama →</button>
                 </div>
              ) : (
                myRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-zinc-100 rounded-[4rem] p-10 lg:p-14 hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.1)] hover:scale-[1.01] transition-all duration-700 shadow-xl shadow-primary/[0.03] group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
                     <div className="flex flex-col md:flex-row items-center gap-10 flex-1 relative z-10 w-full md:w-auto">
                        <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                           <GraduationCap className="w-10 h-10 text-primary opacity-20" />
                        </div>
                        <div className="space-y-4 flex-1">
                           <div className="flex flex-wrap items-center gap-4">
                              <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm ${statusBadge[req.status]}`}>
                                {req.status}
                              </span>
                              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic font-sans">{req.requestNumber}</span>
                           </div>
                           <h3 className="text-2xl font-black italic tracking-tighter uppercase italic leading-tight group-hover:text-primary transition-colors">{req.title}</h3>
                           <div className="flex items-center gap-6 mt-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic flex items-center gap-2"><Building className="w-3.5 h-3.5" /> {req.institution}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(req.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                     </div>
                      <button 
                         onClick={() => setSelectedRequest(req)}
                         className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] text-zinc-300 hover:text-primary transition-all cursor-pointer"
                      >
                         <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                      </button>
                  </div>
                ))
              )}
           </div>
        </div>
      ) : (
        <div className="space-y-12">
           <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-12 relative w-full">
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex flex-col items-center gap-4 relative z-10 bg-white px-8">
                     <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all duration-700 border-2 ${
                       step === i ? "bg-primary text-white border-primary scale-110 shadow-2xl shadow-primary/30" : 
                       step > i ? "bg-emerald-500 text-white border-emerald-500" : 
                       "bg-zinc-50 text-zinc-200 border-zinc-100"
                     }`}>
                       {step > i ? <CheckCircle2 className="w-8 h-8" /> : i}
                     </div>
                     <p className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${
                       step === i ? "text-primary" : "text-zinc-300"
                     }`}>
                       {i === 1 ? "Profil" : i === 2 ? "Riset" : "Berkas"}
                     </p>
                   </div>
                 ))}
                 <button onClick={() => setShowForm(false)} className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-500 border-b-2 border-red-100 hover:border-red-500 transition-all italic">Batalkan Pengajuan</button>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="bg-white border border-zinc-50 rounded-[5rem] p-12 lg:p-20 shadow-2xl shadow-primary/[0.04] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
              
              {step === 1 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Identitas Lengkap (Sesuai KTM)</label>
                       <div className="relative group">
                          <User className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="Masukkan Nama Lengkap Peneliti..." 
                            value={form.supervisorName} // Using supervisorName as placeholder for generic name or update schema
                            onChange={e => setForm({...form, supervisorName: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Institusi / Universitas</label>
                       <div className="relative group">
                          <Building className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="Contoh: Universitas Sumatera Utara..." 
                            value={form.institution}
                            onChange={e => setForm({...form, institution: e.target.value})}
                          />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Judul Penelitian</label>
                       <input 
                        required 
                        className="w-full px-10 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-sm tracking-tight italic shadow-inner"
                        placeholder="Masukkan Judul Skripsi / Tesis..." 
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Data Yang Dibutuhkan</label>
                          <textarea 
                            required rows={6} 
                            className="w-full px-10 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                            placeholder="Sebutkan rincian data (Contoh: Realisasi PAD 2021-2025)..." 
                            value={form.dataNeeded}
                            onChange={e => setForm({...form, dataNeeded: e.target.value})}
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Tujuan Penelitian</label>
                          <textarea 
                            required rows={6} 
                            className="w-full px-10 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                            placeholder="Jelaskan tujuan riset ini dilakukan..." 
                            value={form.purpose}
                            onChange={e => setForm({...form, purpose: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Abstrak / Deskripsi Singkat</label>
                       <textarea 
                        required rows={4} 
                        className="w-full px-10 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                        placeholder="Deskripsi singkat mengenai riset Anda..." 
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                       />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                  <div className="p-16 border-2 border-dashed border-zinc-100 rounded-[4rem] bg-zinc-50/50 group hover:border-primary/20 transition-all text-center shadow-inner relative overflow-hidden">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl relative z-10">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter uppercase italic mb-3 relative z-10">Unggah Dokumen Pengantar.</p>
                    <p className="text-sm text-zinc-400 font-medium italic mb-10 max-w-md mx-auto relative z-10">Unggah scan Surat Pengantar Riset dari Universitas (Format PDF, Maks. 5MB).</p>
                    <button type="button" className="px-12 py-5 bg-white text-zinc-900 border border-zinc-100 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl relative z-10">Pilih Berkas PDF</button>
                  </div>
                  
                  <div className="p-10 bg-primary/5 border border-primary/10 rounded-[3rem] flex gap-8 items-start">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Info className="w-6 h-6 text-primary" /></div>
                    <p className="text-sm text-zinc-500 italic font-medium leading-relaxed">
                      &quot;Integritas data riset adalah prioritas kami. Seluruh permohonan akan diverifikasi secara manual oleh Pusat Data Bapenda. Mohon gunakan data secara bijak dan hanya untuk kepentingan akademis.&quot;
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-6 mt-16 pt-12 border-t border-zinc-50">
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="h-20 px-12 bg-zinc-50 text-zinc-400 font-black rounded-full hover:bg-zinc-100 transition-all border border-zinc-100 uppercase text-[10px] tracking-widest shadow-inner"
                  >
                    Sebelumnya
                  </button>
                )}
                
                {step < 3 ? (
                  <button 
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex-1 h-20 bg-primary text-white font-black rounded-full hover:scale-[1.02] transition-all active:scale-95 shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 uppercase text-xs tracking-widest italic"
                  >
                    Tahap Selanjutnya <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    disabled={loading}
                    type="submit"
                    className="flex-1 h-20 bg-primary text-white font-black rounded-full hover:scale-[1.02] transition-all active:scale-95 shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 uppercase text-xs tracking-widest italic disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Finalisasi & Kirim Pengajuan</>}
                  </button>
                )}
              </div>
           </form>
        </div>
      )}
      {/* ── Detail Modal ── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-300 text-left">
           <Card padding="none" className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-zinc-100 animate-in zoom-in-95 duration-300 relative p-8">
              <div className="flex items-start justify-between mb-6">
                 <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400">Rincian Pengajuan Riset Anda</span>
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

                 {selectedRequest.description && (
                    <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                       <p className="text-[9px] font-black uppercase text-zinc-400">Deskripsi / Abstrak</p>
                       <p className="text-zinc-650 font-medium font-sans leading-relaxed">{selectedRequest.description}</p>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Institusi / Kampus</p>
                       <p className="text-zinc-800 text-xs font-black uppercase tracking-wider">{selectedRequest.institution}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Dosen Pembimbing</p>
                       <p className="text-zinc-800 text-xs font-black">{selectedRequest.supervisorName || "—"}</p>
                    </div>
                 </div>

                 {selectedRequest.dataNeeded && (
                    <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                       <p className="text-[9px] font-black uppercase text-zinc-400">Data Yang Dibutuhkan</p>
                       <p className="text-zinc-700 font-medium font-sans leading-relaxed">{selectedRequest.dataNeeded}</p>
                    </div>
                 )}

                 {selectedRequest.purpose && (
                    <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                       <p className="text-[9px] font-black uppercase text-zinc-400">Tujuan Penelitian</p>
                       <p className="text-zinc-700 font-medium font-sans leading-relaxed">{selectedRequest.purpose}</p>
                    </div>
                 )}

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
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Tanggal Diajukan</p>
                    <p className="text-zinc-500 font-medium font-sans">{new Date(selectedRequest.createdAt).toLocaleString("id-ID")}</p>
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
