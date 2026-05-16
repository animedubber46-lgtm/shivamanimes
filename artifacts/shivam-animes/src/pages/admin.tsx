import { useState } from "react";
import { useListUsers, useUpdateUser, useCreateAnime, useGetAnalyticsSummary, useGetTopAnime, useListAnime, useDeleteAnime } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type Tab = "users" | "anime" | "analytics" | "add-anime";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage users, anime library, and analytics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-card border border-border/50 rounded-xl w-fit flex-wrap">
          {(["users", "anime", "add-anime", "analytics"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>

        {tab === "users" && <UsersTab />}
        {tab === "anime" && <AnimeTab />}
        {tab === "add-anime" && <AddAnimeTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users = [], isLoading, refetch } = useListUsers();
  const updateMutation = useUpdateUser();
  const { toast } = useToast();

  const toggle = async (userId: number, field: "isPremium" | "isSuspended", value: boolean, premiumDays?: number) => {
    try {
      const data: { isPremium?: boolean; isSuspended?: boolean; premiumDays?: number } = { [field]: value };
      if (field === "isPremium" && value && premiumDays) data.premiumDays = premiumDays;
      await updateMutation.mutateAsync({ id: userId, data });
      refetch();
      toast({ title: "User updated" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isLoading) return <LoadingGrid />;

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-card/60 border-b border-border/40">
        <span className="col-span-3 text-xs font-semibold text-muted-foreground uppercase">User</span>
        <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Role</span>
        <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Premium</span>
        <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Status</span>
        <span className="col-span-3 text-xs font-semibold text-muted-foreground uppercase">Actions</span>
      </div>
      {users.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-border/20 hover:bg-card/40 transition-colors items-center"
        >
          <div className="col-span-3">
            <p className="text-sm font-semibold text-foreground">{user.username}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
          <div className="col-span-2">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${user.role === "admin" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"}`}>
              {user.role}
            </span>
          </div>
          <div className="col-span-2">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${user.isPremium ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-muted text-muted-foreground"}`}>
              {user.isPremium ? "Premium" : "Free"}
            </span>
          </div>
          <div className="col-span-2">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${user.isSuspended ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
              {user.isSuspended ? "Suspended" : "Active"}
            </span>
          </div>
          <div className="col-span-3 flex gap-1.5 flex-wrap">
            {!user.isPremium && (
              <button
                onClick={() => toggle(user.id, "isPremium", true, 30)}
                className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all font-semibold"
              >
                +30d Premium
              </button>
            )}
            {user.isPremium && (
              <button
                onClick={() => toggle(user.id, "isPremium", false)}
                className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground border border-border hover:border-primary/30 transition-all"
              >
                Remove Premium
              </button>
            )}
            {!user.isSuspended && user.role !== "admin" && (
              <button
                onClick={() => toggle(user.id, "isSuspended", true)}
                className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-all font-semibold"
              >
                Suspend
              </button>
            )}
            {user.isSuspended && (
              <button
                onClick={() => toggle(user.id, "isSuspended", false)}
                className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all"
              >
                Unsuspend
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AnimeTab() {
  const { data, isLoading, refetch } = useListAnime({ page: 1, limit: 50 });
  const deleteMutation = useDeleteAnime();
  const { toast } = useToast();
  const anime = data?.anime ?? [];

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this anime?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast({ title: "Anime deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isLoading) return <LoadingGrid />;

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-card/60 border-b border-border/40">
        <span className="col-span-5 text-xs font-semibold text-muted-foreground uppercase">Anime</span>
        <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Status</span>
        <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase">Episodes</span>
        <span className="col-span-3 text-xs font-semibold text-muted-foreground uppercase">Actions</span>
      </div>
      {anime.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-border/20 hover:bg-card/40 transition-colors items-center"
        >
          <div className="col-span-5 flex items-center gap-3">
            {a.coverImage && (
              <img src={a.coverImage} alt={a.title} className="w-8 h-12 object-cover rounded" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground line-clamp-1">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.releaseYear}</p>
            </div>
          </div>
          <div className="col-span-2">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${a.status === "ongoing" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"}`}>
              {a.status}
            </span>
          </div>
          <div className="col-span-2 text-sm text-muted-foreground">{a.episodeCount}</div>
          <div className="col-span-3 flex gap-1.5">
            <button
              onClick={() => handleDelete(a.id)}
              className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-all"
            >
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AddAnimeTab() {
  const createMutation = useCreateAnime();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "", description: "", genres: "", tags: "", releaseYear: new Date().getFullYear(), coverImage: "", bannerImage: "", status: "ongoing" as "ongoing" | "completed",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: {
          title: form.title,
          description: form.description,
          genres: form.genres.split(",").map(s => s.trim()).filter(Boolean),
          tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
          releaseYear: form.releaseYear,
          coverImage: form.coverImage || undefined,
          bannerImage: form.bannerImage || undefined,
          status: form.status,
        },
      });
      toast({ title: "Anime added successfully!" });
      setForm({ title: "", description: "", genres: "", tags: "", releaseYear: new Date().getFullYear(), coverImage: "", bannerImage: "", status: "ongoing" });
    } catch {
      toast({ title: "Error adding anime", variant: "destructive" });
    }
  };

  const field = (label: string, key: keyof typeof form, type: string = "text", placeholder?: string) => (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {type === "select" ? (
        <select
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      ) : (
        <input
          type={type}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? parseInt(e.target.value) : e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Add New Anime</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Title", "title", "text", "e.g. Demon Slayer")}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Anime description..."
              className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
          {field("Genres (comma separated)", "genres", "text", "Action, Drama, Fantasy")}
          {field("Tags (comma separated)", "tags", "text", "epic, swords, magic")}
          {field("Release Year", "releaseYear", "number")}
          {field("Cover Image URL", "coverImage", "url", "https://...")}
          {field("Banner Image URL", "bannerImage", "url", "https://...")}
          {field("Status", "status", "select")}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
          >
            {createMutation.isPending ? "Adding..." : "Add Anime"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const { data: analytics, isLoading: aLoading } = useGetAnalyticsSummary();
  const { data: topAnime = [], isLoading: tLoading } = useGetTopAnime();
  const isLoading = aLoading || tLoading;

  if (isLoading) return <LoadingGrid />;
  if (!analytics) return <p className="text-muted-foreground text-sm">No analytics data.</p>;

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, color: "primary" },
    { label: "Premium Users", value: analytics.premiumUsers, color: "yellow" },
    { label: "Total Anime", value: analytics.totalAnime, color: "accent" },
    { label: "Total Episodes", value: analytics.totalEpisodes, color: "green" },
    { label: "Active Sessions", value: analytics.activeSessions, color: "blue" },
    { label: "Total Views", value: analytics.totalViews?.toLocaleString(), color: "primary" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-5"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-3xl font-black ${s.color === "yellow" ? "text-yellow-400" : s.color === "accent" ? "text-accent" : s.color === "green" ? "text-green-400" : s.color === "blue" ? "text-blue-400" : "text-primary"}`}>
              {s.value ?? 0}
            </p>
          </motion.div>
        ))}
      </div>

      {topAnime.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-4">Top Anime by Views</h2>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            {topAnime.map((a, i) => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 border-b border-border/20 hover:bg-card/40 transition-colors">
                <span className={`text-lg font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-amber-600" : "text-muted-foreground/50"}`}>
                  #{i + 1}
                </span>
                <span className="text-sm font-semibold text-foreground flex-1">{a.title}</span>
                <span className="text-sm text-muted-foreground">{(a.viewCount ?? 0).toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-card animate-pulse" />
      ))}
    </div>
  );
}
