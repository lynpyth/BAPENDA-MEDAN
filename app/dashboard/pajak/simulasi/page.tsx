"use client";

import { useState } from "react";
import { Calculator, Info, RefreshCw, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TaxType = "PKB" | "BBN_KB" | "PBB_KB" | "P_ROKOK" | "P_REKLAME" | "PAT" | "PBB_P2" | "BPHTB" | "PAB" | "PBJT_HOTEL" | "PBJT_MAMIN" | "PBJT_HIBURAN" | "PBJT_LISTRIK" | "PBJT_PARKIR";

interface SimResult {
  taxType: string;
  baseValue: number;
  rate: number;
  taxAmount: number;
  njoptkp?: number;
  breakdown: Array<{ label: string; value: string }>;
}

const TAX_TYPES: Array<{ id: TaxType; label: string; desc: string; rate: number; unit: string; hasNJOPTKP?: boolean }> = [
  { id: "PKB", label: "Pajak Kendaraan Bermotor (PKB)", desc: "Pajak tahunan kendaraan bermotor", rate: 0.02, unit: "NJKB (Nilai Jual Kendaraan) (Rp)" },
  { id: "BBN_KB", label: "Bea Balik Nama (BBN-KB)", desc: "BBN-KB atas kepemilikan kendaraan", rate: 0.10, unit: "NJKB (Nilai Jual Kendaraan) (Rp)" },
  { id: "PBB_KB", label: "Pajak Bahan Bakar (PBB-KB)", desc: "PBB-KB atas penggunaan bahan bakar", rate: 0.075, unit: "Pembelian Bahan Bakar Sebelum Pajak (Rp)" },
  { id: "P_ROKOK", label: "Pajak Rokok", desc: "Pajak atas cukai tembakau", rate: 0.10, unit: "Cukai Rokok (Rp)" },
  { id: "P_REKLAME", label: "Pajak Reklame", desc: "Pajak pemasangan media reklame/iklan", rate: 0.25, unit: "Nilai Sewa/Kontrak (Rp)" },
  { id: "PAT", label: "Pajak Air Tanah (PAT)", desc: "Pajak pemanfaatan air bawah tanah", rate: 0.20, unit: "Nilai Perolehan Air (NPA) (Rp)" },
  {
    id: "PBB_P2", label: "PBB-P2 (Bumi & Bangunan)", desc: "PBB-P2 untuk tanah & properti",
    rate: 0.0015, unit: "Nilai NJOP (Rp)", hasNJOPTKP: true,
  },
  {
    id: "BPHTB", label: "BPHTB", desc: "Bea Perolehan Hak atas Tanah & Bangunan",
    rate: 0.05, unit: "Nilai Transaksi (Rp)", hasNJOPTKP: true,
  },
  { id: "PAB", label: "Pajak Alat Berat (PAB)", desc: "Pajak atas kepemilikan alat berat", rate: 0.002, unit: "Nilai Jual Alat Berat (Rp)" },
  { id: "PBJT_HOTEL", label: "PBJT Jasa Perhotelan", desc: "PBJT atas penyediaan akomodasi hotel", rate: 0.10, unit: "Omzet Penjualan (Rp)" },
  { id: "PBJT_MAMIN", label: "PBJT Makanan & Minuman", desc: "PBJT atas pelayanan restoran & warung", rate: 0.10, unit: "Omzet Penjualan (Rp)" },
  { id: "PBJT_HIBURAN", label: "PBJT Kesenian & Hiburan", desc: "PBJT atas jasa kesenian & hiburan", rate: 0.15, unit: "Omzet Penjualan (Rp)" },
  { id: "PBJT_LISTRIK", label: "PBJT Tenaga Listrik", desc: "PBJT atas penggunaan tenaga listrik", rate: 0.03, unit: "Biaya Pemakaian Listrik (Rp)" },
  { id: "PBJT_PARKIR", label: "PBJT Jasa Parkir", desc: "PBJT atas penyelenggaraan tempat parkir", rate: 0.10, unit: "Omzet Parkir (Rp)" },
];

// NJOPTKP standard Kota Medan 2025
const NJOPTKP_DEFAULT = 15_000_000;
const BPHTB_NPOPTKP = 60_000_000;

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function formatNumber(val: string) {
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseNumber(val: string) {
  return parseInt(val.replace(/\./g, ""), 10) || 0;
}

export default function SimulasiPajakPage() {
  const [selectedType, setSelectedType] = useState<TaxType>("PBB_P2");
  const [inputValue, setInputValue] = useState("");
  const [njoptkp, setNjoptkp] = useState(NJOPTKP_DEFAULT.toString());
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const taxConfig = TAX_TYPES.find((t) => t.id === selectedType)!;

  const handleCalculate = () => {
    setLoading(true);
    const base = parseNumber(inputValue);
    if (!base) { setLoading(false); return; }

    setTimeout(() => {

      let taxAmount = 0;
      const breakdown: SimResult["breakdown"] = [];

      if (selectedType === "PBB_P2") {
        const njoptkpVal = parseNumber(njoptkp) || NJOPTKP_DEFAULT;
        const njkp = Math.max(0, base - njoptkpVal); 
        taxAmount = njkp * taxConfig.rate;
        breakdown.push(
          { label: "NJOP Bruto", value: formatCurrency(base) },
          { label: "NJOPTKP (Potongan)", value: formatCurrency(njoptkpVal) },
          { label: "Dasar Pengenaan (NJKP)", value: formatCurrency(njkp) },
          { label: `Tarif Efektif`, value: `${(taxConfig.rate * 100).toFixed(1)}%` },
        );
      } else if (selectedType === "BPHTB") {
        const npoptkp = BPHTB_NPOPTKP;
        const npop = Math.max(0, base - npoptkp);
        taxAmount = npop * taxConfig.rate;
        breakdown.push(
          { label: "NPOP (Nilai Transaksi)", value: formatCurrency(base) },
          { label: "NPOPTKP (Potongan)", value: formatCurrency(npoptkp) },
          { label: "Dasar Pengenaan", value: formatCurrency(npop) },
          { label: "Tarif BPHTB", value: "5%" },
        );
      } else {
        taxAmount = base * taxConfig.rate;
        breakdown.push(
          { label: taxConfig.unit, value: formatCurrency(base) },
          { label: "Tarif Pajak", value: `${(taxConfig.rate * 100).toFixed(0)}%` },
        );
      }

      setResult({
        taxType: taxConfig.label,
        baseValue: base,
        rate: taxConfig.rate,
        taxAmount,
        breakdown,
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Header ── */}
      <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
              <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Fiscal Projection Tool</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-foreground leading-none uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            Kalkulator <span className="text-primary italic">Pajak.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Simulasikan estimasi kewajiban pajak Anda berdasarkan regulasi terbaru Pemerintah Kota Medan secara akurat dan transparan.&quot;
          </p>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-center gap-6 bg-blue-50 border border-blue-100 p-8 rounded-[3rem] shadow-inner group">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-blue-50 shrink-0 group-hover:rotate-12 transition-transform">
           <Info className="w-6 h-6 text-blue-500" />
        </div>
        <p className="text-sm font-medium text-blue-700 italic leading-relaxed">
          Hasil simulasi ini bersifat <strong>estimasi (proyeksi)</strong>. Nilai resmi akan diterbitkan melalui Surat Pemberitahuan Pajak Terutang (SPPT) oleh Bapenda Medan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input Console */}
        <div className="lg:col-span-5 space-y-8">
           <Card padding="none" className="bg-white border-zinc-100 rounded-[4rem] shadow-2xl shadow-primary/5 p-10 lg:p-14 space-y-10 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 -z-0">
                 <Calculator className="w-40 h-40" />
              </div>

              <div className="space-y-4 relative z-10">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic pl-6">Pilih Kategori Pajak</label>
                <div className="grid grid-cols-1 gap-3">
                   {TAX_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedType(t.id); setResult(null); setInputValue(""); }}
                      className={cn(
                        "w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group/btn",
                        selectedType === t.id ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-zinc-50 bg-white hover:border-primary/20"
                      )}
                    >
                      <div className="space-y-1">
                        <p className={cn("font-black text-sm uppercase tracking-tight italic", selectedType === t.id ? "text-primary" : "text-foreground")}>{t.label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium italic opacity-60">{t.desc}</p>
                      </div>
                      <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-all", selectedType === t.id ? "bg-primary border-primary text-white" : "border-zinc-100 text-zinc-200 group-hover/btn:border-primary/30")}>
                         <div className={cn("w-2 h-2 rounded-full", selectedType === t.id ? "bg-white" : "bg-zinc-100")} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8 relative z-10 pt-4 border-t border-zinc-50">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic pl-6">{taxConfig.unit}</label>
                   <div className="relative group">
                     <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-xl text-zinc-300 group-focus-within:text-primary transition-colors">Rp</span>
                     <input
                       type="text"
                       placeholder="0"
                       value={inputValue}
                       onChange={(e) => {
                         const raw = e.target.value.replace(/\D/g, "");
                         setInputValue(formatNumber(raw));
                         setResult(null);
                       }}
                       className="w-full pl-20 pr-8 h-20 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] outline-none focus:bg-white focus:border-primary/30 transition-all font-black text-2xl tracking-tighter shadow-inner"
                     />
                   </div>
                </div>

                {taxConfig.hasNJOPTKP && selectedType === "PBB_P2" && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic pl-6">NJOPTKP (Default Medan 2025)</label>
                    <div className="relative group">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-lg text-zinc-200 group-focus-within:text-primary transition-colors">Rp</span>
                      <input
                        type="text"
                        value={formatNumber(njoptkp.replace(/\./g, ""))}
                        onChange={(e) => setNjoptkp(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-22 pr-8 h-18 bg-zinc-50 border border-zinc-100 rounded-[2rem] outline-none focus:bg-white focus:border-primary/30 transition-all font-black text-lg tracking-tighter shadow-inner opacity-80"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCalculate}
                  disabled={!inputValue || loading}
                  size="xl"
                  className="w-full h-20 rounded-full btn-premium font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 items-center justify-center gap-6"
                >
                  {loading ? <><RefreshCw className="w-6 h-6 animate-spin" /> Sedang Menghitung...</> : <><Calculator className="w-6 h-6" /> Proses Kalkulasi</>}
                </Button>
              </div>
           </Card>
        </div>

        {/* Right: Result Visualization */}
        <div className="lg:col-span-7">
           {!result ? (
              <div className="h-full min-h-[500px] border-2 border-dashed border-zinc-100 rounded-[5rem] flex flex-col items-center justify-center p-12 text-center group hover:border-primary/20 transition-all shadow-inner">
                 <div className="w-24 h-24 bg-zinc-50 rounded-[3rem] border border-zinc-100 flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform">
                    <RefreshCw className="w-10 h-10 text-zinc-200 group-hover:text-primary transition-colors" />
                 </div>
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase italic text-zinc-300">Menunggu Input Data.</h4>
                 <p className="text-zinc-400 font-medium italic mt-2">Silakan masukkan nilai objek pada terminal kiri untuk memulai proyeksi.</p>
              </div>
           ) : (
              <Card padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[5rem] shadow-2xl shadow-primary/10 overflow-hidden animate-in zoom-in-95 duration-700 text-left">
                 <div className="bg-primary p-12 lg:p-20 text-white relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 p-16 opacity-10 -rotate-12">
                       <Zap className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Proyeksi Final Estimasi</p>
                       <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none">{formatCurrency(result.taxAmount)}</h3>
                       <p className="text-lg font-bold italic opacity-80 uppercase tracking-widest mt-6">Kewajiban per Tahun — {result.taxType}</p>
                    </div>
                 </div>
                 
                 <div className="p-12 lg:p-20 space-y-12">
                    <div className="space-y-8">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 border-l-4 border-primary">Komposisi Perhitungan</p>
                       <div className="grid grid-cols-1 gap-6">
                          {result.breakdown.map((b, i) => (
                             <div key={i} className="flex items-center justify-between p-8 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] shadow-inner group/item hover:bg-white hover:border-primary/20 transition-all">
                                <span className="text-sm font-black text-zinc-400 uppercase tracking-widest italic group-hover/item:text-primary transition-colors">{b.label}</span>
                                <span className="text-xl font-black italic tracking-tighter">{b.value}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6">
                       <Button 
                         onClick={() => { setResult(null); setInputValue(""); }}
                         variant="outline" size="xl" className="flex-1 h-20 rounded-full font-black uppercase text-[10px] tracking-widest border-zinc-100 bg-zinc-50 hover:bg-white transition-all shadow-sm"
                       >
                         Reset Terminal
                       </Button>
                       <Link href="/dashboard/pajak/tagihan" className="flex-1">
                          <Button size="xl" className="w-full h-20 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all">
                             Buka Billing Center
                          </Button>
                       </Link>
                    </div>
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}
