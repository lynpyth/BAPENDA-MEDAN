"use client";

import { useState } from "react";
import { Calculator, Info, RefreshCw, Zap, ChevronDown, Check, Coins } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TaxType = 
  | "PKB" 
  | "BBN_KB" 
  | "PBB_KB" 
  | "P_ROKOK" 
  | "P_REKLAME" 
  | "PAT" 
  | "PBB_P2" 
  | "BPHTB" 
  | "PAB" 
  | "PBJT_HOTEL" 
  | "PBJT_MAMIN" 
  | "PBJT_HIBURAN" 
  | "PBJT_LISTRIK" 
  | "PBJT_PARKIR"
  | "P_WALET";

interface SimResult {
  taxType: string;
  baseValue: number;
  rate: number;
  taxAmount: number;
  njoptkp?: number;
  breakdown: Array<{ label: string; value: string }>;
}

const TAX_TYPES: Array<{ 
  id: TaxType; 
  label: string; 
  desc: string; 
  rate: number; 
  unit: string; 
  hasNJOPTKP?: boolean;
  emoji: string;
}> = [
  { id: "PBB_P2", label: "PBB-P2 (Bumi & Bangunan)", desc: "Pajak Bumi & Bangunan Perdesaan dan Perkotaan", rate: 0.0015, unit: "Nilai NJOP Bumi/Bangunan (Rp)", hasNJOPTKP: true, emoji: "🏢" },
  { id: "BPHTB", label: "BPHTB", desc: "Bea Perolehan Hak atas Tanah & Bangunan", rate: 0.05, unit: "Nilai Perolehan Objek Pajak / Transaksi (Rp)", hasNJOPTKP: true, emoji: "🏡" },
  { id: "PKB", label: "Pajak Kendaraan Bermotor (PKB)", desc: "Pajak kepemilikan kendaraan bermotor roda 2 & 4", rate: 0.02, unit: "Nilai Jual Kendaraan Bermotor (NJKB) (Rp)", emoji: "🚗" },
  { id: "BBN_KB", label: "Bea Balik Nama (BBN-KB)", desc: "Bea balik nama penyerahan kendaraan bermotor", rate: 0.10, unit: "Nilai Jual Kendaraan Bermotor (NJKB) (Rp)", emoji: "🏍️" },
  { id: "PBB_KB", label: "Pajak Bahan Bakar (PBB-KB)", desc: "Pajak atas konsumsi bahan bakar kendaraan", rate: 0.075, unit: "Total Pembelian Bahan Bakar (Rp)", emoji: "⛽" },
  { id: "P_ROKOK", label: "Pajak Rokok", desc: "Pajak atas konsumsi rokok sigaret/cerutu", rate: 0.10, unit: "Nilai Cukai Rokok (Rp)", emoji: "🚬" },
  { id: "P_REKLAME", label: "Pajak Reklame", desc: "Pajak atas penyelenggaraan papan reklame/iklan", rate: 0.25, unit: "Nilai Kontrak / Sewa Reklame (Rp)", emoji: "📢" },
  { id: "PAT", label: "Pajak Air Tanah (PAT)", desc: "Pajak atas pengambilan dan/atau pemanfaatan air tanah", rate: 0.20, unit: "Nilai Perolehan Air Tanah (NPA) (Rp)", emoji: "💧" },
  { id: "PAB", label: "Pajak Alat Berat (PAB)", desc: "Pajak kepemilikan dan/atau penguasaan alat berat", rate: 0.002, unit: "Nilai Jual Alat Berat (Rp)", emoji: "🚜" },
  { id: "PBJT_HOTEL", label: "PBJT Jasa Perhotelan", desc: "Pajak barang & jasa tertentu pada akomodasi hotel", rate: 0.10, unit: "Jumlah Pembayaran / Omzet Bulanan (Rp)", emoji: "🏨" },
  { id: "PBJT_MAMIN", label: "PBJT Makanan & Minuman", desc: "Pajak barang & jasa tertentu pada restoran/warung", rate: 0.10, unit: "Jumlah Pembayaran / Omzet Bulanan (Rp)", emoji: "🍔" },
  { id: "PBJT_HIBURAN", label: "PBJT Kesenian & Hiburan", desc: "Pajak barang & jasa tertentu pada bioskop/rekreasi", rate: 0.15, unit: "Jumlah Pembayaran / Omzet Bulanan (Rp)", emoji: "🎟️" },
  { id: "PBJT_LISTRIK", label: "PBJT Tenaga Listrik", desc: "Pajak barang & jasa tertentu konsumsi tenaga listrik", rate: 0.03, unit: "Nilai Tagihan Listrik Bulanan (Rp)", emoji: "⚡" },
  { id: "PBJT_PARKIR", label: "PBJT Jasa Parkir", desc: "Pajak barang & jasa tertentu penyelenggaraan parkir", rate: 0.10, unit: "Omzet Penyewaan Lahan Parkir (Rp)", emoji: "🅿️" },
  { id: "P_WALET", label: "Pajak Sarang Burung Walet", desc: "Pajak atas kegiatan pengambilan dan/atau pengusahaan sarang burung walet", rate: 0.10, unit: "Nilai Jual Sarang Burung Walet (Rp)", emoji: "🐦" },
];

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const taxConfig = TAX_TYPES.find((t) => t.id === selectedType)!;

  const handleCalculate = () => {
    setLoading(true);
    const base = parseNumber(inputValue);
    if (!base) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      let taxAmount = 0;
      const breakdown: SimResult["breakdown"] = [];

      if (selectedType === "PBB_P2") {
        const njoptkpVal = parseNumber(njoptkp) || NJOPTKP_DEFAULT;
        const njkp = Math.max(0, base - njoptkpVal);
        taxAmount = njkp * taxConfig.rate;
        breakdown.push(
          { label: "NJOP Bumi & Bangunan", value: formatCurrency(base) },
          { label: "NJOPTKP (Pengurang)", value: `-${formatCurrency(njoptkpVal)}` },
          { label: "Dasar Pengenaan (NJKP)", value: formatCurrency(njkp) },
          { label: "Tarif Pajak (PBB-P2)", value: `${(taxConfig.rate * 100).toFixed(4)}%` }
        );
      } else if (selectedType === "BPHTB") {
        const npoptkp = BPHTB_NPOPTKP;
        const npop = Math.max(0, base - npoptkp);
        taxAmount = npop * taxConfig.rate;
        breakdown.push(
          { label: "Nilai Transaksi (NPOP)", value: formatCurrency(base) },
          { label: "NPOPTKP (Pengurang)", value: `-${formatCurrency(npoptkp)}` },
          { label: "Dasar Pengenaan Pajak", value: formatCurrency(npop) },
          { label: "Tarif Pajak (BPHTB)", value: `${(taxConfig.rate * 100).toFixed(0)}%` }
        );
      } else {
        taxAmount = base * taxConfig.rate;
        breakdown.push(
          { label: "Dasar Pengenaan Pajak", value: formatCurrency(base) },
          { label: "Tarif Pajak Daerah", value: `${(taxConfig.rate * 100).toFixed(1)}%` }
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-8 h-1 bg-primary rounded-full shadow-glow" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Fiscal Calculator Hub</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-zinc-950 dark:text-white leading-none uppercase">
          Kalkulator <span className="text-primary italic">Pajak Daerah.</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary/20 pl-6">
          Simulasi instan ini membantu Anda memproyeksikan estimasi kewajiban pajak daerah Kota Medan secara akurat berdasarkan ketentuan regulasi tarif terbaru.
        </p>
      </div>

      {/* ── Alert Disclaimer ── */}
      <div className="flex items-start md:items-center gap-4 bg-blue-50/50 border border-blue-100/50 p-6 rounded-2xl shadow-sm">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-xs md:text-sm font-medium text-blue-700 leading-relaxed italic">
          <strong>Perhatian:</strong> Hasil simulasi ini bersifat <strong>estimasi awal</strong>. Besaran ketetapan pajak resmi yang wajib Anda bayarkan adalah yang tercantum pada SPPT atau Surat Ketetapan Pajak Daerah (SKPD) resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5">
          <Card padding="md" className="bg-white border-zinc-150 rounded-3xl shadow-sm p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 text-zinc-50 pointer-events-none -z-0">
              <Calculator className="w-48 h-48" />
            </div>

            <div className="space-y-5 relative z-10">
              {/* Category Dropdown Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1 block">Kategori Pajak Daerah</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full h-14 px-5 bg-zinc-50 hover:bg-zinc-100/50 border border-zinc-200 rounded-2xl flex items-center justify-between text-left transition-all focus:ring-4 focus:ring-primary/10 outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{taxConfig.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-zinc-800 uppercase tracking-tight">{taxConfig.label}</p>
                        <p className="text-[9px] text-zinc-400 font-medium line-clamp-1">{taxConfig.desc}</p>
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", dropdownOpen && "rotate-180")} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-zinc-100">
                      {TAX_TYPES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedType(t.id);
                            setResult(null);
                            setInputValue("");
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-5 py-3 hover:bg-zinc-50 flex items-center justify-between text-left transition-colors",
                            selectedType === t.id && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{t.emoji}</span>
                            <div>
                              <p className="text-xs font-bold text-zinc-700 uppercase tracking-tight">{t.label}</p>
                              <p className="text-[9px] text-zinc-400 line-clamp-1">{t.desc}</p>
                            </div>
                          </div>
                          {selectedType === t.id && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Input Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1 block">{taxConfig.unit}</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-base text-zinc-300 group-focus-within:text-primary transition-colors">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={inputValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setInputValue(formatNumber(raw));
                      setResult(null);
                    }}
                    className="w-full pl-12 pr-5 h-14 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg tracking-tight"
                  />
                </div>
              </div>

              {/* NJOPTKP Input (For PBB_P2) */}
              {taxConfig.hasNJOPTKP && selectedType === "PBB_P2" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1 block">NJOPTKP Potongan (Medan 2025)</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-sm text-zinc-300 group-focus-within:text-primary transition-colors">Rp</span>
                    <input
                      type="text"
                      value={formatNumber(njoptkp.replace(/\./g, ""))}
                      onChange={(e) => {
                        setNjoptkp(e.target.value.replace(/\D/g, ""));
                        setResult(null);
                      }}
                      className="w-full pl-12 pr-5 h-12 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-semibold text-sm tracking-tight opacity-90"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleCalculate}
                disabled={!inputValue || loading}
                size="lg"
                className="w-full h-14 rounded-2xl btn-premium font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-3 shadow-md"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sedang Menghitung...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" /> Hitung Estimasi Pajak
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Result View */}
        <div className="lg:col-span-7 h-full">
          {!result ? (
            <div className="h-[360px] md:h-full min-h-[380px] border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-white/50 backdrop-blur-sm shadow-inner group transition-all">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-150 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform duration-500">
                <Coins className="w-7 h-7 text-zinc-300" />
              </div>
              <h4 className="text-lg font-bold text-zinc-700 uppercase tracking-tight">Siap Melakukan Simulasi</h4>
              <p className="text-xs text-zinc-400 font-medium max-w-sm mt-2 leading-relaxed">
                Silakan pilih kategori pajak dan masukkan nilai dasar pengenaan pajak pada panel kiri untuk mendapatkan proyeksi besaran kewajiban Anda.
              </p>
            </div>
          ) : (
            <Card padding="none" className="bg-white border-zinc-150 rounded-3xl shadow-sm overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col text-left">
              {/* Header Box */}
              <div className="bg-[#1E40AF] p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12">
                  <Zap className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Estimasi Kewajiban Pajak</p>
                  <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">{formatCurrency(result.taxAmount)}</h3>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-85 mt-4 line-clamp-1">Kategori: {result.taxType}</p>
                </div>
              </div>
              
              {/* Calculations Detail */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 pl-1 border-l-4 border-[#1E40AF]">Rincian Perhitungan</p>
                  <div className="grid grid-cols-1 gap-3">
                    {result.breakdown.map((b, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-150 rounded-xl hover:bg-zinc-100/50 transition-colors">
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{b.label}</span>
                        <span className="text-sm font-black text-zinc-800">{b.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button 
                    onClick={() => {
                      setResult(null);
                      setInputValue("");
                    }}
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl font-bold uppercase text-[9px] tracking-wider border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-white"
                  >
                    Reset Simulasi
                  </Button>
                  <Link href="/dashboard/pajak/tagihan" className="flex-1">
                    <Button 
                      className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase text-[9px] tracking-wider"
                    >
                      Lihat Tagihan Saya
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
