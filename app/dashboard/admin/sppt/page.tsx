"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  FileText, Download, Eye, Search, Loader2, Plus, Trash2,
  Building2, Calendar, CreditCard, ChevronRight, X, AlertTriangle, Filter, CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";


interface Sppt {
  id: string;
  spptNumber: string;
  taxPeriod: string;
  njop: any;
  njoptkp: any;
  taxObjectVal: any;
  isDownloaded: boolean;
  createdAt: string;
  taxObject: {
    id: string;
    nop: string;
    name: string;
    address: string;
    luasTanah: number | null;
    luasBangun: number | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    nik: string | null;
    address: string | null;
  };
}

interface TaxObject {
  id: string;
  nop: string;
  name: string;
  address: string;
  njop: any;
  njoptkp: any;
  owner: {
    id: string;
    name: string | null;
  };
}

function formatCurrency(val: number | string | null) {
  if (val === null || val === undefined) return "Rp 0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

export default function AdminSpptPage() {
  const { toast } = useToast();
  const [sppts, setSppts] = useState<Sppt[]>([]);
  const [taxObjects, setTaxObjects] = useState<TaxObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, DOWNLOADED, NEW
  
  // Issuance Modal States
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [selectedTaxObject, setSelectedTaxObject] = useState<TaxObject | null>(null);
  const [taxPeriod, setTaxPeriod] = useState(new Date().getFullYear().toString());
  const [customNjop, setCustomNjop] = useState("0");
  const [customNjoptkp, setCustomNjoptkp] = useState("0");
  const [customPbb, setCustomPbb] = useState("0");
  const [searchTaxObject, setSearchTaxObject] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadPDF = async (sppt: Sppt) => {
    setPdfGeneratingId(sppt.id);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { DigitalSpptDocument } = await import("@/components/sppt/DigitalSppt");
      
      const blob = await pdf(<DigitalSpptDocument data={sppt as any} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `SPPT_${sppt.taxPeriod}_${sppt.taxObject.nop}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      // Update download status
      await fetch(`/api/sppt/${sppt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDownloaded: true }),
      });
      
      setSppts((prev) =>
        prev.map((s) => (s.id === sppt.id ? { ...s, isDownloaded: true } : s))
      );
      
      toast("Berhasil", "Dokumen PDF telah berhasil diunduh.", "success");
    } catch (err) {
      console.error("Failed to generate/download PDF:", err);
      toast("Error", "Gagal memproses dokumen PDF.", "error");
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [spptRes, objRes] = await Promise.all([
        fetch("/api/sppt"),
        fetch("/api/admin/tax-objects")
      ]);
      if (!spptRes.ok || !objRes.ok) throw new Error();
      const spptData = await spptRes.json();
      const objData = await objRes.json();
      setSppts(spptData);
      setTaxObjects(objData);
    } catch {
      toast("Kesalahan Sistem", "Gagal memuat basis data SPPT & Objek Pajak.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle TaxObject Selection and automatic calculations
  const handleSelectTaxObject = (obj: TaxObject) => {
    setSelectedTaxObject(obj);
    const njopVal = Number(obj.njop || 0);
    const njoptkpVal = Number(obj.njoptkp || 12000000); // Standard NJOPTKP Rp 12.000.000
    const taxableNjop = Math.max(0, njopVal - njoptkpVal);
    const pbbVal = Math.round(taxableNjop * 0.0015); // 0.15% standard rate

    setCustomNjop(njopVal.toString());
    setCustomNjoptkp(njoptkpVal.toString());
    setCustomPbb(pbbVal.toString());
  };

  const handleRecalculate = (njop: string, njoptkp: string) => {
    const n = Number(njop || 0);
    const ntkp = Number(njoptkp || 0);
    const taxable = Math.max(0, n - ntkp);
    const pbb = Math.round(taxable * 0.0015);
    setCustomPbb(pbb.toString());
  };

  const handleIssueSppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaxObject) {
      toast("Input Tidak Valid", "Silakan pilih objek pajak terlebih dahulu.", "error");
      return;
    }
    setIssueLoading(true);
    try {
      const res = await fetch("/api/sppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxObjectId: selectedTaxObject.id,
          taxPeriod,
          njop: Number(customNjop),
          njoptkp: Number(customNjoptkp),
          taxObjectVal: Number(customPbb)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal");
      }

      toast("Berhasil", `SPPT Baru untuk NOP ${selectedTaxObject.nop} periode ${taxPeriod} telah diterbitkan.`, "success");
      setIsIssueOpen(false);
      setSelectedTaxObject(null);
      fetchData();
    } catch (err: any) {
      toast("Error", err.message || "Gagal menerbitkan SPPT.", "error");
    } finally {
      setIssueLoading(false);
    }
  };

  const handleDeleteSppt = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan/menghapus penerbitan SPPT ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sppt/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSppts(prev => prev.filter(s => s.id !== id));
      toast("Berhasil", "Penerbitan SPPT telah dibatalkan.", "success");
    } catch {
      toast("Error", "Gagal membatalkan penerbitan SPPT.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = sppts.filter((sppt) => {
    const matchSearch = 
      sppt.spptNumber.toLowerCase().includes(search.toLowerCase()) ||
      sppt.taxObject.nop.toLowerCase().includes(search.toLowerCase()) ||
      (sppt.user.name || "").toLowerCase().includes(search.toLowerCase());
    
    const matchPeriod = filterPeriod === "ALL" || sppt.taxPeriod === filterPeriod;
    
    const matchStatus = 
      filterStatus === "ALL" ||
      (filterStatus === "DOWNLOADED" && sppt.isDownloaded) ||
      (filterStatus === "NEW" && !sppt.isDownloaded);

    return matchSearch && matchPeriod && matchStatus;
  });

  const periods = ["ALL", ...Array.from(new Set(sppts.map((s) => s.taxPeriod))).sort().reverse()];

  // Search tax objects inside modal
  const filteredTaxObjects = taxObjects.filter(obj => 
    obj.nop.includes(searchTaxObject) ||
    obj.name.toLowerCase().includes(searchTaxObject.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Manajemen SPPT Digital</p>
          </div>
          <h1 className="text-3xl font-black italic uppercase text-foreground tracking-tight">Dokumen SPPT Terbit</h1>
          <p className="text-zinc-500 max-w-2xl font-medium text-sm">
            Pantau status unduhan SPPT digital, cetak ulang dokumen, atau terbitkan SPPT baru untuk objek pajak aktif.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsIssueOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full font-black uppercase text-xs tracking-wider h-12 px-8 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Terbitkan SPPT
        </Button>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Total SPPT Terbit</p>
            <h3 className="text-2xl font-black text-zinc-800">{sppts.length}</h3>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm">ALL</div>
        </Card>
        <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sudah Diunduh WP</p>
            <h3 className="text-2xl font-black text-emerald-600">{sppts.filter(s => s.isDownloaded).length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-sm">
            {sppts.length > 0 ? Math.round((sppts.filter(s => s.isDownloaded).length / sppts.length) * 100) : 0}%
          </div>
        </Card>
        <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Belum Diunduh WP</p>
            <h3 className="text-2xl font-black text-amber-600">{sppts.filter(s => !s.isDownloaded).length}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-bold text-sm">
            {sppts.length > 0 ? Math.round((sppts.filter(s => !s.isDownloaded).length / sppts.length) * 100) : 0}%
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-visible relative z-30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor SPPT, NOP, atau nama wajib pajak..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-semibold"
              >
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {p === "ALL" ? "Semua Tahun" : `Tahun ${p}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-semibold"
              >
                <option value="ALL">Semua Status Unduh</option>
                <option value="DOWNLOADED">Sudah Diunduh WP</option>
                <option value="NEW">Belum Diunduh WP</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg" className="border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center p-20 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 text-zinc-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-700">Tidak Ada SPPT Terbit</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-2 font-medium">
            Tidak ada data penerbitan SPPT yang memenuhi kriteria penyaringan yang ditentukan.
          </p>
        </Card>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 tracking-wider bg-zinc-50/50">
                  <th className="py-4 px-6">Nomor SPPT & NOP</th>
                  <th className="py-4 px-6">Wajib Pajak</th>
                  <th className="py-4 px-6 text-center">Tahun Pajak</th>
                  <th className="py-4 px-6 text-right">PBB Terutang</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                {filtered.map((sppt) => (
                  <tr key={sppt.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-black text-zinc-800 block">{sppt.spptNumber}</span>
                        <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">NOP: {sppt.taxObject.nop}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-zinc-800 block">{sppt.user.name || "—"}</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">{sppt.user.email || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 bg-zinc-100 rounded-full font-black text-[10px] tracking-wide text-zinc-600">
                        {sppt.taxPeriod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-black text-zinc-800">
                      {formatCurrency(sppt.taxObjectVal)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block",
                        sppt.isDownloaded 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {sppt.isDownloaded ? "Terunduh" : "Belum Diunduh"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPDF(sppt)}
                          disabled={pdfGeneratingId === sppt.id}
                          title="Download PDF"
                          className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all text-zinc-500"
                        >
                          {pdfGeneratingId === sppt.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSppt(sppt.id)}
                          disabled={deletingId === sppt.id}
                          title="Hapus Penerbitan"
                          className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-zinc-500"
                        >
                          {deletingId === sppt.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Penerbitan SPPT Baru Modal */}
      {isIssueOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-black uppercase tracking-tight text-zinc-800">Penerbitan SPPT Baru</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none mt-1">Rilis Surat Pemberitahuan Pajak Terutang PBB-P2</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsIssueOpen(false);
                  setSelectedTaxObject(null);
                }}
                className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <form onSubmit={handleIssueSppt} className="p-8 space-y-6">
              {/* Select Tax Object Step */}
              {!selectedTaxObject ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Cari Objek Pajak</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cari berdasarkan NOP atau nama objek..."
                        value={searchTaxObject}
                        onChange={(e) => setSearchTaxObject(e.target.value)}
                        className="w-full pl-11 pr-4 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {searchTaxObject ? (
                      filteredTaxObjects.length === 0 ? (
                        <p className="text-center py-6 text-xs text-zinc-400 font-bold">Objek pajak tidak ditemukan.</p>
                      ) : (
                        filteredTaxObjects.map((obj) => (
                          <div 
                            key={obj.id}
                            onClick={() => handleSelectTaxObject(obj)}
                            className="p-4 bg-zinc-50 border border-zinc-100 hover:border-primary/30 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-zinc-800 block text-xs">{obj.nop}</span>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">{obj.name} — {obj.address}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                          </div>
                        ))
                      )
                    ) : (
                      <p className="text-center py-6 text-xs text-zinc-400 font-bold">Masukkan kata kunci NOP / Nama Objek di atas.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Detail Configuration Step */
                <div className="space-y-6">
                  {/* Selected Object Info Card */}
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Objek Pajak Terpilih</span>
                      <span className="font-bold text-zinc-800 block text-sm">{selectedTaxObject.nop}</span>
                      <span className="text-xs text-zinc-500 font-medium">{selectedTaxObject.name} ({selectedTaxObject.owner.name || "WP Anonim"})</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setSelectedTaxObject(null)}
                      className="text-xs font-black uppercase text-zinc-500 hover:text-rose-600"
                    >
                      Ganti
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Tahun Pajak</label>
                      <input
                        type="number"
                        min="2020"
                        max="2035"
                        value={taxPeriod}
                        onChange={(e) => setTaxPeriod(e.target.value)}
                        required
                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">NJOPTKP (Rp)</label>
                      <input
                        type="number"
                        value={customNjoptkp}
                        onChange={(e) => {
                          setCustomNjoptkp(e.target.value);
                          handleRecalculate(customNjop, e.target.value);
                        }}
                        required
                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Total NJOP (Bumi + Bangunan)</label>
                      <input
                        type="number"
                        value={customNjop}
                        onChange={(e) => {
                          setCustomNjop(e.target.value);
                          handleRecalculate(e.target.value, customNjoptkp);
                        }}
                        required
                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">PBB Terutang (0.15%)</label>
                      <input
                        type="number"
                        value={customPbb}
                        onChange={(e) => setCustomPbb(e.target.value)}
                        required
                        className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-black text-rose-600 focus:outline-none focus:border-rose-300"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex justify-between items-center text-xs font-semibold text-zinc-500 bg-zinc-50 -mx-8 -mb-8 p-6 px-8">
                    <span>* Perhitungan PBB otomatis didasarkan pada tarif efektif 0.15%.</span>
                    <Button 
                      type="submit" 
                      disabled={issueLoading}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-8"
                    >
                      {issueLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terbitkan Sekarang"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
