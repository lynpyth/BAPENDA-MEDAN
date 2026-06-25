"use client";

import PublicLayout from "@/components/PublicLayout";
import { 
  Building2, Map, CreditCard, LayoutGrid, 
  Car, Droplets, Tv, ArrowRight, Star, Zap, Bird
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const taxTypes = [
  { id: "pkb", title: "PKB (Kendaraan Bermotor)", icon: Car, desc: "Pajak atas kepemilikan dan/atau penguasaan kendaraan bermotor di wilayah Kota Medan.", rate: "1.5% - 2%", period: "Tahunan", canSimulate: true },
  { id: "bbn-kb", title: "BBN-KB (Bea Balik Nama)", icon: Car, desc: "Bea balik nama atas penyerahan hak kepemilikan kendaraan bermotor.", rate: "10%", period: "Per Transaksi", canSimulate: false },
  { id: "pbb-kb", title: "PBB-KB (Bahan Bakar)", icon: Droplets, desc: "Pajak atas penggunaan bahan bakar kendaraan bermotor.", rate: "5% - 10%", period: "Bulanan", canSimulate: false },
  { id: "p-rokok", title: "Pajak Rokok", icon: Tv, desc: "Pajak atas konsumsi rokok yang dipungut bersamaan dengan cukai rokok.", rate: "10% dari Cukai", period: "Per Transaksi", canSimulate: false },
  { id: "p-reklame", title: "Pajak Reklame", icon: LayoutGrid, desc: "Pajak atas penyelenggaraan reklame (papan, spanduk, billboard, dll) secara komersial.", rate: "25% dari NSR", period: "Tahunan", canSimulate: true },
  { id: "pat", title: "PAT (Pajak Air Tanah)", icon: Droplets, desc: "Pajak atas pengambilan dan/atau pemanfaatan air tanah.", rate: "20% dari NPA", period: "Bulanan", canSimulate: false },
  { id: "pbb-p2", title: "PBB-P2 (Bumi & Bangunan)", icon: Building2, desc: "Pajak atas bumi dan/atau bangunan yang dimiliki, dikuasai, dan/atau dimanfaatkan oleh orang pribadi atau badan.", rate: "0.1% - 0.2%", period: "Tahunan", canSimulate: true },
  { id: "bphtb", title: "BPHTB (Tanah & Bangunan)", icon: Map, desc: "Bea perolehan hak atas tanah dan bangunan karena adanya perbuatan atau peristiwa hukum.", rate: "5% (NPOP-NPOPTKP)", period: "Per Transaksi", canSimulate: true },
  { id: "pab", title: "PAB (Alat Berat)", icon: Car, desc: "Pajak atas kepemilikan dan/atau penguasaan alat berat.", rate: "0.2% dari NJAB", period: "Tahunan", canSimulate: false },
  { id: "pbjt-hotel", title: "PBJT Jasa Perhotelan", icon: Building2, desc: "Pajak atas pelayanan yang disediakan oleh hotel dan tempat penginapan sejenis.", rate: "10%", period: "Bulanan", canSimulate: true },
  { id: "pbjt-mamin", title: "PBJT Makanan & Minuman", icon: CreditCard, desc: "Pajak atas penjualan makanan dan/atau minuman oleh restoran, kafe, warung, dll.", rate: "10%", period: "Bulanan", canSimulate: true },
  { id: "pbjt-hiburan", title: "PBJT Kesenian & Hiburan", icon: Tv, desc: "Pajak atas penyelenggaraan jasa kesenian, olahraga, dan hiburan komersial.", rate: "10% - 40%", period: "Bulanan", canSimulate: false },
  { id: "pbjt-listrik", title: "PBJT Tenaga Listrik", icon: Zap, desc: "Pajak atas konsumsi tenaga listrik baik yang dihasilkan sendiri maupun dari sumber lain.", rate: "3% - 10%", period: "Bulanan", canSimulate: false },
  { id: "pbjt-parkir", title: "PBJT Jasa Parkir", icon: Car, desc: "Pajak atas penyelenggaraan tempat parkir di luar badan jalan.", rate: "10%", period: "Bulanan", canSimulate: true },
  { id: "p-walet", title: "Pajak Sarang Burung Walet", icon: Bird, desc: "Pajak atas kegiatan pengambilan dan/atau pengusahaan sarang burung walet.", rate: "10%", period: "Per Panen / Bulanan", canSimulate: true },
];

export default function PajakDaerah() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(taxTypes[0].id);

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-20 space-y-16 selection:bg-primary/20">
         {/* Header */}
         <div className="max-w-4xl space-y-4 text-left">
            <p className="text-primary font-bold uppercase tracking-wider text-xs">Informasi Fiskal</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-foreground">
               Jenis Pajak Daerah
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed border-l-4 border-primary pl-4">
               Memahami struktur perpajakan daerah Kota Medan. Kami menghadirkan transparansi mengenai tarif, periode pelaporan, dan penggunaan dana pajak Anda.
            </p>
         </div>

         {/* Interactive Explorer */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-4 space-y-2">
               {taxTypes.map((t) => (
                  <button
                     key={t.id}
                     onClick={() => setActiveTab(t.id)}
                     className={cn(
                        "w-full flex items-center gap-4 px-6 h-16 rounded-xl font-semibold transition-all text-left",
                        activeTab === t.id 
                           ? "bg-primary text-white scale-[1.01]" 
                           : "text-zinc-600 hover:bg-zinc-50 border border-zinc-200 bg-white shadow-sm"
                     )}
                   >
                     <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border transition-all", activeTab === t.id ? "bg-white/20 border-white/20" : "bg-zinc-50 border-zinc-200")}>
                        <t.icon className={cn("w-4 h-4", activeTab === t.id ? "text-white" : "text-zinc-600")} />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-wider truncate">{t.title}</span>
                  </button>
               ))}
            </div>

            {/* Content View */}
            <div className="lg:col-span-8">
               {taxTypes.map((t) => activeTab === t.id && (
                  <Card key={t.id} className="relative bg-white border border-zinc-200 rounded-2xl p-8 lg:p-12 text-left min-h-[460px] flex flex-col justify-between shadow-sm">
                     <div className="space-y-8 flex-1">
                        <div className="space-y-4">
                           <div className="w-14 h-14 rounded-xl bg-slate-50 border border-zinc-200 flex items-center justify-center text-primary">
                              <t.icon className="w-6 h-6" />
                           </div>
                           <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground uppercase">{t.title}</h2>
                        </div>
                        
                        <p className="text-base text-muted-foreground leading-relaxed border-l-4 border-zinc-200 pl-4">
                           {t.desc}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tarif Pajak Berjalan</p>
                              <div className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl w-fit">
                                 <p className="text-xl font-bold text-primary tracking-tight">{t.rate}</p>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Periode Pelaporan</p>
                              <div className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl w-fit">
                                 <p className="text-xl font-bold text-foreground tracking-tight uppercase">{t.period}</p>
                              </div>
                           </div>
                        </div>

                        <div className="pt-6 flex flex-wrap gap-4 border-t border-zinc-100">
                           <Link href={session ? "/dashboard/pajak/objek" : "/login"}>
                              <Button className="rounded-xl px-6 h-11 bg-primary text-white hover:bg-primary/95 font-bold uppercase text-xs tracking-wider flex items-center gap-2">{session ? "Bayar Sekarang" : "Masuk Portal"} <ArrowRight className="w-4 h-4" /></Button>
                           </Link>
                           {t.canSimulate && (
                              <Link href={session ? "/dashboard/pajak/hitung" : "/login"}>
                                 <Button variant="outline" className="rounded-xl px-6 h-11 font-bold uppercase text-xs tracking-wider border-zinc-200 bg-white hover:bg-zinc-50 transition-all">Simulasi Pajak <Star className="ml-2 w-4 h-4 text-amber-500 fill-amber-500" /></Button>
                              </Link>
                           )}
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </div>

         {/* Public Insight Section */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
               { label: "Dana Pembangunan", desc: "Dana pajak daerah dikembalikan dalam bentuk perbaikan infrastruktur jalan dan fasilitas umum Kota Medan." },
               { label: "Layanan Sosial", desc: "Kontribusi Anda mendanai program kesehatan, pendidikan gratis, dan jaring pengaman sosial warga." },
               { label: "Medan Berkah", desc: "Mari wujudkan Kota Medan yang lebih mandiri dan berdaya saing melalui kepatuhan pajak yang tinggi." }
            ].map((insight, index) => (
               <Card key={index} className="text-center p-6 bg-white border border-zinc-200 rounded-xl shadow-sm space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                     <Star className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-lg font-bold tracking-tight uppercase leading-none">{insight.label}</h4>
                     <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
                  </div>
               </Card>
            ))}
         </div>
      </div>
    </PublicLayout>
  );
}
