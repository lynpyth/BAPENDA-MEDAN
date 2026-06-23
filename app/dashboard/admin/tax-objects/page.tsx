"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Search, 
  ArrowRight, 
  Loader2, 
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Layers,
  Map,
  DollarSign
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TaxObject {
  id: string;
  nop: string;
  type: string;
  name: string;
  address: string;
  status: string;
  luasTanah: number | null;
  luasBangun: number | null;
  njop: number | string | null;
  njoptkp: number | string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  owner: { name: string; email: string };
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/5",
  VERIFIED: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-500/5",
  REJECTED: "bg-red-50 text-red-600 border-red-200 shadow-sm shadow-red-500/5",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};

function formatCurrency(val: number | string | null) {
  if (val === null || val === undefined) return "Rp —";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp —";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

export default function AdminTaxObjectsPage() {
  const { toast } = useToast();
  const [objects, setObjects] = useState<TaxObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Modal state
  const [selectedObj, setSelectedObj] = useState<TaxObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tax-objects");
      const data = await res.json();
      setObjects(data || []);
    } catch {
      toast("Error", "Gagal memuat semua objek pajak.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/tax-objects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      
      const updatedList = objects.map(o => o.id === id ? { ...o, status } : o);
      setObjects(updatedList);
      
      // Update selected object state in modal if open
      if (selectedObj && selectedObj.id === id) {
        setSelectedObj({ ...selectedObj, status });
      }
      
      toast("Berhasil", `Status objek pajak diperbarui menjadi ${status === "VERIFIED" ? "Terverifikasi" : "Ditolak"}.`, "success");
    } catch {
      toast("Error", "Gagal memperbarui status.", "error");
    } finally {
      setProcessing(null);
    }
  };

  // Get unique tax types for filtering
  const uniqueTypes = Array.from(new Set(objects.map(o => o.type)));

  const filtered = objects.filter(o => {
    const matchSearch = 
      o.name.toLowerCase().includes(search.toLowerCase()) || 
      o.nop.includes(search) ||
      o.owner.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    const matchType = filterType === "ALL" || o.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const openDetailModal = (obj: TaxObject) => {
    setSelectedObj(obj);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedObj(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-primary">
              <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Global Asset Registry</p>
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
             Objek <span className="text-primary italic">Pajak.</span>
           </h1>
           <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
              &quot;Administrasi dan validasi seluruh Objek Pajak (NOP) yang terdaftar dalam sistem Bapenda Medan untuk menjamin akurasi basis data fiskal.&quot;
           </p>
        </div>
        <div className="flex items-center gap-6">
            <Card padding="lg" variant="outline" className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] shadow-inner py-4 px-8 min-w-[200px] text-right">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] italic leading-none">Total Nodes</p>
                  <p className="text-2xl font-black italic tracking-tighter uppercase">{objects.length} <span className="text-primary tracking-normal font-sans text-xs">Aset</span></p>
               </div>
            </Card>
        </div>
      </div>

      {/* ── Quick Controls & Filters ── */}
      <div className="flex flex-col gap-6 pt-6 bg-zinc-50/50 p-6 rounded-[3rem] border border-zinc-100/80 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-all" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NOP, Nama Objek, atau Nama Pemilik..."
              className="w-full pl-20 pr-10 h-18 bg-white border border-zinc-200/80 rounded-[2rem] outline-none shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-base tracking-tight italic"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-[2rem] border border-zinc-100 shadow-inner">
            {["ALL", "PENDING", "VERIFIED", "REJECTED"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filterStatus === s ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-400 hover:text-zinc-900"
                )}
              >
                {statusLabel[s] || s}
              </button>
            ))}
          </div>

          {/* Type Filter Select */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 italic">Tipe Pajak:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-12 px-6 bg-white border border-zinc-200 rounded-[1.2rem] text-xs font-black uppercase tracking-widest text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm"
            >
              <option value="ALL">SEMUA TIPE</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Global Registry Table ── */}
      <Card padding="none" className="overflow-hidden border border-zinc-100 rounded-[3.5rem] shadow-xl shadow-primary/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">No. Objek Pajak (NOP)</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Nama Objek & Tipe</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Luas Area</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Pemilik</th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-10 py-8"><div className="h-5 bg-zinc-100 rounded-lg w-32" /></td>
                    <td className="px-8 py-8">
                      <div className="h-5 bg-zinc-100 rounded-lg w-48 mb-2" />
                      <div className="h-3 bg-zinc-100 rounded-lg w-20" />
                    </td>
                    <td className="px-8 py-8"><div className="h-5 bg-zinc-100 rounded-lg w-24" /></td>
                    <td className="px-8 py-8"><div className="h-5 bg-zinc-100 rounded-lg w-28" /></td>
                    <td className="px-8 py-8"><div className="h-6 bg-zinc-100 rounded-full w-24 mx-auto" /></td>
                    <td className="px-10 py-8"><div className="h-10 bg-zinc-100 rounded-full w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <Building2 className="w-16 h-16 mx-auto text-zinc-200 mb-6" />
                    <p className="text-lg font-black italic tracking-tighter text-zinc-400 uppercase">Tidak ada objek pajak yang sesuai kriteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(obj => (
                  <tr key={obj.id} className="hover:bg-zinc-50/50 transition-colors group">
                    {/* NOP */}
                    <td className="px-10 py-7">
                      <span className="font-mono font-bold text-zinc-700 bg-zinc-50 border border-zinc-100/60 px-4 py-2 rounded-xl text-xs block w-fit shadow-inner">
                        {obj.nop}
                      </span>
                    </td>
                    
                    {/* Name & Type */}
                    <td className="px-8 py-7">
                      <div className="space-y-1.5 text-left">
                        <p className="font-black italic tracking-tight text-zinc-900 group-hover:text-primary transition-colors text-base leading-none uppercase">{obj.name}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {obj.type}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[200px] block italic">
                            {obj.address}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Area Size */}
                    <td className="px-8 py-7">
                      <div className="space-y-1 text-left">
                        <p className="text-xs font-black italic text-zinc-800">
                          T: <span className="text-zinc-600 font-sans tracking-normal">{obj.luasTanah ?? 0}</span> m²
                        </p>
                        <p className="text-xs font-black italic text-zinc-800">
                          B: <span className="text-zinc-600 font-sans tracking-normal">{obj.luasBangun ?? 0}</span> m²
                        </p>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="text-left leading-none">
                          <p className="font-bold text-xs text-zinc-800">{obj.owner.name}</p>
                          <p className="text-[10px] text-zinc-400 italic mt-0.5">{obj.owner.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-7 text-center">
                      <span className={cn("inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none", statusBadge[obj.status])}>
                        {statusLabel[obj.status] || obj.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick View Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDetailModal(obj)}
                          className="w-10 h-10 border-zinc-100 hover:border-primary/20 hover:text-primary hover:bg-primary/5 rounded-xl transition-all shadow-sm"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Direct Approval Controls for Pending */}
                        {obj.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={processing === obj.id}
                              onClick={() => handleUpdateStatus(obj.id, "VERIFIED")}
                              className="w-10 h-10 border-emerald-100 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                              title="Setujui Verifikasi"
                            >
                              {processing === obj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={processing === obj.id}
                              onClick={() => handleUpdateStatus(obj.id, "REJECTED")}
                              className="w-10 h-10 border-red-100 hover:border-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                              title="Tolak Verifikasi"
                            >
                              {processing === obj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Detail Modal ── */}
      {isModalOpen && selectedObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-zinc-100 rounded-[3.5rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="space-y-1 text-left">
                <p className="text-[9px] font-black uppercase text-primary tracking-[0.3em] italic leading-none">Identitas Objek Pajak</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 leading-tight uppercase">{selectedObj.name}</h3>
              </div>
              <button 
                onClick={closeDetailModal}
                className="w-12 h-12 rounded-full border border-zinc-100 hover:border-zinc-200 bg-white flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:rotate-90 transition-all shadow-sm shadow-zinc-500/5 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-10 py-10 overflow-y-auto space-y-10 text-left">
              
              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] shadow-inner">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Nomor Objek Pajak</p>
                  <p className="text-base font-mono font-bold text-zinc-800">{selectedObj.nop}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Tipe Klasifikasi</p>
                  <p className="text-base font-black uppercase text-primary italic">{selectedObj.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Status Verifikasi</p>
                  <span className={cn("inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none mt-1", statusBadge[selectedObj.status])}>
                    {statusLabel[selectedObj.status] || selectedObj.status}
                  </span>
                </div>
              </div>

              {/* Physical Area & Valuation Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 italic">
                  <Layers className="w-4 h-4 text-primary" /> Dimensi & Nilai Jual
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Luas Tanah</p>
                    <p className="text-2xl font-black italic tracking-tighter text-zinc-800 mt-1">{selectedObj.luasTanah ?? 0} <span className="text-xs font-sans tracking-normal font-bold text-primary">M²</span></p>
                  </div>
                  <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Luas Bangunan</p>
                    <p className="text-2xl font-black italic tracking-tighter text-zinc-800 mt-1">{selectedObj.luasBangun ?? 0} <span className="text-xs font-sans tracking-normal font-bold text-primary">M²</span></p>
                  </div>
                  <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm text-left col-span-1 md:col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between italic">
                      <span>NJOP Tahun Berjalan</span>
                      <DollarSign className="w-3 h-3 text-zinc-300" />
                    </p>
                    <p className="text-2xl font-black italic tracking-tighter text-emerald-600 mt-1">{formatCurrency(selectedObj.njop)}</p>
                  </div>
                </div>
                {selectedObj.njoptkp && (
                  <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm max-w-sm">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">NJOPTKP (Nilai Tidak Kena Pajak)</p>
                    <p className="text-xl font-black italic tracking-tighter text-zinc-500 mt-1">{formatCurrency(selectedObj.njoptkp)}</p>
                  </div>
                )}
              </div>

              {/* Owner and Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Owner info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 italic">
                    <User className="w-4 h-4 text-primary" /> Kepemilikan Wajib Pajak
                  </h4>
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm space-y-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Nama Lengkap</p>
                      <p className="font-bold text-zinc-800 text-sm mt-0.5">{selectedObj.owner.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Email Korespondensi</p>
                      <p className="font-mono text-zinc-500 text-xs mt-0.5">{selectedObj.owner.email}</p>
                    </div>
                  </div>
                </div>

                {/* Location Address & Map coordinates */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 italic">
                    <Map className="w-4 h-4 text-primary" /> Geospasial & Alamat
                  </h4>
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm space-y-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> Alamat Fisik
                      </p>
                      <p className="text-xs text-zinc-600 font-semibold mt-1 line-clamp-2 italic">{selectedObj.address}</p>
                    </div>
                    
                    {selectedObj.lat && selectedObj.lng && (
                      <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Koordinat GPS</p>
                          <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{selectedObj.lat.toFixed(5)}, {selectedObj.lng.toFixed(5)}</p>
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedObj.lat},${selectedObj.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Google Maps <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Log Audit */}
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 italic pt-4 border-t border-zinc-50">
                Aset Terdaftar Tanggal: {new Date(selectedObj.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="px-10 py-8 border-t border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                {selectedObj.status === "PENDING" ? (
                  <>
                    <Button 
                      disabled={processing === selectedObj.id}
                      onClick={() => handleUpdateStatus(selectedObj.id, "VERIFIED")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10 flex items-center gap-2 h-14 px-8"
                    >
                      {processing === selectedObj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Setujui Data</>}
                    </Button>
                    <Button 
                      variant="outline"
                      disabled={processing === selectedObj.id}
                      onClick={() => handleUpdateStatus(selectedObj.id, "REJECTED")}
                      className="border-red-200 text-red-500 hover:bg-red-50 rounded-full font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 h-14 px-8"
                    >
                      {processing === selectedObj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Tolak Data</>}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2.5 opacity-60 text-zinc-400">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Aset ini sudah di-audit oleh Administrator</p>
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                onClick={closeDetailModal}
                className="rounded-full font-black uppercase text-[10px] tracking-widest h-14 px-8"
              >
                Tutup Window
              </Button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

