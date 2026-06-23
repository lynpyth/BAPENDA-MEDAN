"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Search, Users, Building2, CreditCard, ArrowRight, Loader2, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchResults {
  users: Array<{ id: string; name: string; email: string; role: string; nik?: string; phone?: string }>;
  taxObjects: Array<{ id: string; nop: string; name: string; address: string; owner: { name: string } }>;
  payments: Array<{ id: string; invoiceNumber: string; amount: number; status: string; taxObject: { nop: string } }>;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setResults({ users: [], taxObjects: [], payments: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setResults(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [query]);

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 selection:bg-primary/20 text-left">
      {/* ── Page Header ── */}
      <div className="space-y-4 px-4">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Global Index Search</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
          Hasil <span className="text-primary italic">Pencarian.</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
          Menampilkan hasil pencarian global untuk &quot;<span className="text-primary font-black not-italic">{query}</span>&quot; di seluruh database.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {/* ── Wajib Pajak ── */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 pl-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Wajib Pajak ({results?.users.length ?? 0})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results?.users.map((u) => (
                <Card key={u.id} className="bg-white border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="px-4 py-1 bg-primary/5 border border-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full italic">{u.role}</span>
                    <h3 className="text-xl font-black uppercase italic leading-tight text-zinc-900 group-hover:text-primary transition-colors">{u.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium italic">{u.email} • {u.nik || "Tanpa NIK"}</p>
                  </div>
                  <Link href="/dashboard/admin/users">
                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                </Card>
              ))}
              {results?.users.length === 0 && (
                <div className="col-span-2 py-12 text-center bg-zinc-50 border border-zinc-100 rounded-[2.5rem] italic text-zinc-400 font-bold">Tidak ada wajib pajak yang cocok.</div>
              )}
            </div>
          </section>

          {/* ── Objek Pajak ── */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 pl-4">
              <Building2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Objek Pajak ({results?.taxObjects.length ?? 0})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results?.taxObjects.map((obj) => (
                <Card key={obj.id} className="bg-white border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="px-4 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full italic">{obj.nop}</span>
                    <h3 className="text-xl font-black uppercase italic leading-tight text-zinc-900 group-hover:text-primary transition-colors">{obj.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium italic">{obj.address} • Pemilik: {obj.owner.name}</p>
                  </div>
                  <Link href="/dashboard/admin/tax-objects">
                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                </Card>
              ))}
              {results?.taxObjects.length === 0 && (
                <div className="col-span-2 py-12 text-center bg-zinc-50 border border-zinc-100 rounded-[2.5rem] italic text-zinc-400 font-bold">Tidak ada objek pajak yang cocok.</div>
              )}
            </div>
          </section>

          {/* ── Transaksi ── */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 pl-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Riwayat Transaksi ({results?.payments.length ?? 0})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results?.payments.map((p) => (
                <Card key={p.id} className="bg-white border-zinc-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className={cn(
                      "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border italic",
                      p.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>{p.status}</span>
                    <h3 className="text-xl font-black uppercase italic leading-tight text-zinc-900 group-hover:text-primary transition-colors">{formatCurrency(p.amount)}</h3>
                    <p className="text-xs text-zinc-400 font-medium italic">{p.invoiceNumber} • NOP: {p.taxObject.nop}</p>
                  </div>
                  <Link href="/dashboard/admin/payments">
                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                </Card>
              ))}
              {results?.payments.length === 0 && (
                <div className="col-span-2 py-12 text-center bg-zinc-50 border border-zinc-100 rounded-[2.5rem] italic text-zinc-400 font-bold">Tidak ada transaksi yang cocok.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
