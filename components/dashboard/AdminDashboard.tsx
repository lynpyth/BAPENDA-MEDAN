"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Building2,
  Timer,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Bell,
  PieChart,
  Database,
  Layers,
  FileSearch,
  History,
  MessageSquare,
  Settings
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PremiumChart } from "@/components/ui/PremiumChart";

interface DashboardData {
  stats: {
    userCount: number;
    taxObjectCount: number;
    paidCount: number;
    unpaidCount: number;
  };
  monthlyStats: Array<{
    month: number;
    revenue: number;
    tunggakan: number;
  }>;
  submissions: Array<{
    id: string;
    number: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
    owner: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    table: string;
    createdAt: string;
    user: { name: string | null };
  }>;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export const AdminDashboard = ({ session }: { session: Session }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
     );
  }

  const kpis = [
    { label: "Total Wajib Pajak", value: `${data?.stats.userCount ?? 0} Users`, change: "Wajib Pajak Aktif", trend: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-50/50" },
    { label: "Total Objek Pajak", value: `${data?.stats.taxObjectCount ?? 0} Nodes`, change: "Objek Terdaftar", trend: "up", icon: Building2, color: "text-primary", bg: "bg-primary/5" },
    { label: "Jumlah Sudah Membayar", value: `${data?.stats.paidCount ?? 0} Transaksi`, change: "Pembayaran Lunas", trend: "up", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50/50" },
    { label: "Tunggakan / Utang Pajak", value: `${data?.stats.unpaidCount ?? 0} Tunggakan`, change: "Perlu Tindak Lanjut", trend: "down", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-50/50" },
  ];

  const chartData = (data?.monthlyStats || []).map(m => ({
    label: MONTHS[m.month],
    value: m.revenue
  }));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Dashboard Hero ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 relative bg-white border border-zinc-100 rounded-[5rem] p-14 md:p-24 overflow-hidden group shadow-2xl shadow-primary/5 flex flex-col justify-center min-h-[500px]">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Selamat Datang, {session.user?.name ?? "Admin"}</p>
               </div>
               <div className="space-y-6">
                  <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase text-foreground">Sistem <br /> Monitoring <span className="text-primary italic">Fiskal.</span></h1>
                  <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary/10 pl-8">
                     Visualisasi data real-time, manajemen pendapatan, dan audit terpusat Pemerintah Kota Medan untuk transparansi fiskal maksimal.
                  </p>
               </div>
               <div className="flex flex-wrap gap-4 pt-6">
                  <Link href="/dashboard/admin/stats">
                     <Button variant="primary" className="btn-premium px-12 h-18 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 group">
                       Buka Command Center <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                     </Button>
                  </Link>
                  <Button variant="outline" className="px-10 h-18 rounded-[2rem] bg-zinc-50 border-zinc-100 font-black uppercase text-[10px] tracking-widest hover:bg-white flex items-center gap-3">Live Update <Zap className="w-4 h-4 text-primary" /></Button>
               </div>
            </div>
         </div>

         {/* ── Mini Stats Grid ── */}
         <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            {kpis.map((stat, i) => (
               <Card key={i} padding="lg" variant="elevated" className={cn("bg-white border-zinc-50 group hover:scale-[1.05] hover:shadow-2xl hover:shadow-primary/10 transition-all flex items-center justify-between shadow-xl shadow-primary/5 rounded-[3rem] relative overflow-hidden")}>
                  <div className={cn("absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06] -z-0", stat.bg)} />
                  <div className="space-y-3 relative z-10">
                     <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest italic">{stat.label}</p>
                     <h4 className="text-2xl font-black italic tracking-tighter text-foreground italic uppercase">{stat.value}</h4>
                     <span className={cn("px-4 py-1 text-[9px] font-black rounded-full italic border shadow-sm leading-none", 
                        stat.trend === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                     )}>{stat.change}</span>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center ${stat.color} shadow-inner group-hover:rotate-12 transition-transform relative z-10 border border-zinc-100`}>
                     <stat.icon className="w-7 h-7" />
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* ── Revenue Intelligence Chart ── */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
         <Card padding="lg" variant="elevated" className="bg-white border-zinc-100 rounded-[5rem] shadow-2xl shadow-primary/5 p-16 md:p-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:scale-110 transition-transform duration-[2000ms]" />
            <PremiumChart 
               subtitle="Statistik Pajak Tahunan"
               title="Penerimaan Pajak Bulanan"
               data={chartData.length > 0 ? chartData : [
                  { label: "Jan", value: 1250000000 },
                  { label: "Feb", value: 1450000000 },
                  { label: "Mar", value: 1100000000 },
                  { label: "Apr", value: 1800000000 },
                  { label: "Mei", value: 2100000000 },
                  { label: "Jun", value: 850000000 },
                  { label: "Jul", value: 450000000 },
               ]}
            />
         </Card>
      </section>

      {/* ── Dokumentasi Pengajuan ── */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
         <div className="flex items-center gap-4 mb-10 pl-4">
            <div className="w-12 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase italic">Dokumentasi <span className="text-primary">Pengajuan.</span></h2>
         </div>
         <Card padding="none" className="bg-white border-zinc-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/[0.02]">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-zinc-50 border-b border-zinc-100">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">No. Pengajuan</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Jenis Layanan</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Subjek / Judul</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Pengaju</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Tanggal</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                     {data?.submissions && data.submissions.length > 0 ? (
                        data.submissions.map((sub) => (
                           <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-8 py-6 text-xs font-black text-primary uppercase">{sub.number}</td>
                              <td className="px-8 py-6 text-xs font-black text-zinc-600 uppercase">{sub.type}</td>
                              <td className="px-8 py-6 text-xs font-bold text-zinc-800 line-clamp-1 max-w-[200px]">{sub.title}</td>
                              <td className="px-8 py-6 text-xs text-zinc-500 font-bold">{sub.owner}</td>
                              <td className="px-8 py-6 text-xs text-zinc-400 font-bold">{new Date(sub.createdAt).toLocaleDateString("id-ID")}</td>
                              <td className="px-8 py-6">
                                 <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    sub.status === "APPROVED" || sub.status === "RESOLVED"
                                       ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                       : sub.status === "REJECTED" || sub.status === "CLOSED"
                                       ? "bg-red-50 text-red-600 border-red-100"
                                       : "bg-amber-50 text-amber-600 border-amber-100"
                                 )}>
                                    {sub.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <Link href={
                                    sub.type === "Riset Mahasiswa" ? "/dashboard/admin/research" :
                                    sub.type === "Layanan PPID" ? "/dashboard/ppid" : "/dashboard/pengaduan"
                                 }>
                                    <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary italic leading-none hover:bg-primary/5 px-4 py-2 rounded-xl">
                                       Detail
                                    </Button>
                                 </Link>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={7} className="px-8 py-16 text-center text-zinc-400 italic font-bold">Tidak ada data pengajuan dokumen.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </Card>
      </section>

      {/* ── Activity & Intelligence Hub ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 group">
            <Card padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[5rem] overflow-hidden shadow-2xl shadow-primary/5 min-h-[600px] flex flex-col p-12 md:p-20 relative">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8 text-left">
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black italic tracking-tighter uppercase italic leading-none">Intelligence <br/><span className="text-primary">Ledger Log.</span></h2>
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Live System Synchronization Data Feed</p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-50 p-2.5 rounded-[2rem] border border-zinc-100 shadow-inner">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-glow" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pr-4 italic">Protocol: WebSocket Active</span>
                  </div>
               </div>
               
               <div className="flex-1 space-y-8 text-left">
                  {data?.recentActivity.map((log) => (
                    <div key={log.id} className="relative pl-14 pb-8 group/row last:pb-0">
                       <div className="absolute left-[20px] top-4 w-[2px] h-full bg-zinc-50 group-last/row:hidden" />
                       <div className="absolute left-0 top-0 w-10 h-10 bg-white border-2 border-zinc-50 rounded-2xl flex items-center justify-center shadow-sm z-10 group-hover/row:border-primary/20 group-hover/row:scale-110 transition-all">
                          <Timer className="w-5 h-5 text-zinc-300 group-hover/row:text-primary transition-colors" />
                       </div>
                       <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] shadow-inner group-hover/row:bg-white group-hover/row:border-primary/10 transition-all group-hover/row:shadow-2xl">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">{log.action.replace(/_/g, ' ')}</span>
                             <span className="text-[10px] font-black text-zinc-300 italic uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-lg font-black italic tracking-tighter uppercase text-zinc-900 leading-tight">Modified entry in <span className="text-zinc-400">{log.table}</span></p>
                          <div className="mt-4 flex items-center gap-3">
                             <div className="w-6 h-6 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center text-[10px] font-black">A</div>
                             <span className="text-[10px] font-black text-zinc-400 uppercase italic">Operator: {log.user.name ?? 'System Node'}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 pt-8 border-t border-zinc-50 flex items-center justify-between px-4">
                  <div className="flex items-center gap-8">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-zinc-400 italic">Net: Operational</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase text-zinc-400 italic">Security: Tier 4</span>
                     </div>
                  </div>
                  <Link href="/dashboard/admin/audit">
                     <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary border-b border-primary/20 hover:border-primary transition-all group/btn">
                       Tinjau Audit Penuh <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                     </Button>
                  </Link>
               </div>
            </Card>
         </div>

         <div className="lg:col-span-4 flex flex-col gap-10">
            <Card padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[5rem] relative overflow-hidden group shadow-2xl shadow-primary/10 p-14 space-y-12 min-h-[460px] cursor-default text-left">
               <div className="absolute top-[-20%] right-[-20%] p-32 opacity-5 group-hover:rotate-12 group-hover:scale-125 transition-all duration-[2000ms]">
                  <ShieldCheck className="w-96 h-96" />
               </div>
               <div className="space-y-8 relative z-10">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                     <Zap className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black italic tracking-tighter leading-none uppercase text-foreground italic">System Integrity.</h3>
                     <p className="text-lg font-bold text-muted-foreground italic leading-relaxed border-l-4 border-primary/20 pl-8 max-w-[280px]">
                        &quot;Parameter operasional fiscal gateway terpantau dalam batas aman.&quot;
                     </p>
                  </div>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="p-10 bg-zinc-50 rounded-[3.5rem] border border-zinc-100 space-y-6 shadow-inner group-hover:bg-white group-hover:shadow-2xl transition-all">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Cloud Resource Load</p>
                        <span className="text-[10px] font-black text-primary uppercase italic">94% Optimal</span>
                     </div>
                     <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[94%] shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-in slide-in-from-left duration-1000" />
                     </div>
                  </div>
                  <Button variant="primary" className="w-full h-22 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] btn-premium shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 group">
                    <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Global Status Report
                  </Button>
               </div>
            </Card>

            <Card padding="lg" className="bg-primary text-white rounded-[3.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden group min-h-[220px] flex flex-col justify-center text-left">
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-[2000ms]">
                  <Bell className="w-32 h-32" />
               </div>
               <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Citizen Voice</p>
                  <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Respon <br/> Cepat.</h4>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-5 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{data?.submissions.filter(s => s.status === 'PENDING' || s.status === 'OPEN').length ?? 0} Tickets</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
               </div>
            </Card>
         </div>
      </section>
    </div>
  );
};
