"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Bell, CheckCircle2, Info, AlertTriangle, X,
  Loader2, ArrowRight, Clock,
  Check
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

interface StyleConfig {
  bg: string;
  badge: string;
  icon: React.ReactNode;
}

const notificationStyles: Record<string, StyleConfig> = {
  SUCCESS: {
    bg: "bg-emerald-50 border-emerald-100",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />
  },
  INFO: {
    bg: "bg-blue-50 border-blue-100",
    badge: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <Info className="w-8 h-8 text-blue-600" />
  },
  WARNING: {
    bg: "bg-amber-50 border-amber-100",
    badge: "bg-amber-50 text-amber-600 border-amber-100",
    icon: <AlertTriangle className="w-8 h-8 text-amber-600" />
  },
  ERROR: {
    bg: "bg-red-50 border-red-100",
    badge: "bg-red-50 text-red-600 border-red-100",
    icon: <Check className="w-8 h-8 text-red-600 rotate-45" />
  }
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"SYSTEM" | "DASHBOARD">("SYSTEM");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const d = await res.json();
      setNotifications(d.notifications || []);
    } catch {
      toast("Error", "Gagal sinkronisasi data notifikasi.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
       console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast("Sukses", "Semua notifikasi telah ditandai sebagai terbaca.", "success");
    } catch {
      toast("Error", "Gagal memperbarui status notifikasi.", "error");
    } finally {
      setMarkingAll(false);
    }
  };

  const systemNotifications = notifications.filter(n => n.category === "SYSTEM");
  const dashboardNotifications = notifications.filter(n => n.category === "DASHBOARD");

  const unreadSystem = systemNotifications.filter(n => !n.isRead).length;
  const unreadDashboard = dashboardNotifications.filter(n => !n.isRead).length;

  const currentList = activeCategory === "SYSTEM" ? systemNotifications : dashboardNotifications;

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left max-w-5xl">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-primary">
              <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Security Alert Center</p>
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
             Kotak <span className="text-primary italic">Masuk.</span>
           </h1>
           <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
             &quot;Pantau seluruh peringatan sistem, status pembayaran, dan balasan layanan PPID Anda secara real-time dalam satu gerbang terenkripsi.&quot;
           </p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
           <Button 
             onClick={markAllAsRead}
             disabled={markingAll}
             size="xl" 
             className="btn-premium px-12 h-20 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 group"
           >
             {markingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="mr-4 w-5 h-5" /> Tandai Semua Terbaca</>}
           </Button>
        )}
      </div>

      {/* ── Tabs for System and Dashboard ── */}
      <div className="flex gap-4 bg-zinc-50 p-2 rounded-[2rem] border border-zinc-100 shadow-inner w-fit">
        <button
          onClick={() => setActiveCategory("SYSTEM")}
          className={cn(
             "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 cursor-pointer",
             activeCategory === "SYSTEM" ? "bg-white text-primary shadow-xl border border-primary/10" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          Notifikasi Sistem
          {unreadSystem > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full leading-none">
              {unreadSystem}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveCategory("DASHBOARD")}
          className={cn(
             "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 cursor-pointer",
             activeCategory === "DASHBOARD" ? "bg-white text-primary shadow-xl border border-primary/10" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          Notifikasi Dashboard
          {unreadDashboard > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full leading-none">
              {unreadDashboard}
            </span>
          )}
        </button>
      </div>

      {/* ── Notification Feed ── */}
      <div className="space-y-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-50 border border-zinc-100 rounded-[3rem] animate-pulse shadow-inner" />)
        ) : currentList.length === 0 ? (
          <div className="py-32 text-center bg-white border-2 border-dashed border-zinc-100 rounded-[5rem] group hover:border-primary/20 transition-all shadow-inner">
             <Bell className="w-20 h-20 text-zinc-100 mx-auto mb-8 group-hover:rotate-12 transition-all group-hover:text-primary/20" />
             <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Void Feed — Belum Ada Notifikasi.</p>
          </div>
        ) : (
          currentList.map((n) => (
            <div 
              key={n.id} 
              onMouseEnter={() => !n.isRead && markAsRead(n.id)}
              className={cn(
                "bg-white border rounded-[3.5rem] p-10 lg:p-14 transition-all duration-700 shadow-xl group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12",
                n.isRead ? "border-zinc-100 opacity-60 grayscale-[0.5]" : "border-primary/20 shadow-primary/[0.05] hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10"
              )}
            >
               {!n.isRead && <div className="absolute top-0 left-0 w-2 h-full bg-primary" />}
               
               <div className="flex flex-col md:flex-row items-center gap-10 flex-1">
                  <div className={cn(
                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform border",
                    notificationStyles[n.type]?.bg ?? "bg-zinc-50 border-zinc-100"
                  )}>
                     {notificationStyles[n.type]?.icon ?? <Bell className="w-8 h-8 text-zinc-400" />}
                  </div>
                  
                  <div className="space-y-3 flex-1 text-center md:text-left">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <span className={cn("px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm", notificationStyles[n.type]?.badge)}>
                          {n.type} ALERT
                        </span>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(n.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase italic group-hover:text-primary transition-colors">{n.title}</h3>
                     <p className="text-base font-medium text-muted-foreground italic leading-relaxed border-l-4 border-zinc-100 pl-8 ml-2">&quot;{n.message}&quot;</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                  {!n.isRead && <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow" />}
                  <button 
                    onClick={() => {
                       markAsRead(n.id);
                       setSelectedNotification(n);
                    }}
                    className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-zinc-300 group-hover:text-primary group-hover:bg-primary/5 transition-all cursor-pointer"
                  >
                     <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* ── Footer Guidance ── */}
      <div className="p-12 bg-zinc-50 border border-zinc-100 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 group shadow-inner">
         <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform"><Bell className="w-8 h-8 text-primary" /></div>
         <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-xl font-black italic tracking-tighter uppercase italic">Stay Integrated.</h4>
            <p className="text-sm text-zinc-400 font-medium italic italic leading-relaxed">
               &quot;Aktifkan notifikasi email pada menu <Link href="/dashboard/settings" className="text-primary hover:underline italic font-black">Settings</Link> untuk mendapatkan peringatan langsung ke gawai Anda kapanpun dibutuhkan.&quot;
            </p>
         </div>
      </div>
      {/* ── Detail Modal ── */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-300 text-left">
           <Card padding="none" className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-zinc-100 animate-in zoom-in-95 duration-300 relative p-8">
              <div className="flex items-start justify-between mb-6">
                 <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400">Notifikasi Sistem</span>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 mt-1">{selectedNotification.title}</h3>
                 </div>
                 <button onClick={() => setSelectedNotification(null)} className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-4 text-xs font-bold">
                 <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Pesan / Alert</p>
                    <p className="text-zinc-650 font-medium font-sans leading-relaxed">&quot;{selectedNotification.message}&quot;</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Tipe Notifikasi</p>
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black border leading-none uppercase tracking-widest inline-block mt-1",
                          notificationStyles[selectedNotification.type]?.badge
                       )}>
                          {selectedNotification.type} ALERT
                       </span>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                       <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Kategori</p>
                       <p className="text-zinc-800 text-xs font-black uppercase tracking-wider mt-1">{selectedNotification.category}</p>
                    </div>
                 </div>

                 <div className="bg-zinc-50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Waktu Diterima</p>
                    <p className="text-zinc-500 font-medium font-sans mt-0.5">
                       {new Date(selectedNotification.createdAt).toLocaleString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                 </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <Button onClick={() => setSelectedNotification(null)} className="flex-1 h-12 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    Tutup Notifikasi
                 </Button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
