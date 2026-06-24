"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Clock, Shield, LayoutGrid, Info, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string; // SYSTEM or DASHBOARD
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "SYSTEM">("DASHBOARD");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dashboardNotifications = notifications.filter((n) => n.category === "DASHBOARD");
  const systemNotifications = notifications.filter((n) => n.category === "SYSTEM");

  const unreadDashboardCount = dashboardNotifications.filter((n) => !n.isRead).length;
  const unreadSystemCount = systemNotifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const activeNotifications = activeTab === "DASHBOARD" ? dashboardNotifications : systemNotifications;

  return (
    <div className="relative">
      <button
        suppressHydrationWarning
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-primary/20 flex items-center justify-center relative transition-all active:scale-95 group shadow-inner"
      >
        <Bell className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-in zoom-in-50 duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-zinc-950/5 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-zinc-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
              <div className="text-left">
                <h3 className="font-black text-lg tracking-tight uppercase text-zinc-800">Notifikasi</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Pusat Informasi Digital</p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[9px] text-primary font-black uppercase tracking-wider hover:underline flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Semua Dibaca
                </button>
              )}
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-zinc-100 text-xs font-bold bg-zinc-50/30">
              <button
                onClick={() => setActiveTab("DASHBOARD")}
                className={cn(
                  "flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2",
                  activeTab === "DASHBOARD"
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                {unreadDashboardCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-black rounded-full leading-none">
                    {unreadDashboardCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("SYSTEM")}
                className={cn(
                  "flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-2",
                  activeTab === "SYSTEM"
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Sistem</span>
                {unreadSystemCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-zinc-400 text-white text-[8px] font-black rounded-full leading-none">
                    {unreadSystemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-[360px] overflow-y-auto no-scrollbar divide-y divide-zinc-50">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider animate-pulse">Menghubungkan...</p>
                </div>
              ) : activeNotifications.length === 0 ? (
                <div className="p-12 text-center space-y-4 text-zinc-400">
                  <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner opacity-60">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold">Tidak ada pemberitahuan baru.</p>
                </div>
              ) : (
                activeNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markSingleAsRead(n.id)}
                    className={cn(
                      "p-5 text-left hover:bg-zinc-50 transition-all flex gap-4 cursor-pointer relative",
                      !n.isRead && "bg-primary/[0.01]"
                    )}
                  >
                    {/* Icon mapping */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner",
                      n.type === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      n.type === "WARNING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      n.type === "ERROR" ? "bg-rose-50 text-rose-600 border-rose-100" :
                      "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {n.type === "SUCCESS" ? <CheckCircle2 className="w-5 h-5" /> :
                       n.type === "WARNING" ? <AlertTriangle className="w-5 h-5" /> :
                       n.type === "ERROR" ? <AlertTriangle className="w-5 h-5" /> :
                       <Info className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs leading-tight tracking-tight",
                        !n.isRead ? "font-black text-zinc-800" : "text-zinc-500 font-bold"
                      )}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed font-medium">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1 text-[8px] text-zinc-400 mt-2 font-bold uppercase tracking-wider">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-lg" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 text-center border-t border-zinc-100 shadow-inner">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-all"
              >
                Tutup Notifikasi
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
