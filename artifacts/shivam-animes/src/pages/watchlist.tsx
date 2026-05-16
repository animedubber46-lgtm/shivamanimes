import { useGetWatchlist } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import { motion } from "framer-motion";

export default function WatchlistPage() {
  const { data: watchlist = [], isLoading } = useGetWatchlist();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">My Watchlist</h1>
          <p className="text-sm text-muted-foreground">{watchlist.length} saved anime</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Your watchlist is empty</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Browse anime and add them to your watchlist</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.map((anime, i) => (
              <motion.div key={anime.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
