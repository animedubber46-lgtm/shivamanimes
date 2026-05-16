import { useState } from "react";
import { useListAnime } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import { motion } from "framer-motion";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Supernatural", "Sci-Fi", "School", "Dark Fantasy", "Ninja"];
const STATUSES = [
  { label: "All", value: "" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

export default function BrowsePage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 18;

  const { data, isLoading } = useListAnime({
    search: search || undefined,
    genre: genre || undefined,
    status: status || undefined,
    page,
    limit,
  });

  const anime = data?.anime ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">Browse Anime</h1>
          <p className="text-sm text-muted-foreground">{total > 0 ? `${total} anime available` : "Discover your next favorite"}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search anime..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Genre pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setGenre(""); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!genre ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            All Genres
          </button>
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => { setGenre(g === genre ? "" : g); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${genre === g ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : anime.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No anime found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {anime.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <AnimeCard anime={a} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-foreground disabled:opacity-40 hover:border-primary/50 transition-colors"
                >
                  Prev
                </button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-foreground disabled:opacity-40 hover:border-primary/50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
