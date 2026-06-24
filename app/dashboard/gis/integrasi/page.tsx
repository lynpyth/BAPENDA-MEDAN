"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, Building2, FileText, CreditCard, Clock, ShieldCheck, Scale, Activity, ArrowRight, Bell, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PremiumChart } from "@/components/ui/PremiumChart";

interface IntegrationData {
  totalUsers: number;
  totalTaxObjects: number;
  totalSppts: number;
  totalPembayaran: number;
  totalRevenue: number;
  totalTunggakan: number;
  totalSubmissions: number;
  totalAssessments: number;
}

export default function PortalIntegrasiPage() {
  const [data, setData] = useState<IntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/integration/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Wajib Pajak", value: data.totalUsers },
      { label: "Objek Pajak", value: data.totalTaxObjects },
      { label: "SPPT Terbit", value: data.totalSppts },
      { label: "Transaksi Lunas", value: data.totalPembayaran },
      { label: "Pengajuan Aktif", value: data.totalSubmissions },
      { label: "Penilaian Ulang", value: data.totalAssessments }
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">
        Menyinkronkan data integrator...
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 text-primary">
            <div className="w-10 h-0.5 bg-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Enterprise Tax Data Aggregator</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mt-2">Portal Integrasi <span className="text-primary italic">PBB.</span></h1>
          <p className="text-muted-foreground font-medium text-sm italic mt-2">Pusat data terpadu untuk monitoring kepatuhan wajib pajak, realisasi pendapatan, and riwayat pelayanan PBB Kota Medan.</p>
        </div>

        <Button 
          variant="outline" 
          onClick={loadData}
          disabled={refreshing}
          className="h-14 px-6 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      {/* Primary Integration Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-primary/10 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Wajib Pajak</p>
            <h4 className="text-3xl font-black text-foreground italic mt-1">{data?.totalUsers}</h4>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-primary/10 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Objek Pajak</p>
            <h4 className="text-3xl font-black text-foreground italic mt-1">{data?.totalTaxObjects}</h4>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-primary/10 transition-colors">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">SPPT Digital</p>
            <h4 className="text-3xl font-black text-foreground italic mt-1">{data?.totalSppts}</h4>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-primary/10 transition-colors">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Tunggakan Pajak</p>
            <h4 className="text-3xl font-black text-rose-600 italic mt-1">Rp {Math.round((data?.totalTunggakan || 0) / 1000000).toLocaleString("id-ID")} JT</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main analytical chart */}
        <Card className="lg:col-span-2 p-10 bg-white border border-zinc-100 rounded-[3rem] shadow-sm">
          <PremiumChart 
            data={chartData}
            title="Ringkasan Aktivitas Terpadu Sistem"
            subtitle="Volume Transaksi, Wajib Pajak, dan Perubahan Data Sipada"
          />
        </Card>

        {/* Secondary analytics metrics & shortcuts */}
        <div className="space-y-8">
          <Card className="p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm space-y-6">
            <h3 className="font-black italic uppercase text-sm tracking-widest text-primary flex items-center gap-2"><Activity className="w-5 h-5 animate-pulse" /> Realisasi & Audit</h3>
            
            <div className="space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl">
                <span className="text-zinc-500">Kas Masuk (Realisasi)</span>
                <span className="text-emerald-600 font-black text-sm">Rp {Math.round((data?.totalRevenue || 0) / 1000000).toLocaleString("id-ID")} JT</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl">
                <span className="text-zinc-500">Total Pengajuan</span>
                <span className="text-primary font-black text-sm">{data?.totalSubmissions} Pengajuan</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl">
                <span className="text-zinc-500">Penilaian Individual</span>
                <span className="text-indigo-600 font-black text-sm">{data?.totalAssessments} Objek</span>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-zinc-950 border border-zinc-900 rounded-[3rem] shadow-sm text-white flex flex-col justify-between h-56 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="space-y-2 relative z-10 text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary italic">Live System Monitor</span>
              <h4 className="text-xl font-black italic uppercase">Bapenda Security Hub</h4>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">Seluruh sinkronisasi data audit, perubahan penilaian individual, dan pembayaran dikunci menggunakan standard enkripsi perbankan.</p>
            </div>
            <a href="/dashboard/admin/audit" className="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all relative z-10 text-left mt-4">
              Buka Audit Log <ArrowRight className="w-4 h-4" />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
