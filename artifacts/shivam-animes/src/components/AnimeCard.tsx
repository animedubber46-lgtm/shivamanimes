import { Link } from "wouter";
import type { Anime } from "@workspace/api-client-react";

interface AnimeCardProps {
  anime: Anime;
  showViewCount?: boolean;
}

export default function AnimeCard({ anime, showViewCount }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="group relative overflow-hidden rounded-xl bg-card border border-border/40 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          {anime.coverImage ? (
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <span className="text-4xl text-primary/30">▶</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors">{anime.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs font-medium ${anime.status === "ongoing" ? "text-green-400" : "text-blue-400"}`}>
              {anime.status === "ongoing" ? "Ongoing" : "Completed"}
            </span>
            <span className="text-xs text-muted-foreground">{anime.episodeCount} eps</span>
          </div>
          {showViewCount && (
            <p className="text-xs text-muted-foreground mt-0.5">{(anime.viewCount ?? 0).toLocaleString()} views</p>
          )}
          {(anime.genres ?? []).length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {(anime.genres ?? []).slice(0, 2).map(g => (
                <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 border border-primary/20">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
