"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  FileText, Download, Eye, Search, Loader2, 
  Building2, Calendar, CreditCard, ChevronRight, X, Printer, ShieldAlert
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

function formatCurrency(val: number | string | null) {
  if (val === null || val === undefined) return "Rp 0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

export default function UserSpptPage() {
  const { toast } = useToast();
  const [sppts, setSppts] = useState<Sppt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedSppt, setSelectedSppt] = useState<Sppt | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
      
      await handleMarkAsDownloaded(sppt.id);
      
      toast("Berhasil", "Dokumen PDF telah berhasil diunduh.", "success");
    } catch (err) {
      console.error("Failed to generate/download PDF:", err);
      toast("Error", "Gagal memproses dokumen PDF.", "error");
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const fetchSppts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sppt");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSppts(data);
    } catch {
      toast("Kesalahan Sistem", "Gagal memanggil database dokumen SPPT Anda.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSppts();
  }, [fetchSppts]);

  const handleMarkAsDownloaded = async (spptId: string) => {
    try {
      const res = await fetch(`/api/sppt/${spptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDownloaded: true }),
      });
      if (res.ok) {
        setSppts((prev) =>
          prev.map((s) => (s.id === spptId ? { ...s, isDownloaded: true } : s))
        );
      }
    } catch (err) {
      console.error("Failed to update download status", err);
    }
  };

  const getFilteredSppts = () => {
    return sppts.filter((sppt) => {
      const matchSearch = 
        sppt.spptNumber.toLowerCase().includes(search.toLowerCase()) ||
        sppt.taxObject.nop.toLowerCase().includes(search.toLowerCase()) ||
        sppt.taxObject.name.toLowerCase().includes(search.toLowerCase());
      
      const matchPeriod = selectedPeriod === "ALL" || sppt.taxPeriod === selectedPeriod;
      
      return matchSearch && matchPeriod;
    });
  };

  // Get unique tax periods for filter dropdown
  const periods = ["ALL", ...Array.from(new Set(sppts.map((s) => s.taxPeriod))).sort().reverse()];

  const filtered = getFilteredSppts();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">SPPT Digital PBB-P2</p>
          </div>
          <h1 className="text-3xl font-black italic uppercase text-foreground tracking-tight">Dokumen SPPT Digital</h1>
          <p className="text-zinc-500 max-w-2xl font-medium text-sm">
            Lihat, cetak pratinjau, dan unduh dokumen Surat Pemberitahuan Pajak Terutang (SPPT) resmi Anda secara online.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-visible relative z-30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor SPPT, NOP, atau nama objek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-semibold"
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p === "ALL" ? "Semua Tahun" : `Tahun ${p}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main List */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg" className="border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center p-20 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 text-zinc-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-700">Tidak Ada SPPT Terbit</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-2 font-medium">
            Sistem belum mendeteksi adanya rilis SPPT digital untuk nomor objek pajak Anda pada kriteria pencarian ini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sppt) => {
            const njopVal = typeof sppt.njop === "string" ? parseFloat(sppt.njop) : Number(sppt.njop || 0);
            return (
              <Card 
                key={sppt.id} 
                padding="lg" 
                className="bg-white border-zinc-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all group flex flex-col justify-between min-h-[320px]"
              >
                <div>
                  {/* Badge & Period */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 bg-primary/10 border border-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-wider">
                      Tahun {sppt.taxPeriod}
                    </span>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      sppt.isDownloaded 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {sppt.isDownloaded ? "Terunduh" : "Baru"}
                    </span>
                  </div>

                  {/* SPPT Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Nomor SPPT</p>
                      <h4 className="font-black text-zinc-800 tracking-tight">{sppt.spptNumber}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">NOP Aset</p>
                      <p className="text-zinc-600 font-bold text-sm">{sppt.taxObject.nop}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Nama Objek</p>
                      <p className="text-zinc-800 font-bold text-sm">{sppt.taxObject.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Pajak Terutang (PBB)</p>
                      <p className="text-rose-600 font-black text-xl leading-none">{formatCurrency(sppt.taxObjectVal)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-zinc-100">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedSppt(sppt);
                      setIsPreviewOpen(true);
                    }}
                    className="rounded-xl h-11 text-xs font-black uppercase tracking-wider"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Pratinjau
                  </Button>
                  
                  <Button 
                    onClick={() => handleDownloadPDF(sppt)}
                    disabled={pdfGeneratingId === sppt.id}
                    className="w-full rounded-xl h-11 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white"
                  >
                    {pdfGeneratingId === sppt.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" /> Unduh PDF
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* HTML Premium High-Fidelity Preview Modal */}
      {isPreviewOpen && selectedSppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-100 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Modal Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-8 py-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-black uppercase tracking-tight text-zinc-800">Pratinjau SPPT PBB-P2</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none mt-1">Dokumen Resmi Digital Kota Medan</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={async () => {
                    const spptToDownload = selectedSppt;
                    setIsPreviewOpen(false);
                    await handleDownloadPDF(spptToDownload);
                  }}
                  disabled={pdfGeneratingId === selectedSppt.id}
                  size="sm"
                  className="rounded-full bg-primary text-white hover:bg-primary/90 text-[10px] font-black uppercase tracking-wider px-6 h-10"
                >
                  {pdfGeneratingId === selectedSppt.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  ) : (
                    <Download className="w-3.5 h-3.5 mr-2" />
                  )}
                  Unduh PDF
                </Button>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>
            </div>

            {/* Simulated Paper Sheet */}
            <div className="p-8 md:p-12 max-w-3xl mx-auto my-6 bg-white border border-zinc-200 shadow-2xl rounded-2xl text-xs relative select-none">
              
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-5">
                <p className="text-8xl font-black rotate-[-30deg] uppercase select-none text-zinc-800">BAPENDA MEDAN</p>
              </div>

              <div className="space-y-8 relative z-10 text-zinc-800">
                {/* Official Header */}
                <div className="border-b-4 border-double border-zinc-800 pb-4 text-center">
                  <h2 className="text-base font-black uppercase tracking-wide">Pemerintah Kota Medan</h2>
                  <h3 className="text-sm font-black uppercase tracking-wide">Badan Pendapatan Daerah</h3>
                  <p className="text-[9px] text-zinc-500 font-medium">Jalan Balaikota No. 1, Kota Medan, Sumatera Utara</p>
                </div>

                {/* Form Title */}
                <div className="text-center space-y-1">
                  <h4 className="text-xs font-black tracking-wider underline">SURAT PEMBERITAHUAN PAJAK TERUTANG</h4>
                  <p className="text-[10px] font-bold text-zinc-500">PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN (PBB-P2)</p>
                  <p className="text-[11px] font-black tracking-widest mt-2 bg-zinc-100 inline-block px-4 py-1 rounded">TAHUN PAJAK: {selectedSppt.taxPeriod}</p>
                </div>

                {/* A. Identitas Objek & Wajib Pajak */}
                <div className="border border-zinc-300 rounded-lg p-4 space-y-2">
                  <div className="bg-zinc-50 px-2 py-1 -mx-4 -mt-4 border-b border-zinc-300 rounded-t-lg font-black uppercase text-[10px] tracking-wider text-zinc-600">
                    A. IDENTITAS OBJEK & WAJIB PAJAK
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-500">Nomor Objek Pajak (NOP)</span>
                    <span className="col-span-2 font-black text-zinc-800">{selectedSppt.taxObject.nop}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-500">Letak Objek Pajak</span>
                    <span className="col-span-2 font-medium">{selectedSppt.taxObject.address}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200">
                    <span className="font-bold text-zinc-500">Nama Wajib Pajak</span>
                    <span className="col-span-2 font-black text-zinc-800">{selectedSppt.user.name || "—"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-500">Alamat Wajib Pajak</span>
                    <span className="col-span-2 font-medium">{selectedSppt.user.address || "—"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold text-zinc-500">NIK Wajib Pajak</span>
                    <span className="col-span-2 font-medium">{selectedSppt.user.nik || "—"}</span>
                  </div>
                </div>

                {/* B. Rincian Objek Pajak & NJOP */}
                <div className="border border-zinc-300 rounded-lg p-4 space-y-2">
                  <div className="bg-zinc-50 px-2 py-1 -mx-4 -mt-4 border-b border-zinc-300 rounded-t-lg font-black uppercase text-[10px] tracking-wider text-zinc-600">
                    B. RINCIAN OBJEK PAJAK & NJOP
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-300 text-zinc-500 font-bold uppercase text-[9px]">
                        <th className="py-2">Golongan Objek</th>
                        <th className="py-2 text-center">Luas (m²)</th>
                        <th className="py-2 text-right">NJOP per m²</th>
                        <th className="py-2 text-right">Total NJOP (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="py-2 font-bold">1. BUMI (TANAH)</td>
                        <td className="py-2 text-center">{selectedSppt.taxObject.luasTanah || 0}</td>
                        <td className="py-2 text-right">{formatCurrency(
                          (typeof selectedSppt.njop === "string" ? parseFloat(selectedSppt.njop) : Number(selectedSppt.njop || 0)) * 0.6 / (selectedSppt.taxObject.luasTanah || 1)
                        )}</td>
                        <td className="py-2 text-right">{formatCurrency(
                          (typeof selectedSppt.njop === "string" ? parseFloat(selectedSppt.njop) : Number(selectedSppt.njop || 0)) * 0.6
                        )}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold">2. BANGUNAN</td>
                        <td className="py-2 text-center">{selectedSppt.taxObject.luasBangun || 0}</td>
                        <td className="py-2 text-right">{formatCurrency(
                          (typeof selectedSppt.njop === "string" ? parseFloat(selectedSppt.njop) : Number(selectedSppt.njop || 0)) * 0.4 / (selectedSppt.taxObject.luasBangun || 1)
                        )}</td>
                        <td className="py-2 text-right">{formatCurrency(
                          (typeof selectedSppt.njop === "string" ? parseFloat(selectedSppt.njop) : Number(selectedSppt.njop || 0)) * 0.4
                        )}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* C. Perhitungan PBB */}
                <div className="border border-zinc-300 rounded-lg p-4 space-y-2">
                  <div className="bg-zinc-50 px-2 py-1 -mx-4 -mt-4 border-b border-zinc-300 rounded-t-lg font-black uppercase text-[10px] tracking-wider text-zinc-600">
                    C. PERHITUNGAN PAJAK BUMI DAN BANGUNAN
                  </div>
                  <div className="space-y-1.5 font-medium">
                    <div className="flex justify-between">
                      <span>TOTAL NILAI JUAL OBJEK PAJAK (NJOP)</span>
                      <span className="font-bold">{formatCurrency(selectedSppt.njop)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NILAI JUAL OBJEK PAJAK TIDAK KENA PAJAK (NJOPTKP)</span>
                      <span>{formatCurrency(selectedSppt.njoptkp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NILAI JUAL OBJEK PAJAK UNTUK PERHITUNGAN PAJAK</span>
                      <span className="font-bold">{formatCurrency(Math.max(0, Number(selectedSppt.njop) - Number(selectedSppt.njoptkp)))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TARIF PAJAK EFEKTIF (KOTA MEDAN)</span>
                      <span>0.15%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-200 text-rose-600 font-black text-sm">
                      <span>PAJAK BUMI DAN BANGUNAN YANG TERUTANG</span>
                      <span>{formatCurrency(selectedSppt.taxObjectVal)}</span>
                    </div>
                  </div>
                </div>

                {/* D. Informasi Jatuh Tempo */}
                <div className="border border-zinc-300 rounded-lg p-4 space-y-1">
                  <div className="bg-zinc-50 px-2 py-1 -mx-4 -mt-4 border-b border-zinc-300 rounded-t-lg font-black uppercase text-[10px] tracking-wider text-zinc-600">
                    D. INFORMASI JATUH TEMPO & PEMBAYARAN
                  </div>
                  <p className="font-medium pt-1">
                    JATUH TEMPO PEMBAYARAN: <span className="font-black text-rose-600">31 AGUSTUS {selectedSppt.taxPeriod}</span>
                  </p>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    Pembayaran dapat dilakukan melalui Bank Sumut, Bank Mandiri, BNI, BRI, Tokopedia, Indomaret, Alfamart, atau Virtual Account / QRIS di aplikasi SIPADA Medan.
                  </p>
                </div>

                {/* E. Penutup & Tanda Tangan */}
                <div className="flex justify-between items-end pt-8">
                  <div className="space-y-1 text-zinc-500 text-[10px]">
                    <p>Dokumen ini sah diterbitkan secara digital.</p>
                    <p>ID Transaksi: {selectedSppt.id}</p>
                    <p>Waktu Cetak: {new Date().toLocaleString("id-ID")}</p>
                  </div>
                  <div className="w-56 text-center space-y-1">
                    <p className="font-bold uppercase">Kepala Badan Pendapatan Daerah</p>
                    <p className="font-bold uppercase">Kota Medan</p>
                    {/* Simulated Sign/QR */}
                    <div className="w-20 h-20 border border-zinc-300 mx-auto my-2 flex flex-col items-center justify-center p-1.5 bg-zinc-50 rounded">
                      <span className="font-black text-[7px] text-emerald-600">DIGITAL</span>
                      <span className="font-black text-[7px] text-emerald-600">SIGNATURE</span>
                      <span className="text-[6px] text-zinc-400 mt-1">VERIFIED</span>
                    </div>
                    <p className="font-bold underline text-zinc-800">Drs. H. Endar Sutan Lubis, M.Si</p>
                    <p className="text-[10px] text-zinc-500">NIP. 19680512 199303 1 004</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
