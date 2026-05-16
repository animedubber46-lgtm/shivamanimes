import { useListSolveLinks } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function SolveLinkPage() {
  const { data: links = [], isLoading } = useListSolveLinks();

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
            Complete tasks via shortener links to unlock free premium access. This feature is available for users outside India only.
          </p>
        </motion.div>

        {/* Region notice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-400">Regional Restriction</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Indian users: Solve Link is not available in your region. Please use the Buy Premium option instead.
                Non-Indian users may proceed with the links below.
              </p>
            </div>
          </div>
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

        {/* All links */}
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

function SolveLinkCard({ link, i }: { link: { id: number; title: string; description?: string | null; image?: string | null; shortenerUrl: string; isTrending: boolean; createdAt: string }; i: number }) {
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
