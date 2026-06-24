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
  Map as MapIcon,
  DollarSign,
  Download,
  Calendar,
  Clock,
  FileText,
  ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

interface Payment {
  id: string;
  amount: number;
  status: string;
  taxPeriod: string;
  createdAt: string;
}

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
  payments: Payment[];
}

interface AuditLog {
  id: string;
  action: string;
  table: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
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

const KELURAHANS: Record<string, string[]> = {
  "Medan Baru": ["Padang Bulan Selayang I", "Darussalam", "Babura", "Merdeka", "Titi Rantai"],
  "Medan Petisah": ["Petisah Tengah", "Sekip", "Sei Putih Timur I", "Sei Putih Barat", "Silalas"],
  "Medan Sunggal": ["Sunggal", "Tanjung Rejo", "Lalang", "Babura Sunggal", "Simpang Tanjung"],
  "Medan Helvetia": ["Helvetia Tengah", "Dwikora", "Tanjung Gusta", "Cinta Damai"],
  "Medan Johor": ["Pangkalan Mansyur", "Gedung Johor", "Kedai Durian", "Kwala Bekala"],
  "Medan Area": ["Kotamatsum I", "Kotamatsum II", "Tegal Sari I", "Tegal Sari II", "Pandau Hulu II"],
  "Medan Polonia": ["Polonia", "Sari Rejo", "Anggrung", "Madras Hulu"],
};

function formatCurrency(val: number | string | null) {
  if (val === null || val === undefined) return "Rp —";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp —";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

// ─── PDF Report Template ───
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 8, fontFamily: "Helvetica", color: "#333" },
  title: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 10, textAlign: "center", marginBottom: 15, color: "#666" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", borderBottom: "1 solid #e5e7eb", padding: 6, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottom: "0.5 solid #e5e7eb", padding: 6, alignItems: "center" },
  col1: { width: "120px" },
  col2: { width: "130px" },
  col3: { width: "60px" },
  col4: { width: "60px" },
  col5: { width: "90px" },
  col6: { width: "90px" },
});

const TaxObjectsReport = ({ data }: { data: TaxObject[] }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.title}>LAPORAN DAFTAR OBJEK PAJAK PBB-P2</Text>
      <Text style={styles.subtitle}>BADAN PENDAPATAN DAERAH KOTA MEDAN — TAHUN FISKAL 2026</Text>
      <View>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>NOMOR OBJEK PAJAK (NOP)</Text>
          <Text style={styles.col2}>NAMA OBJEK & ALAMAT</Text>
          <Text style={styles.col3}>TIPE PAJAK</Text>
          <Text style={styles.col4}>LUAS AREA</Text>
          <Text style={styles.col5}>NJOP (RP)</Text>
          <Text style={styles.col6}>NAMA WAJIB PAJAK</Text>
        </View>
        {data.map((obj, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.col1}>{obj.nop}</Text>
            <Text style={styles.col2}>{obj.name}</Text>
            <Text style={styles.col3}>{obj.type}</Text>
            <Text style={styles.col4}>T: {obj.luasTanah} m² / B: {obj.luasBangun} m²</Text>
            <Text style={styles.col5}>{formatCurrency(obj.njop)}</Text>
            <Text style={styles.col6}>{obj.owner.name}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function AdminTaxObjectsPage() {
  const { toast } = useToast();
  const [objects, setObjects] = useState<TaxObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterKecamatan, setFilterKecamatan] = useState("ALL");
  const [filterKelurahan, setFilterKelurahan] = useState("ALL");
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Detail Modal & Logs state
  const [selectedObj, setSelectedObj] = useState<TaxObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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
  }, []);

  const fetchAuditLogs = async (recordId: string) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?table=TaxObject&recordId=${recordId}`);
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch {
      console.error("Failed to load audit logs");
    } finally {
      setLoadingLogs(false);
    }
  };

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
      
      if (selectedObj && selectedObj.id === id) {
        setSelectedObj({ ...selectedObj, status });
        fetchAuditLogs(id); // Reload logs
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
    
    // Region filters
    const matchKecamatan = filterKecamatan === "ALL" || 
      (o.address && o.address.toLowerCase().includes(filterKecamatan.toLowerCase()));
    
    const matchKelurahan = filterKelurahan === "ALL" || 
      (o.address && o.address.toLowerCase().includes(filterKelurahan.toLowerCase()));

    return matchSearch && matchStatus && matchType && matchKecamatan && matchKelurahan;
  });

  const openDetailModal = (obj: TaxObject) => {
    setSelectedObj(obj);
    setIsModalOpen(true);
    fetchAuditLogs(obj.id);
  };

  const closeDetailModal = () => {
    setSelectedObj(null);
    setIsModalOpen(false);
    setAuditLogs([]);
  };

  // Excel (CSV) Export
  const handleExportCSV = () => {
    try {
      const headers = ["NOP", "Nama Objek", "Tipe", "Alamat", "Luas Tanah (m2)", "Luas Bangunan (m2)", "NJOP (Rp)", "Pemilik", "Email Pemilik", "Status"];
      const rows = filtered.map(o => [
        o.nop,
        o.name,
        o.type,
        o.address,
        o.luasTanah ?? 0,
        o.luasBangun ?? 0,
        o.njop ?? 0,
        o.owner.name,
        o.owner.email,
        o.status
      ]);

      const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Daftar_Objek_Pajak_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("Sukses Ekspor", "Berkas CSV berhasil diunduh.", "success");
    } catch {
      toast("Error", "Gagal melakukan ekspor data CSV.", "error");
    }
  };

  const getPaymentStatus = (obj: TaxObject) => {
    if (!obj.payments || obj.payments.length === 0) return "LUNAS";
    const hasArrears = obj.payments.some(p => p.status === "PENDING" || p.status === "EXPIRED");
    return hasArrears ? "MENUNGGAK" : "LUNAS";
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left w-full">
      
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
        <div className="flex items-center gap-4">
            {/* Export Buttons */}
            <Button onClick={handleExportCSV} variant="outline" size="lg" className="h-16 px-6 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase shadow-sm">
              <Download className="w-4 h-4" /> Export CSV (Excel)
            </Button>
            <PDFDownloadLink
              document={<TaxObjectsReport data={filtered} />}
              fileName={`Laporan_Objek_Pajak_${new Date().toISOString().slice(0, 10)}.pdf`}
            >
              {({ loading }: any) => (
                <Button disabled={loading} variant="primary" size="lg" className="h-16 px-6 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase shadow-glow bg-primary text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileText className="w-4 h-4" /> Export PDF</>}
                </Button>
              )}
            </PDFDownloadLink>
        </div>
      </div>

      {/* ── Quick Controls & Filters ── */}
      <div className="flex flex-col gap-6 pt-6 bg-zinc-50/50 p-8 rounded-[3rem] border border-zinc-100 shadow-inner relative z-30 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Quick Search */}
          <div className="md:col-span-4 relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-all" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NOP, Nama Objek, atau Nama Pemilik..."
              className="w-full pl-20 pr-10 h-18 bg-white border border-zinc-150 rounded-[2rem] outline-none shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm tracking-tight italic"
            />
          </div>

          {/* Kecamatan Filter */}
          <div className="md:col-span-2 relative">
            <select
              value={filterKecamatan}
              onChange={(e) => {
                setFilterKecamatan(e.target.value);
                setFilterKelurahan("ALL"); // Reset kelurahan
              }}
              className="w-full h-18 pl-6 pr-12 bg-white border border-zinc-150 rounded-[2rem] text-xs font-black uppercase tracking-widest text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="ALL">SEMUA KECAMATAN</option>
              {Object.keys(KELURAHANS).map(k => (
                <option key={k} value={k}>{k.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Kelurahan Filter */}
          <div className="md:col-span-2 relative">
            <select
              value={filterKelurahan}
              onChange={(e) => setFilterKelurahan(e.target.value)}
              disabled={filterKecamatan === "ALL"}
              className="w-full h-18 pl-6 pr-12 bg-white border border-zinc-150 rounded-[2rem] text-xs font-black uppercase tracking-widest text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="ALL">SEMUA KELURAHAN</option>
              {filterKecamatan !== "ALL" && KELURAHANS[filterKecamatan]?.map(k => (
                <option key={k} value={k}>{k.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2 relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-18 pl-6 pr-12 bg-white border border-zinc-150 rounded-[2rem] text-xs font-black uppercase tracking-widest text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="ALL">SEMUA TIPE</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2 relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-18 pl-6 pr-12 bg-white border border-zinc-150 rounded-[2rem] text-xs font-black uppercase tracking-widest text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer shadow-sm appearance-none"
            >
              <option value="ALL">SEMUA STATUS</option>
              <option value="PENDING">PENDING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Global Registry Table ── */}
      <Card padding="none" className="overflow-hidden border border-zinc-100 rounded-[3.5rem] shadow-xl shadow-primary/[0.02]">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">No. Objek Pajak (NOP)</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Nama Objek & Tipe</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Luas Area</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Pemilik</th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Status Bayar</th>
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
                  <td colSpan={7} className="py-32 text-center">
                    <Building2 className="w-16 h-16 mx-auto text-zinc-200 mb-6" />
                    <p className="text-lg font-black italic tracking-tighter text-zinc-400 uppercase">Tidak ada objek pajak yang sesuai kriteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(obj => {
                  const payStatus = getPaymentStatus(obj);
                  return (
                    <tr key={obj.id} className="hover:bg-zinc-50/50 transition-colors group font-bold text-zinc-800">
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

                      {/* Payment status */}
                      <td className="px-8 py-7 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black border leading-none uppercase tracking-widest",
                          payStatus === "LUNAS" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {payStatus}
                        </span>
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
                            className="w-10 h-10 border-zinc-100 hover:border-primary/20 hover:text-primary hover:bg-primary/5 rounded-xl transition-all shadow-sm cursor-pointer"
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
                                className="w-10 h-10 border-emerald-100 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm cursor-pointer"
                                title="Setujui Verifikasi"
                              >
                                {processing === obj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={processing === obj.id}
                                onClick={() => handleUpdateStatus(obj.id, "REJECTED")}
                                className="w-10 h-10 border-red-100 hover:border-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm cursor-pointer"
                                title="Tolak Verifikasi"
                              >
                                {processing === obj.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Detail Modal ── */}
      {isModalOpen && selectedObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-zinc-100 rounded-[5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh] text-left">
            
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] shadow-inner font-bold text-zinc-800">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Nomor Objek Pajak</p>
                  <p className="text-sm font-mono">{selectedObj.nop}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Tipe Klasifikasi</p>
                  <p className="text-sm font-black uppercase text-primary italic">{selectedObj.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Status Bayar</p>
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-[8px] font-black border leading-none uppercase mt-1",
                    getPaymentStatus(selectedObj) === "LUNAS" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {getPaymentStatus(selectedObj)}
                  </span>
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
                  <Layers className="w-4 h-4 text-primary" /> Dimensi & Nilai Jual (NJOP)
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
                      <span>NJOP Bumi & Bangunan</span>
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
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm space-y-3 font-bold">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Nama Lengkap</p>
                      <p className="text-zinc-800 text-sm mt-0.5">{selectedObj.owner.name}</p>
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
                    <MapIcon className="w-4 h-4 text-primary" /> Geospasial & Alamat Lengkap
                  </h4>
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm space-y-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> Alamat Fisik
                      </p>
                      <p className="text-xs text-zinc-600 font-bold mt-1 line-clamp-2 italic">{selectedObj.address}</p>
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

              {/* Riwayat Perubahan Data Objek Pajak (Audit log timeline) */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <h4 className="text-xs font-black uppercase text-primary tracking-widest border-l-4 border-primary pl-4">Riwayat Perubahan Data Objek Pajak</h4>
                <div className="space-y-4">
                  {loadingLogs ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                  ) : auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between text-xs font-bold">
                        <div>
                          <p className="text-primary font-black uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-zinc-500 mt-1 font-normal">Operator: <span className="text-zinc-800 font-bold">{log.user?.name || "System"}</span></p>
                        </div>
                        <div className="text-right text-zinc-400 font-normal">
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          {new Date(log.createdAt).toLocaleString("id-ID")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic pl-4">Belum ada catatan audit log untuk objek pajak ini.</p>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 italic pt-4">
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
