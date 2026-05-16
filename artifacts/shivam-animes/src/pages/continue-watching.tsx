import { useGetWatchProgress } from "@workspace/api-client-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function ContinueWatchingPage() {
  const { data: progress = [], isLoading } = useGetWatchProgress();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">Continue Watching</h1>
          <p className="text-sm text-muted-foreground">{progress.length} episodes in progress</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : progress.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <p className="text-muted-foreground text-sm">No episodes in progress</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Start watching anime to see your progress here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.map((item, i) => (
              <motion.div key={item.episodeId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/watch/${item.episodeId}`}>
                  <div className="flex gap-3 p-3 rounded-xl bg-card border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.animeTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.animeTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ep {item.episodeNumber}: {item.episodeTitle}</p>
                      <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (item.progressSeconds / 1440) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground/60 mt-1">{Math.floor(item.progressSeconds / 60)}m watched</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
