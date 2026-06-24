"use client";

import PublicLayout from "@/components/PublicLayout";
import { 
  Megaphone, FileText, BookOpen, 
  Search, ArrowRight, Clock, Star
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function InformasiPage() {
  const { toast } = useToast();
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch(window.location.origin + "/api/cms/news")
      .then(async r => {
        const contentType = r.headers.get("content-type");
        if (!r.ok || !contentType || !contentType.includes("application/json")) {
           const bodyText = await r.text();
           console.error("[INFORMASI_API_BAD_RESPONSE]", {
              status: r.status,
              contentType,
              isOk: r.ok,
              bodySnippet: bodyText.substring(0, 100)
           });
           // Fallback to empty if server returns non-JSON (like dev errors or login redirects)
           return [];
        }
        return r.json();
      })
      .then(d => {
        const newsItems = Array.isArray(d) ? d : (d && typeof d === 'object' && 'error' in d) ? [] : [d];
        setAllNews(newsItems as NewsItem[]);
      })
      .catch(err => {
        console.error("[INFORMASI_CLIENT_FETCH_ERROR]", err);
        setAllNews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Semua", "Berita", "Pengumuman", "Artikel", "Regulasi"];

  const filteredNews = allNews.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (n.summary || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === "Semua" || 
                        n.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCategory;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast("Berhasil", "Email Anda telah terdaftar dalam sistem newsletter kami.", "success");
    setEmail("");
  };

  const getIcon = (cat: string) => {
    if (cat === "ARTIKEL") return BookOpen;
    if (cat === "PENGUMUMAN") return FileText;
    if (cat === "INOVASI") return Star;
    return Megaphone;
  };

  const getColor = (cat: string) => {
    if (cat === "ARTIKEL") return "bg-amber-500";
    if (cat === "PENGUMUMAN") return "bg-red-500";
    if (cat === "INOVASI") return "bg-blue-500";
    return "bg-primary";
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-20 space-y-16 selection:bg-primary/20">
         {/* Header */}
         <div className="max-w-4xl space-y-4 text-left">
            <p className="text-primary font-bold uppercase tracking-wider text-xs">Pusat Informasi</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-foreground">
               Warta & Pembaruan
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed border-l-4 border-primary pl-4">
               Sumber berita resmi, pengumuman publik, dan panduan terkini mengenai kebijakan pendapatan daerah Kota Medan secara real-time.
            </p>
         </div>

         {/* Search & Categories */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar">
               {categories.map(cat => (
                  <Button 
                    key={cat} 
                    variant="ghost" 
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 h-10 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap",
                      activeCategory === cat 
                        ? "bg-primary text-white border-primary" 
                        : "bg-white border-zinc-200 hover:border-primary/20 text-zinc-600 shadow-sm"
                    )}
                  >
                    {cat}
                  </Button>
               ))}
            </div>
            <div className="relative max-w-md w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari berita atau pengumuman..." 
                  className="w-full pl-11 pr-4 h-10 bg-white border border-zinc-200 rounded-xl focus:border-primary/50 transition-all text-xs font-semibold uppercase tracking-wider outline-none shadow-sm"
               />
            </div>
         </div>

         {/* Featured Content Ledger */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
               [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-zinc-50 border border-zinc-200 rounded-xl animate-pulse" />)
            ) : filteredNews.length === 0 ? (
               <div className="lg:col-span-2 py-20 text-center bg-white border-2 border-dashed border-zinc-200 rounded-xl">
                  <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Berita tidak ditemukan</p>
               </div>
            ) : (
               filteredNews.map((item) => {
                  const Icon = getIcon(item.category);
                  const colorClass = getColor(item.category);
                  return (
                     <Card key={item.id} className="group flex flex-col md:flex-row overflow-hidden border border-zinc-200 hover:border-primary/30 transition-all bg-white shadow-sm rounded-xl p-0 text-left">
                        <div className={cn("md:w-12 flex flex-col items-center justify-center text-white py-6 shrink-0", colorClass)}>
                           <Icon className="w-5 h-5 rotate-[-90deg] md:rotate-0" />
                        </div>
                        <div className="flex-1 p-6 space-y-4 relative overflow-hidden">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2.5 py-0.5 rounded border border-primary/10 leading-none">{item.category}</span>
                              <div className="flex items-center gap-1 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider leading-none">
                                 <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                           </div>
                           <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors uppercase">{item.title}</h3>
                           <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                              {item.summary || item.content?.substring(0, 120) + "..."}
                           </p>
                           <div className="pt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toast("Akses Terbatas", "Detail artikel saat ini hanya tersedia melalui Portal Berita Internal.", "info")}
                                className="px-0 group-hover:text-primary gap-2 font-bold uppercase text-[10px] tracking-wider transition-all rounded-none"
                              >
                                 Baca Artikel Lengkap <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </div>
                     </Card>
                  );
               })
            )}
         </div>

         {/* Newsletter CTA */}
         <Card className="bg-white border border-zinc-200 rounded-xl relative shadow-sm text-center p-8 md:p-12 overflow-hidden">
            <div className="max-w-xl mx-auto space-y-6">
               <div className="mx-auto w-12 h-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Megaphone className="w-6 h-6" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight uppercase text-foreground">Selalu Terinformasi</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                     Dapatkan update langsung mengenai regulasi pajak terbaru dan pengumuman pelayanan ke kotak masuk Anda secara otomatis.
                  </p>
               </div>
               <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row items-center gap-4 pt-4">
                  <input 
                     type="email" 
                     required
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="Daftarkan Email Anda" 
                     className="w-full h-11 bg-zinc-50 rounded-xl border border-zinc-200 px-4 outline-none focus:bg-white focus:border-primary/50 transition-all text-xs font-semibold uppercase tracking-wider"
                  />
                  <Button type="submit" className="rounded-xl h-11 px-6 bg-primary text-white hover:bg-primary/95 font-bold uppercase text-xs tracking-wider whitespace-nowrap flex items-center gap-2">
                     Langganan <ArrowRight className="w-4 h-4" />
                  </Button>
               </form>
            </div>
         </Card>
      </div>
    </PublicLayout>
  );
}
