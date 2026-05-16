import { useParams, Link } from "wouter";
import { useGetAnime, useAddToWatchlist, useRemoveFromWatchlist, getGetWatchlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AnimeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const { data: anime, isLoading } = useGetAnime(id, { query: { enabled: !!id } });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();
  const [inWatchlist, setInWatchlist] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4">
          <div className="h-72 rounded-2xl bg-card animate-pulse mb-6" />
          <div className="h-8 w-64 rounded bg-card animate-pulse mb-3" />
          <div className="h-4 w-full rounded bg-card animate-pulse mb-2" />
          <div className="h-4 w-3/4 rounded bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Anime not found.</div>
      </div>
    );
  }

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await removeMutation.mutateAsync({ animeId: id });
        setInWatchlist(false);
        toast({ title: "Removed from watchlist" });
      } else {
        await addMutation.mutateAsync({ animeId: id });
        setInWatchlist(true);
        toast({ title: "Added to watchlist" });
      }
      queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden pt-16">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt={anime.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10 pb-12">
        <div className="flex gap-6 mb-6">
          {/* Cover */}
          <div className="hidden sm:block w-36 flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden ring-2 ring-border shadow-2xl">
              {anime.coverImage ? (
                <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-card flex items-center justify-center text-primary/30 text-4xl">▶</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              {anime.genres.map(g => (
                <span key={g} className="text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">{g}</span>
              ))}
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${anime.status === "ongoing" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-blue-500/10 border border-blue-500/20 text-blue-400"}`}>
                {anime.status === "ongoing" ? "Ongoing" : "Completed"}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-foreground mb-2">{anime.title}</h1>

            <div className="flex gap-4 text-sm text-muted-foreground mb-3">
              {anime.releaseYear && <span>{anime.releaseYear}</span>}
              <span>{anime.episodeCount} Episodes</span>
              <span>{anime.viewCount.toLocaleString()} Views</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 max-w-2xl leading-relaxed">{anime.description}</p>

            <div className="flex gap-3 flex-wrap">
              {anime.episodes && anime.episodes.length > 0 && (
                <Link href={`/watch/${anime.episodes[0].id}`}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                >
                  Watch Ep 1
                </Link>
              )}
              <button
                onClick={toggleWatchlist}
                className={`px-5 py-2 rounded-lg border font-semibold text-sm transition-all ${inWatchlist ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
              >
                {inWatchlist ? "In Watchlist" : "+ Watchlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Episodes */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Episodes</h2>
          {!anime.episodes || anime.episodes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No episodes available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {anime.episodes.map((ep, i) => (
                <motion.div key={ep.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={`/watch/${ep.id}`}>
                    <div className="flex gap-3 p-3 rounded-xl bg-card border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                      <div className="w-24 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {ep.thumbnail ? (
                          <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/30">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary font-semibold mb-0.5">Episode {ep.number}</p>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{ep.title}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
