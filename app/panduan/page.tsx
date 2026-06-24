"use client";

import PublicLayout from "@/components/PublicLayout";
import {
   CreditCard, ArrowRight, ShieldCheck, Zap,
   Smartphone, Monitor, HelpCircle,
   Play, Download, CheckCircle, Search
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";

const guides = [
   {
      id: 1, title: "Cara Pendaftaran Akun SIPADA", desc: "Langkah mudah membuat akun untuk mengakses seluruh layanan pajak daerah di Kota Medan.", steps: [
         "Kunjungi portal SIPADA Medan melalui browser Anda.",
         "Pilih menu 'Daftar Akun' di pojok kanan atas.",
         "Lengkapi data diri (NIK, Nama Sesuai KTP, Email, No. HP).",
         "Verifikasi email Anda melalui tautan yang dikirimkan.",
         "Selesaikan pengaturan kata sandi dan login perdana."
      ], icon: ShieldCheck, color: "bg-primary/5 text-primary border-primary/10"
   },
   {
      id: 2, title: "Prosedur Pembayaran PBB Online", desc: "Panduan lengkap membayar Pajak Bumi dan Bangunan menggunakan kode bayar digital.", steps: [
         "Dapatkan NOP (Nomor Objek Pajak) dari SPPT Anda.",
         "Pilih menu 'Cek Tagihan' dan masukkan NOP.",
         "Klik 'Bayar Pajak' untuk mendapatkan Virtual Account.",
         "Lakukan transfer melalui Bank Mandiri, BNI, BRI, atau e-Wallet.",
         "Unduh resi pembayaran digital dari menu riwayat."
      ], icon: CreditCard, color: "bg-primary/5 text-primary border-primary/10"
   },
   {
      id: 3, title: "Pelaporan Pajak Restoran (PB1)", desc: "Metode pelaporan omzet bulanan bagi wajib pajak badan/usaha di Kota Medan.", steps: [
         "Login sebagai Wajib Pajak di portal SIPADA.",
         "Pilih modul 'Pajak Restoran' > 'Lapor Omzet'.",
         "Input jumlah omzet harian atau total dalam satu bulan.",
         "Sistem akan mengalkulasi 10% dari omzet secara otomatis.",
         "Keluarkan kode bayar dan selesaikan transaksi."
      ], icon: Zap, color: "bg-amber-50 text-amber-600 border-amber-100"
   },
];

export default function PanduanPage() {
   const { toast } = useToast();
   const { data: session } = useSession();
   const router = useRouter();
   const [activeGuide, setActiveGuide] = useState(guides[0].id);
   const [search, setSearch] = useState("");

   const filteredGuides = guides.filter(g =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase())
   );

   const handleSupport = () => {
      if (session) {
         router.push("/dashboard/pengaduan");
      } else {
         router.push("/login");
      }
   };

   const handleDownload = () => {
      toast("Mempersiapkan Unduhan", "Dokumen PDF sedang diproses oleh server Bapenda. Mohon tunggu sejenak...", "info");
   };

   const handleWatch = () => {
      toast("Pemutar Video", "Fitur Video Tutorial sedang dalam tahap finalisasi kualitas 4K. Cek kembali segera!", "info");
   };

   return (
      <PublicLayout>
         <div className="container mx-auto px-6 py-20 space-y-16 selection:bg-primary/20">

            {/* ── Header Command ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-left">
               <div className="max-w-4xl space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                     <div className="w-6 h-0.5 bg-primary" />
                     <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Panduan Pengguna</p>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-foreground">
                     Pusat Panduan
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed border-l-4 border-primary pl-4">
                     Setiap langkah dipermudah. Pelajari cara mengoptimalkan penggunaan portal SIPADA untuk kemudahan administrasi fiskal Anda secara inklusif.
                  </p>
               </div>

               <div className="relative w-full lg:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                     type="text"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     placeholder="Cari topik panduan..."
                     className="w-full pl-11 pr-4 h-12 bg-white border border-zinc-200 rounded-xl text-xs font-semibold uppercase tracking-wider outline-none shadow-sm focus:border-primary/50 transition-all text-left"
                  />
               </div>
            </div>

            {/* ── Layout Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
               {/* ── Navigation Tabs Lobby ── */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-2">
                     {filteredGuides.length === 0 ? (
                        <div className="p-8 text-center bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
                           <HelpCircle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Topik Tidak Ditemukan</p>
                        </div>
                     ) : (
                        filteredGuides.map((g) => (
                           <button
                              key={g.id}
                              onClick={() => setActiveGuide(g.id)}
                              className={cn(
                                 "w-full flex items-center gap-4 px-6 h-18 py-3 rounded-xl font-bold transition-all text-left",
                                 activeGuide === g.id
                                    ? "bg-primary text-white scale-[1.01]"
                                    : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm"
                              )}
                           >
                              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all", activeGuide === g.id ? "bg-white/20 border-white/20" : "bg-zinc-50 border-zinc-200 text-zinc-600")}>
                                 <g.icon className="w-5 h-5" />
                              </div>
                              <span className="text-xs uppercase tracking-wider leading-tight">{g.title}</span>
                           </button>
                        ))
                     )}
                  </div>

                  {/* ── Promo Light Section ── */}
                  <Card className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6 shadow-sm text-left">
                     <div className="space-y-4 text-center flex flex-col items-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/5">
                           <Play className="w-5 h-5 fill-primary text-primary" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-lg font-bold tracking-tight uppercase text-foreground">Tutorial Visual</h4>
                           <p className="text-xs text-muted-foreground">Video panduan langkah demi langkah penggunaan sistem.</p>
                        </div>
                        <Button variant="outline" onClick={handleWatch} className="w-full h-10 rounded-xl font-bold uppercase text-xs tracking-wider border-zinc-200 bg-white hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">Tonton Video <ArrowRight className="w-4 h-4" /></Button>
                     </div>
                  </Card>
               </div>

               {/* ── Guide Steps Canvas ── */}
               <div className="lg:col-span-8">
                  {guides.map((g) => activeGuide === g.id && (
                     <Card key={g.id} className="bg-white border border-zinc-200 rounded-xl p-8 lg:p-12 relative flex flex-col shadow-sm text-left min-h-[500px]">
                        <div className="flex-1 space-y-8">
                           <div className="space-y-4">
                              <div className="inline-flex px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/10 leading-none">Panduan #{g.id}</div>
                              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground uppercase">{g.title}</h2>
                              <p className="text-sm text-muted-foreground leading-relaxed border-l-4 border-zinc-200 pl-4">{g.desc}</p>
                           </div>

                           <div className="grid grid-cols-1 gap-4">
                              {g.steps.map((step, i) => (
                                 <div key={i} className="flex items-start gap-4 p-4 bg-zinc-50 border border-zinc-200/50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 font-bold text-lg text-primary border border-zinc-200">
                                       {i + 1}
                                    </div>
                                    <div className="space-y-1 pt-1.5 flex-1">
                                       <p className="text-sm font-semibold text-foreground leading-snug">
                                          {step}
                                       </p>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="pt-6 flex flex-wrap gap-4 border-t border-zinc-100">
                              <Button onClick={handleDownload} className="rounded-xl px-6 h-11 bg-primary text-white hover:bg-primary/95 font-bold uppercase text-xs tracking-wider flex items-center gap-2">Unduh PDF <Download className="w-4 h-4" /></Button>
                              <Button variant="outline" onClick={handleSupport} className="rounded-xl px-6 h-11 font-bold uppercase text-xs tracking-wider border-zinc-200 bg-white hover:bg-zinc-50 transition-all text-zinc-600 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-primary" /> Hubungi Dukungan</Button>
                           </div>
                        </div>
                     </Card>
                  ))}
               </div>
            </div>
         </div>
      </PublicLayout>
   );
}
