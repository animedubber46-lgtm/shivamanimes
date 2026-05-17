import { useListSolveLinks } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useMemo } from "react";

function detectIndianUser(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") return true;
    const offset = -new Date().getTimezoneOffset();
    if (offset === 330) return true;
  } catch {
    // ignore
  }
  return false;
}

export default function SolveLinkPage() {
  const { user } = useAuth();
  const isIndian = useMemo(() => detectIndianUser(), []);
  const { data: links = [], isLoading } = useListSolveLinks();

  if (isIndian && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-4xl mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-destructive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-foreground mb-3">Not Available in Your Region</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              The Solve Link feature is not available for users in India. Please use the Buy Premium option to get access.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="/buy-premium"
                className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
              >
                Buy Premium — Starting ₹10
              </a>
              <a
                href="/"
                className="px-6 py-2.5 rounded-lg border border-border text-foreground font-semibold text-sm hover:border-primary/50 transition-all"
              >
                Go Home
              </a>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-6">Detection based on device timezone: Asia/Kolkata (IST)</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            Non-Indian Users Only
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">Solve Link</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Complete tasks via shortener links to unlock free premium access. Available for users outside India only.
          </p>
        </motion.div>

        {/* Trending first */}
        {!isLoading && links.some(l => l.isTrending) && (
          <section className="mb-8">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-primary" />
              Trending
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {links.filter(l => l.isTrending).map((link, i) => (
                <SolveLinkCard key={link.id} link={link} i={i} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-accent" />
            All Links
          </h2>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <p className="text-muted-foreground text-sm">No solve links available at this time.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {links.map((link, i) => (
                <SolveLinkCard key={link.id} link={link} i={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type SolveLink = {
  id: number;
  title: string;
  description?: string | null;
  image?: string | null;
  shortenerUrl: string;
  isTrending: boolean;
  createdAt: string;
};

function SolveLinkCard({ link, i }: { link: SolveLink; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      className={`rounded-xl border p-4 transition-all group ${link.isTrending ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card"}`}
    >
      <div className="flex gap-3">
        {link.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img src={link.image} alt={link.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {link.isTrending && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-semibold">HOT</span>
            )}
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{link.title}</h3>
          </div>
          {link.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{link.description}</p>}
          <a
            href={link.shortenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Link
          </a>
        </div>
      </div>
    </motion.div>
  );
}
