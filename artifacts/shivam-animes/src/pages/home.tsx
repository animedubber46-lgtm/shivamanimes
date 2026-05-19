import { Link } from "wouter";
import { useGetFeaturedAnime, useGetRecentAnime } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const { data: featured = [], isLoading: featuredLoading } = useGetFeaturedAnime();
  const { data: recent = [], isLoading: recentLoading } = useGetRecentAnime();
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  const banner = featured[bannerIdx];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden pt-16">
        {banner ? (
          <>
            <motion.img
              key={bannerIdx}
              src={banner.bannerImage ?? banner.coverImage ?? ""}
              alt={banner.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 max-w-2xl">
              <motion.div
                key={`info-${bannerIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex gap-2 mb-3">
                  {(banner.genres ?? []).slice(0, 3).map(g => (
                    <span key={g} className="text-xs px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary">{g}</span>
                  ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-foreground mb-2 drop-shadow-lg">{banner.title}</h1>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-lg">{banner.description}</p>
                <div className="flex gap-3">
                  {user?.isPremium || user?.role === "admin" ? (
                    <Link href={`/anime/${banner.id}`}
                      className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                    >
                      Watch Now
                    </Link>
                  ) : (
                    <Link href="/buy-premium"
                      className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/30"
                    >
                      Unlock Premium
                    </Link>
                  )}
                  <Link href={`/anime/${banner.id}`}
                    className="px-6 py-2.5 rounded-lg border border-border/60 text-foreground font-semibold text-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    Details
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        )}

        {/* Banner dots */}
        {featured.length > 1 && (
          <div className="absolute bottom-4 right-8 flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? "bg-primary w-6" : "bg-border"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Premium CTA if not logged in */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 text-center"
          >
            <h2 className="text-xl font-bold text-foreground mb-2">Join Premium Today</h2>
            <p className="text-sm text-muted-foreground mb-4">Get unlimited access to all anime. Starting at just ₹10.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/buy-premium" className="px-6 py-2.5 rounded-lg bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
                Buy Premium
              </Link>
              <Link href="/login" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}

        {/* Trending / Featured */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
            <Link href="/browse" className="text-sm text-primary hover:text-primary/80 transition-colors">View All</Link>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featured.map((anime, i) => (
                <motion.div key={anime.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <AnimeCard anime={anime} showViewCount />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Recently Added */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recently Updated</h2>
            <Link href="/browse" className="text-sm text-primary hover:text-primary/80 transition-colors">View All</Link>
          </div>
          {recentLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recent.map((anime, i) => (
                <motion.div key={anime.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <AnimeCard anime={anime} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
