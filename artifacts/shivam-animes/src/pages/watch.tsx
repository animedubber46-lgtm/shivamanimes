import { useParams, Link } from "wouter";
import { useGetStreamToken, useSaveWatchProgress, getGetStreamTokenQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WatchPage() {
  const params = useParams<{ episodeId: string }>();
  const episodeId = parseInt(params.episodeId ?? "0");
  const { data: streamData, isLoading, error } = useGetStreamToken(episodeId, {
    query: { enabled: !!episodeId, queryKey: getGetStreamTokenQueryKey(episodeId) },
  });
  const saveMutation = useSaveWatchProgress();
  const { toast } = useToast();
  const progressRef = useRef(0);

  // Anti-bypass protection
  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    const disableKeys = (e: KeyboardEvent): void => {
      const blocked = [
        e.key === "F12",
        e.ctrlKey && ["u", "U", "s", "S", "c", "C", "i", "I", "j", "J"].includes(e.key),
        e.key === "PrintScreen",
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
        toast({ title: "Action not permitted on this page", variant: "destructive" });
      }
    };

    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("keydown", disableKeys);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("keydown", disableKeys);
    };
  }, []);

  // Save progress every 30s
  useEffect(() => {
    if (!episodeId) return;
    const interval = setInterval(() => {
      if (progressRef.current > 0) {
        saveMutation.mutate({ episodeId, data: { progressSeconds: progressRef.current } });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [episodeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !streamData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-16 gap-4">
          <p className="text-muted-foreground">Unable to load stream. Premium access required.</p>
          <Link href="/buy-premium" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            Buy Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <Navbar />
      <div className="pt-16 max-w-5xl mx-auto px-4 py-6">
        {/* Stream player */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl shadow-primary/20 ring-1 ring-border/30">
          {/* Watermark overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-[0.04]">
            <p className="text-white text-6xl font-black tracking-widest rotate-[-30deg] select-none">SHIVAM ANIMES</p>
          </div>

          {/* Protected content overlay */}
          <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-black/60 border border-primary/30 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-semibold">PROTECTED</span>
          </div>

          {/* Player placeholder — real stream via token */}
          <div className="absolute inset-0 bg-gradient-to-br from-black to-[#0a0010] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">Premium Stream Active</p>
              <p className="text-white/40 text-xs mt-1 font-mono">Token: {streamData.token.slice(0, 16)}...</p>
              <p className="text-white/30 text-xs mt-0.5">Expires: {new Date(streamData.expiresAt).toLocaleTimeString()}</p>
            </div>
            <p className="text-white/20 text-xs max-w-xs text-center">
              This is a protected stream. Recording, capturing, or sharing is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Episode {episodeId}</p>
            <p className="text-xs text-muted-foreground">Stream expires at {new Date(streamData.expiresAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>Secure session active</span>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-muted-foreground">
          Recording, screenshotting, or sharing this content is a violation of our terms of service and may result in permanent account termination.
        </div>
      </div>
    </div>
  );
}
