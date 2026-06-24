"use client";

import PublicLayout from "@/components/PublicLayout";
import { 
  Building2, Map, CreditCard, Search, 
  ClipboardCheck, GraduationCap, Megaphone, 
  FileQuestion, LayoutGrid, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useSession } from "next-auth/react";

const services = [
  { 
    id: "pbb", 
    title: "Pajak Bumi & Bangunan", 
    desc: "Manajemen SPPT, cek tagihan, dan pembayaran PBB-P2 online secara mandiri.", 
    icon: Building2, 
    color: "bg-primary/5 text-primary border-primary/10",
    href: "/dashboard/pajak/objek"
  },
  { 
    id: "bphtb", 
    title: "BPHTB", 
    desc: "Pelaporan dan pembayaran Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB).", 
    icon: Map, 
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    href: "/dashboard/pajak/objek"
  },
  { 
    id: "reklame", 
    title: "Pajak Reklame", 
    desc: "Pendaftaran, perpanjangan, dan monitoring pajak iklan/reklame di wilayah Kota Medan.", 
    icon: LayoutGrid, 
    color: "bg-amber-50 text-amber-600 border-amber-100",
    href: "/dashboard/pajak/objek"
  },
  { 
    id: "restoran", 
    title: "Pajak Restoran", 
    desc: "Pelaporan omzet bulanan dan pembayaran pajak restoran/PB1 secara real-time.", 
    icon: CreditCard, 
    color: "bg-primary/5 text-primary border-primary/10",
    href: "/dashboard/pajak/objek"
  },
  { 
    id: "verifikasi", 
    title: "Verifikasi Data", 
    desc: "Layanan validasi dokumen dan status pembayaran pajak daerah resmi Bapenda.", 
    icon: ClipboardCheck, 
    color: "bg-zinc-50 text-zinc-600 border-border/50",
    href: "/dashboard"
  },
  { 
    id: "riset", 
    title: "Izin Riset", 
    desc: "Permohonan pengambilan data untuk keperluan penelitian dan tugas akhir akademik.", 
    icon: GraduationCap, 
    color: "bg-zinc-50 text-zinc-600 border-border/50",
    href: "/dashboard/mahasiswa/pengajuan"
  },
  { 
    id: "ppid", 
    title: "PPID / Informasi", 
    desc: "Permohonan informasi publik dan keterbukaan data pemerintah daerah.", 
    icon: FileQuestion, 
    color: "bg-zinc-50 text-zinc-600 border-border/50",
    href: "/dashboard/ppid"
  },
  { 
    id: "pengaduan", 
    title: "Aduan Publik", 
    desc: "Salurkan aspirasi dan pengaduan terkait layanan Bapenda Medan melalui kanal resmi.", 
    icon: Megaphone, 
    color: "bg-red-50 text-red-600 border-red-100",
    href: "/dashboard/pengaduan"
  },
];

export default function LayananPage() {
  const { data: session } = useSession();

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-20 space-y-16 selection:bg-primary/20">
         
         {/* ── Header Command ── */}
         <div className="max-w-4xl space-y-4 text-left">
            <div className="flex items-center gap-2 text-primary">
               <div className="w-6 h-0.5 bg-primary" />
               <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Menu Layanan</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-foreground">
               Katalog Layanan
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed border-l-4 border-primary pl-4">
               Pilih layanan digital terintegrasi yang Anda butuhkan. Kami berkomitmen memberikan kemudahan akses data fiskal secara presisi, cepat, dan transparan.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
               <Card key={s.id} className="group bg-white border border-zinc-200 hover:border-primary/30 transition-all p-6 flex flex-col justify-between shadow-sm rounded-xl min-h-[260px]">
                  <div className="space-y-4 text-left">
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border transition-all", s.color)}>
                        <s.icon className="w-6 h-6" />
                     </div>
                     
                     <div className="space-y-2">
                        <h3 className="text-lg font-bold tracking-tight text-foreground uppercase group-hover:text-primary transition-colors leading-tight">{s.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
                     </div>
                  </div>
                  
                  <div className="pt-4 text-left">
                     <Link href={session ? s.href : "/login"}>
                        <Button variant="ghost" size="sm" className="px-0 group-hover:text-primary gap-2 font-bold uppercase text-[10px] tracking-wider transition-all">
                           {session ? "Buka Layanan" : "Akses Portal"} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                     </Link>
                  </div>
               </Card>
            ))}
         </div>

         {/* ── Help Desk Overlay ── */}
         <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 text-foreground shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1 space-y-6 text-left">
                  <div className="space-y-2">
                     <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase text-foreground">Butuh Bantuan Teknis?</h2>
                     <p className="text-sm text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 max-w-xl">
                        Tim dukungan kami siap membantu Anda memahami prosedur dan persyaratan setiap layanan pajak daerah di Kota Medan secara real-time.
                     </p>
                  </div>
                  <Link href="/panduan">
                     <Button className="rounded-xl px-6 h-11 bg-primary text-white hover:bg-primary/95 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                        Pusat Bantuan Digital <Search className="w-4 h-4" />
                     </Button>
                  </Link>
               </div>
               <div className="hidden lg:flex justify-center shrink-0">
                  <div className="w-48 h-48 bg-slate-50 rounded-2xl border border-zinc-200 flex items-center justify-center shadow-sm relative">
                     <FileQuestion className="w-24 h-24 text-primary opacity-80" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </PublicLayout>
  );
}
