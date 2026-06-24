"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import {
   Users,
   ShieldCheck,
   Zap,
   CreditCard,
   Building2,
   Clock,
   ArrowRight,
   ShieldAlert,
   Loader2,
   Bell,
   BarChart3,
   TrendingUp,
   FileText,
   Percent,
   CheckCircle2,
   ArrowUpRight,
   ClipboardList,
   History
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
      spptCount: number;
      totalPajakTerutang: number;
      totalPembayaranMasuk: number;
      totalTunggakanPajak: number;
      activeWpCount: number;
      kepatuhanRate: number;
      paidCount: number;
      unpaidCount: number;
      totalRevenue: number;
      pendingPPID: number;
      pendingComplaints: number;
      pendingResearch: number;
      pendingTaxSubmissions: number;
      pendingVerificationObjects: number;
      inProgressSubmissions: number;
      fieldTasksToday: number;
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
   districtStats: Array<{
      name: string;
      amount: number;
      simulatedVal: number;
      pct: number;
   }>;
   objCategoryCounts: Record<string, number>;
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
            <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
         </div>
      );
   }

   // Row 1 KPI
   const kpisRow1 = [
      { label: "Total Wajib Pajak", value: `${data?.stats.userCount ?? 0} WP`, subtext: "Wajib Pajak Terdaftar", icon: Users, color: "text-[#1E40AF]", bg: "bg-[#1E40AF]/5" },
      { label: "Total Objek Pajak", value: `${data?.stats.taxObjectCount ?? 0} Objek`, subtext: "Objek Pajak Terdaftar", icon: Building2, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5" },
      { label: "Total SPPT", value: `${data?.stats.spptCount ?? 0} Berkas`, subtext: "SPPT Terbit Digital", icon: FileText, color: "text-[#10B981]", bg: "bg-[#10B981]/5" },
      { label: "Total Pajak Terutang", value: formatCurrency(data?.stats.totalPajakTerutang ?? 0), subtext: "Ketetapan Pajak Terutang", icon: BarChart3, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5" },
   ];

   // Row 2 KPI
   const kpisRow2 = [
      { label: "Total Pembayaran", value: formatCurrency(data?.stats.totalPembayaranMasuk ?? 0), subtext: "Kas Daerah Diterima", icon: CreditCard, color: "text-[#10B981]", bg: "bg-[#10B981]/5" },
      { label: "Total Tunggakan", value: formatCurrency(data?.stats.totalTunggakanPajak ?? 0), subtext: "Sisa Piutang Pajak", icon: ShieldAlert, color: "text-[#EF4444]", bg: "bg-[#EF4444]/5" },
      { label: "Pengguna Aktif", value: `${data?.stats.activeWpCount ?? 0} Pengguna`, subtext: "Pengguna Aktif Portal", icon: ShieldCheck, color: "text-[#1E40AF]", bg: "bg-[#1E40AF]/5" },
      { label: "Tingkat Kepatuhan", value: `${data?.stats.kepatuhanRate ?? 0}%`, subtext: "Persentase Kepatuhan WP", icon: Percent, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5" },
   ];

   // Graph 1: Pembayaran Bulanan
   const monthlyRevenueData = (data?.monthlyStats || []).map(m => ({
      label: MONTHS[m.month],
      value: m.revenue
   }));

   // Graph 2: Tunggakan Pajak
   const monthlyTunggakanData = (data?.monthlyStats || []).map(m => ({
      label: MONTHS[m.month],
      value: m.tunggakan
   }));

   // Graph 3: Kepatuhan (Lunas vs Tunggakan)
   const kepatuhanChartData = [
      { label: "Realisasi (Lunas)", value: data?.stats.paidCount ?? 0 },
      { label: "Tunggakan", value: data?.stats.unpaidCount ?? 0 }
   ];

   // Graph 4: Objek Pajak per Kecamatan
   const districtChartData = (data?.districtStats || []).map(d => ({
      label: d.name.replace("Medan ", ""),
      value: d.amount || d.simulatedVal
   }));

   // Format activity action log helper
   const getActivityDetails = (action: string, table: string) => {
      const act = action.toUpperCase();
      if (act.includes("LOGIN") || table === "User") {
         return { label: "User Login", icon: Users, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5" };
      }
      if (act.includes("SPPT") || table === "Sppt") {
         return { label: "Generate SPPT", icon: FileText, color: "text-[#1E40AF]", bg: "bg-[#1E40AF]/5" };
      }
      if (act.includes("PAY") || table === "Payment") {
         return { label: "Pembayaran Masuk", icon: CreditCard, color: "text-[#10B981]", bg: "bg-[#10B981]/5" };
      }
      return { label: "Pengajuan Baru", icon: ClipboardList, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5" };
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-[#1E40AF]/20 text-left bg-[#F8FAFC]">

         {/* ── Dashboard Hero ── */}
         <section className="relative bg-white border border-zinc-150 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-sm flex flex-col justify-center min-h-[160px]">
            <div className="relative z-10 space-y-4">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#1E40AF] rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-[#1E40AF] uppercase tracking-[0.2em] italic">Selamat Datang, {session.user?.name ?? "Admin"}</p>
               </div>
               <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase text-foreground">Dashboard <span className="text-[#1E40AF] italic">Pajak Daerah.</span></h1>
                  <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-[#1E40AF]/20 pl-6">
                     Pantau data wajib pajak, objek pajak, realisasi penerimaan, serta pengajuan layanan secara waktu nyata.
                  </p>
               </div>
            </div>
         </section>

         {/* ── Ringkasan Utama (2 Rows of 4 Cards) ── */}
         <section className="space-y-4">
            <div className="flex items-center gap-4 pl-2">
               <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
               <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Ringkasan Eksekutif Pajak Daerah</h2>
            </div>

            {/* Baris Pertama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {kpisRow1.map((stat, i) => (
                  <Card key={i} padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem] relative overflow-hidden">
                     <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{stat.label}</p>
                        <h4 className="text-lg font-black tracking-tight text-foreground uppercase truncate max-w-[190px]">{stat.value}</h4>
                        <p className="text-[10px] font-medium text-zinc-500">{stat.subtext}</p>
                     </div>
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100", stat.color, stat.bg)}>
                        <stat.icon className="w-5 h-5" />
                     </div>
                  </Card>
               ))}
            </div>

            {/* Baris Kedua */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {kpisRow2.map((stat, i) => (
                  <Card key={i} padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem] relative overflow-hidden">
                     <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{stat.label}</p>
                        <h4 className="text-lg font-black tracking-tight text-foreground uppercase truncate max-w-[190px]">{stat.value}</h4>
                        <p className="text-[10px] font-medium text-zinc-500">{stat.subtext}</p>
                     </div>
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100", stat.color, stat.bg)}>
                        <stat.icon className="w-5 h-5" />
                     </div>
                  </Card>
               ))}
            </div>
         </section>

         {/* ── Grafik Statistik (Grid of 4 Charts) ── */}
         <section className="space-y-4">
            <div className="flex items-center gap-4 pl-2">
               <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
               <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Visualisasi Analisis Pendapatan & Objek Pajak</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Chart 1: Pembayaran Bulanan */}
               <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm">
                  <PremiumChart
                     subtitle="Akumulasi Bulanan 2026"
                     title="Grafik Pembayaran Bulanan"
                     data={monthlyRevenueData.length > 0 ? monthlyRevenueData : [{ label: "Jan", value: 0 }]}
                  />
               </Card>

               {/* Chart 2: Tunggakan Pajak */}
               <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm">
                  <PremiumChart
                     subtitle="Piutang Pajak Terhutang"
                     title="Grafik Tunggakan Pajak"
                     data={monthlyTunggakanData.length > 0 ? monthlyTunggakanData : [{ label: "Jan", value: 0 }]}
                  />
               </Card>

               {/* Chart 3: Kepatuhan */}
               <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm">
                  <PremiumChart
                     subtitle="Lunas vs Tunggakan Ketetapan"
                     title="Grafik Kepatuhan Pajak"
                     data={kepatuhanChartData}
                  />
               </Card>

               {/* Chart 4: Objek Pajak per Kecamatan */}
               <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm">
                  <PremiumChart
                     subtitle="Distribusi Pajak Wilayah"
                     title="Grafik Objek Pajak per Kecamatan"
                     data={districtChartData.length > 0 ? districtChartData : [{ label: "Medan", value: 0 }]}
                  />
               </Card>
            </div>
         </section>

         {/* ── Submissions & Notifications ── */}
         <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: Recent Submissions */}
            <div className="lg:col-span-8 space-y-6">
               <Card padding="none" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                     <h3 className="text-base font-black uppercase text-zinc-800">Daftar Pengajuan Layanan Terbaru</h3>
                     <Link href="/dashboard/admin/submissions">
                        <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                           Semua Pengajuan
                        </Button>
                     </Link>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-zinc-50 border-b border-zinc-150">
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">No. Pengajuan</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Jenis Layanan</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subjek / Judul</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pengaju</th>
                              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150">
                           {data?.submissions && data.submissions.length > 0 ? (
                              data.submissions.slice(0, 5).map((sub) => (
                                 <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-[#1E40AF] uppercase">{sub.number}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-zinc-600 uppercase">{sub.type}</td>
                                    <td className="px-6 py-4 text-xs text-zinc-800 max-w-[200px] truncate">{sub.title}</td>
                                    <td className="px-6 py-4 text-xs text-zinc-500">{sub.owner}</td>
                                    <td className="px-6 py-4">
                                       <span className={cn(
                                          "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                          sub.status === "APPROVED" || sub.status === "RESOLVED" || sub.status === "Disetujui"
                                             ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                             : sub.status === "REJECTED" || sub.status === "CLOSED" || sub.status === "Ditolak"
                                                ? "bg-red-50 text-red-600 border-red-100"
                                                : "bg-amber-50 text-amber-600 border-amber-100"
                                       )}>
                                          {sub.status === "PENDING" ? "Menunggu" : sub.status === "IN_PROGRESS" ? "Diproses" : sub.status}
                                       </span>
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">Tidak ada data pengajuan.</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </Card>
            </div>

            {/* Right Side: Notifications Panel */}
            <div className="lg:col-span-4">
               <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-[#1E40AF] border-b border-zinc-100 pb-3">
                     <Bell className="w-5 h-5" />
                     <h3 className="text-base font-black uppercase text-zinc-800">Notifikasi Dashboard</h3>
                  </div>
                  <div className="space-y-4">
                     {/* Pengajuan Baru */}
                     <div className="flex gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <ClipboardList className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-[#F59E0B] uppercase tracking-wider">Pengajuan Baru</p>
                           <p className="text-xs text-zinc-700 leading-normal">
                              Ada <strong>{data?.stats.pendingResearch ?? 0} riset</strong> dan <strong>{data?.stats.pendingComplaints ?? 0} pengaduan</strong> menunggu tinjauan.
                           </p>
                        </div>
                     </div>

                     {/* Pajak Jatuh Tempo */}
                     <div className="flex gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                        <Clock className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-[#EF4444] uppercase tracking-wider">Pajak Jatuh Tempo</p>
                           <p className="text-xs text-zinc-700 leading-normal">
                              SPPT PBB-P2 Tahun Buku 2026 akan segera jatuh tempo dalam waktu dekat.
                           </p>
                        </div>
                     </div>

                     {/* Pembayaran Berhasil */}
                     <div className="flex gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-[#10B981] uppercase tracking-wider">Pembayaran Berhasil</p>
                           <p className="text-xs text-zinc-700 leading-normal">
                              Realisasi pembayaran PBB digital hari ini berjalan lancar.
                           </p>
                        </div>
                     </div>

                     {/* Peringatan Sistem */}
                     <div className="flex gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <ShieldAlert className="w-5 h-5 text-[#1E40AF] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-[#1E40AF] uppercase tracking-wider">Peringatan Sistem</p>
                           <p className="text-xs text-zinc-700 leading-normal">
                              Beban server utama terhitung optimal (94%). Sistem sinkronisasi aktif.
                           </p>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
         </section>

         {/* ── Aktivitas Terbaru (Timeline Format) ── */}
         <section className="space-y-4">
            <div className="flex items-center gap-4 pl-2">
               <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
               <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Aktivitas Sistem Terbaru</h2>
            </div>

            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm p-6 md:p-10 relative">
               <div className="space-y-6 relative border-l border-zinc-100 pl-6 ml-3">
                  {data?.recentActivity && data.recentActivity.length > 0 ? (
                     data.recentActivity.map((log) => {
                        const actDetails = getActivityDetails(log.action, log.table);
                        return (
                           <div key={log.id} className="relative group/row">
                              {/* timeline bullet node */}
                              <div className={cn(
                                 "absolute -left-[35px] top-1 w-6 h-6 rounded-lg border border-zinc-200 bg-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover/row:scale-115 duration-300",
                                 actDetails.color
                              )}>
                                 <actDetails.icon className="w-3.5 h-3.5" />
                              </div>

                              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl transition-all hover:bg-zinc-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md", actDetails.color, actDetails.bg)}>
                                          {actDetails.label}
                                       </span>
                                       <span className="text-[10px] text-zinc-400 font-semibold">{new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-800">
                                       Aksi <span className="text-[#1E40AF]">{log.action.replace(/_/g, " ")}</span> dilakukan pada tabel <span className="text-zinc-600 font-mono text-xs">{log.table}</span>
                                    </p>
                                    <p className="text-[10px] font-semibold text-zinc-400">Petugas ID/Nama: {log.user?.name ?? "Sistem Otomatis"}</p>
                                 </div>

                                 <div className="text-right flex-shrink-0">
                                    <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">
                                       {new Date(log.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        );
                     })
                  ) : (
                     <div className="py-12 text-center text-zinc-400 italic">Tidak ada riwayat aktivitas sistem.</div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                     <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Database Terkoneksi</span>
                     <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]" /> Enkripsi SSL</span>
                  </div>
                  <Link href="/dashboard/admin/audit">
                     <Button variant="outline" size="sm" icon={<History className="w-3.5 h-3.5" />}>
                        Buka Audit Log Lengkap
                     </Button>
                  </Link>
               </div>
            </Card>
         </section>

      </div>
   );
};
