"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, Search, ShieldAlert, Star, 
  Activity, ArrowRight, Filter, ShieldCheck, 
  Trash2, Plus, X, Loader2, Eye, EyeOff, Key, Mail, User as UserIcon, Edit2, CheckCircle2, AlertTriangle, Phone
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nik?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  _count: { taxObjects: number; payments: number };
}

const ROLES = ["USER", "OFFICER", "ADMIN", "MAHASISWA"] as const;
type UserRole = (typeof ROLES)[number];

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-500/5",
  OFFICER: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5",
  USER: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5",
  MAHASISWA: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5",
  DEVELOPER: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Super Admin",
  OFFICER: "Field Officer",
  USER: "Wajib Pajak",
  MAHASISWA: "Civitas Research",
  DEVELOPER: "System Dev",
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, ACTIVE, INACTIVE
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", role: "USER" as UserRole, nik: "", phone: "", address: "", isActive: true
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", role: "USER" as UserRole, nik: "", phone: "", address: "", isActive: true, password: ""
  });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => toast("Gagal Sinkronisasi", "Sistem tidak dapat memanggil data identitas dari database pusat.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    const newStatus = !currentStatus;
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
      if (!res.ok) throw new Error();
      
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u)));
      toast("Status Diperbarui", `User sekarang ${newStatus ? 'Aktif' : 'Nonaktif'}`, "success");
    } catch {
      toast("Kesalahan Sistem", "Gagal memperbarui status aktif user.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
     if (!confirm("Hapus identitas ini secara permanen dari sistem?")) return;
     setUpdatingId(id);
     try {
       const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
       if (!res.ok) throw new Error();
       setUsers(prev => prev.filter(u => u.id !== id));
       toast("Terhapus", "Akun telah dimusnahkan dari database.", "success");
     } catch {
       toast("Gagal", "Sistem menolak perintah penghapusan.", "error");
     } finally {
       setUpdatingId(null);
     }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
        const res = await fetch("/api/users", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(newUser)
        });
        if (!res.ok) throw new Error();
        setShowCreateModal(false);
        setNewUser({ name: "", email: "", password: "", role: "USER", nik: "", phone: "", address: "", isActive: true });
        fetchUsers();
        toast("Berhasil", "Node identitas baru telah didaftarkan dalam sistem.", "success");
    } catch {
        toast("Error", "Gagal registrasi identitas baru.", "error");
    } finally {
        setCreateLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "USER",
      nik: user.nik || "",
      phone: user.phone || "",
      address: user.address || "",
      isActive: user.isActive,
      password: ""
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          ...editForm,
          password: editForm.password || undefined
        }),
      });
      if (!res.ok) throw new Error();
      setShowEditModal(false);
      fetchUsers();
      toast("Berhasil", "Identitas user telah diperbarui.", "success");
    } catch {
      toast("Error", "Gagal memperbarui data user.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nik?.includes(search);
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || 
      (filterStatus === "ACTIVE" && u.isActive) ||
      (filterStatus === "INACTIVE" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 selection:bg-primary/20 text-left w-full">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Security Identity Hub</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            Manajemen <span className="text-primary italic">User.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Sistem manajemen otoritas pusat (IAM) untuk mengelola data wajib pajak, petugas lapangan, dan akses administratif Bapenda Medan.&quot;
          </p>
        </div>
        <div className="flex items-center gap-6">
            <Button 
               size="xl" 
               onClick={() => setShowCreateModal(true)}
               className="btn-premium px-10 h-20 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 group"
            >
               Registrasi User <Plus className="ml-4 w-5 h-5 group-hover:rotate-90 transition-transform" />
            </Button>
            <Card padding="lg" variant="outline" className="hidden xl:flex bg-zinc-50 border border-zinc-100 rounded-[2.5rem] shadow-inner py-4 px-8 min-w-[200px] text-right">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] italic leading-none">Total Nodes</p>
                  <p className="text-2xl font-black italic tracking-tighter uppercase">{users.length} <span className="text-primary tracking-normal font-sans text-xs">Identities</span></p>
               </div>
            </Card>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 pt-6">
        <div className="lg:col-span-3 relative group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Identitas, Email, atau NIK Pengguna..."
            className="w-full pl-22 pr-10 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.04] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-lg tracking-tight italic"
          />
        </div>
        <div className="relative group lg:col-span-1.5">
           <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
           <select
             value={filterRole}
             onChange={(e) => setFilterRole(e.target.value)}
             className="w-full pl-16 pr-6 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.04] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer italic"
           >
             <option value="ALL">Semua Unit</option>
             {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
           </select>
        </div>
        <div className="relative group lg:col-span-1.5">
           <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
           <select
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
             className="w-full pl-16 pr-6 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.04] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer italic"
           >
             <option value="ALL">Semua Status</option>
             <option value="ACTIVE">Aktif</option>
             <option value="INACTIVE">Nonaktif</option>
           </select>
        </div>
      </div>

      {/* ── Users Table ── */}
      <Card padding="none" className="bg-white border-zinc-100 rounded-[3rem] overflow-hidden shadow-xl shadow-primary/[0.02]">
        <div className="overflow-x-auto w-full">
           <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                 <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Node ID / User</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Kontak</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">NIK</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Aset / Transaksi</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                 {loading ? (
                    <tr>
                       <td colSpan={7} className="p-8"><div className="flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div></td>
                    </tr>
                 ) : filtered.length === 0 ? (
                    <tr>
                       <td colSpan={7} className="px-8 py-16 text-center text-zinc-300 italic font-bold">Void List — Tidak ada user ditemukan.</td>
                    </tr>
                 ) : (
                    filtered.map((u) => (
                       <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-lg italic">
                                   {u.name?.[0] ?? "U"}
                                </div>
                                <div>
                                   <p className="text-xs font-black uppercase tracking-tight text-zinc-900">{u.name}</p>
                                   <span className="text-[9px] font-black text-zinc-400 uppercase italic">NODE: {u.id.slice(-8).toUpperCase()}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-xs font-bold text-zinc-700">{u.email}</p>
                             <p className="text-[10px] text-zinc-400 font-bold">{u.phone || "—"}</p>
                          </td>
                          <td className="px-8 py-6 text-xs text-zinc-500 font-bold">{u.nik || "—"}</td>
                          <td className="px-8 py-6">
                             <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm", roleBadge[u.role])}>
                                {roleLabel[u.role] ?? u.role}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                             {u._count.taxObjects} Aset • {u._count.payments} Transaksi
                          </td>
                          <td className="px-8 py-6">
                             <button
                               onClick={() => handleToggleActive(u.id, u.isActive)}
                               disabled={updatingId === u.id}
                               className={cn(
                                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                                  u.isActive 
                                     ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                                     : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                               )}
                             >
                                {u.isActive ? "Aktif" : "Nonaktif"}
                             </button>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => openEditModal(u)}
                                  disabled={updatingId === u.id}
                                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm cursor-pointer"
                                  title="Edit User"
                                >
                                   <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(u.id)}
                                  disabled={updatingId === u.id}
                                  className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                                  title="Hapus User"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </Card>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-6 text-left animate-in fade-in duration-500">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-20">
              <div className="flex items-start justify-between mb-16">
                 <div className="space-y-3">
                    <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none italic">New <span className="text-primary">Node.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-2 italic shadow-glow">Identity Creation Terminal</p>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-8 h-8" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Full Legal Name</label>
                    <div className="relative group">
                       <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                       <input 
                         required 
                         className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                         placeholder="Nama Lengkap..." 
                         value={newUser.name}
                         onChange={e => setNewUser({...newUser, name: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Email Address</label>
                       <div className="relative group">
                          <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required type="email"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="email@bapenda.go.id" 
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">System Password</label>
                       <div className="relative group">
                          <Key className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required type="password"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="••••••••" 
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">NIK (16 Digit)</label>
                       <div className="relative group">
                          <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="1271..." 
                            value={newUser.nik}
                            onChange={e => setNewUser({...newUser, nik: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Nomor Telepon</label>
                       <div className="relative group">
                          <Phone className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="0812..." 
                            value={newUser.phone}
                            onChange={e => setNewUser({...newUser, phone: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Authority Level</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={newUser.role}
                         onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                       >
                         {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Status Akun</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={newUser.isActive ? "ACTIVE" : "INACTIVE"}
                         onChange={e => setNewUser({...newUser, isActive: e.target.value === "ACTIVE"})}
                       >
                          <option value="ACTIVE">Aktif</option>
                          <option value="INACTIVE">Nonaktif</option>
                       </select>
                    </div>
                 </div>

                 <Button 
                    disabled={createLoading}
                    type="submit" 
                    className="w-full h-24 bg-primary text-white font-black rounded-full shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase italic"
                 >
                    {createLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : "Deploy Identity Node"}
                 </Button>
              </form>
           </Card>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-6 text-left animate-in fade-in duration-500">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-20">
              <div className="flex items-start justify-between mb-16">
                 <div className="space-y-3">
                    <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none italic">Edit <span className="text-primary">User.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-2 italic shadow-glow">Modify Identity configuration</p>
                 </div>
                 <button onClick={() => setShowEditModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-8 h-8" /></button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Full Legal Name</label>
                    <div className="relative group">
                       <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                       <input 
                         required 
                         className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                         placeholder="Nama Lengkap..." 
                         value={editForm.name}
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Email Address</label>
                       <div className="relative group">
                          <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required type="email"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="email@bapenda.go.id" 
                            value={editForm.email}
                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">New Password (Optional)</label>
                       <div className="relative group">
                          <Key className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            type="password"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="Kosongkan jika tidak diubah" 
                            value={editForm.password}
                            onChange={e => setEditForm({...editForm, password: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">NIK (16 Digit)</label>
                       <div className="relative group">
                          <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="1271..." 
                            value={editForm.nik}
                            onChange={e => setEditForm({...editForm, nik: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Nomor Telepon</label>
                       <div className="relative group">
                          <Phone className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="0812..." 
                            value={editForm.phone}
                            onChange={e => setEditForm({...editForm, phone: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Authority Level</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={editForm.role}
                         onChange={e => setEditForm({...editForm, role: e.target.value as UserRole})}
                       >
                         {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Status Akun</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={editForm.isActive ? "ACTIVE" : "INACTIVE"}
                         onChange={e => setEditForm({...editForm, isActive: e.target.value === "ACTIVE"})}
                       >
                          <option value="ACTIVE">Aktif</option>
                          <option value="INACTIVE">Nonaktif</option>
                       </select>
                    </div>
                 </div>

                 <Button 
                    disabled={editLoading}
                    type="submit" 
                    className="w-full h-24 bg-primary text-white font-black rounded-full shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase italic"
                 >
                    {editLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : "Save Changes"}
                 </Button>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
}
