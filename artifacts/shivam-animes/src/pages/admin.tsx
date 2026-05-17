import { useState } from "react";
import { useListUsers, useUpdateUser, useCreateUser, useCreateAnime, useCreateEpisode, useGetAnalyticsSummary, useGetTopAnime, useListAnime, useDeleteAnime } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "users" | "anime" | "analytics" | "add-anime" | "add-episode" | "create-user";

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");

  const TAB_LABELS: Record<Tab, string> = {
    users: "Users",
    anime: "Anime",
    "add-anime": "Add Anime",
    "add-episode": "Add Episode",
    "create-user": "Create User",
    analytics: "Analytics",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
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

        <div className="flex gap-1 mb-6 p-1 bg-card border border-border/50 rounded-xl w-fit flex-wrap">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === "users" && <UsersTab />}
        {tab === "anime" && <AnimeTab />}
        {tab === "add-anime" && <AddAnimeTab />}
        {tab === "add-episode" && <AddEpisodeTab />}
        {tab === "create-user" && <CreateUserTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

function UsersTab() {
  const { data, isLoading, refetch } = useListUsers();
  const users = data?.users ?? [];
  const updateMutation = useUpdateUser();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState<Record<number, string>>({});

  const toggle = async (userId: number, field: "isPremium" | "isSuspended", value: boolean, premiumDays?: number) => {
    try {
      const payload: { isPremium?: boolean; isSuspended?: boolean; premiumDays?: number } = { [field]: value };
      if (field === "isPremium" && value && premiumDays) payload.premiumDays = premiumDays;
      if (field === "isPremium" && !value) payload.premiumDays = 0;
      await updateMutation.mutateAsync({ id: userId, data: payload });
      await refetch();
      toast({ title: field === "isPremium" ? (value ? "Premium granted!" : "Premium removed") : (value ? "User suspended" : "User unsuspended") });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast({ title: msg, variant: "destructive" });
    }
  };

  if (isLoading) return <LoadingGrid />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{users.length} user{users.length !== 1 ? "s" : ""} total — click a row to expand full details</p>
      {users.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="rounded-xl border border-border/50 overflow-hidden"
        >
          {/* Row summary — clickable */}
          <button
            onClick={() => setExpanded(expanded === user.id ? null : user.id)}
            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-card/60 transition-colors"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-black text-primary">
              {user.username[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground">{user.username}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {user.role}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${user.isPremium ? "bg-yellow-500/10 text-yellow-400" : "bg-muted/60 text-muted-foreground"}`}>
                  {user.isPremium ? "Premium" : "Free"}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${user.isSuspended ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-400"}`}>
                  {user.isSuspended ? "Suspended" : "Active"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">ID: {user.id} · Joined {fmt(user.createdAt)}</p>
            </div>

            <svg className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded === user.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded === user.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border/30 bg-card/30 space-y-4 pt-3">
                  {/* Detail grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "User ID", value: String(user.id) },
                      { label: "Username", value: user.username },
                      { label: "Role", value: user.role },
                      { label: "Status", value: user.isSuspended ? "Suspended" : "Active" },
                      { label: "Plan", value: user.isPremium ? "Premium" : "Free" },
                      { label: "Premium Until", value: fmt(user.premiumUntil) },
                      { label: "Last Login", value: fmt(user.lastLogin) },
                      { label: "Last Login IP", value: user.lastLoginIp ?? "—" },
                      { label: "Device ID", value: user.deviceId ? user.deviceId.slice(0, 20) + (user.deviceId.length > 20 ? "…" : "") : "— (no lock)" },
                      { label: "Account Created", value: fmt(user.createdAt) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-background/40 rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-xs font-mono text-foreground break-all">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {!user.isPremium ? (
                      <>
                        <button
                          onClick={() => toggle(user.id, "isPremium", true, 15)}
                          disabled={updateMutation.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all font-semibold disabled:opacity-50"
                        >
                          +15 Days Premium
                        </button>
                        <button
                          onClick={() => toggle(user.id, "isPremium", true, 30)}
                          disabled={updateMutation.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 transition-all font-semibold disabled:opacity-50"
                        >
                          +30 Days Premium
                        </button>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            placeholder="Custom days"
                            value={customDays[user.id] ?? ""}
                            onChange={e => setCustomDays(d => ({ ...d, [user.id]: e.target.value }))}
                            className="w-24 bg-background border border-border text-foreground rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => {
                              const days = parseInt(customDays[user.id] ?? "");
                              if (days > 0) toggle(user.id, "isPremium", true, days);
                            }}
                            disabled={updateMutation.isPending || !customDays[user.id]}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all font-semibold disabled:opacity-50"
                          >
                            Grant
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => toggle(user.id, "isPremium", false)}
                        disabled={updateMutation.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border hover:border-destructive/40 hover:text-destructive transition-all disabled:opacity-50"
                      >
                        Remove Premium
                      </button>
                    )}

                    {user.role !== "admin" && (
                      !user.isSuspended ? (
                        <button
                          onClick={() => toggle(user.id, "isSuspended", true)}
                          disabled={updateMutation.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-all font-semibold disabled:opacity-50"
                        >
                          Suspend User
                        </button>
                      ) : (
                        <button
                          onClick={() => toggle(user.id, "isSuspended", false)}
                          disabled={updateMutation.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-50"
                        >
                          Unsuspend User
                        </button>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

function AddEpisodeTab() {
  const createMutation = useCreateEpisode();
  const { data: animeData } = useListAnime({ page: 1, limit: 100 });
  const { toast } = useToast();
  const animeList = animeData?.anime ?? [];

  const [form, setForm] = useState({
    animeId: "",
    number: "",
    title: "",
    streamUrl: "",
    thumbnail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.animeId || !form.number || !form.title || !form.streamUrl) {
      toast({ title: "Anime, episode number, title, and link are required", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        animeId: parseInt(form.animeId),
        data: {
          number: parseInt(form.number),
          title: form.title,
          streamUrl: form.streamUrl,
          thumbnail: form.thumbnail || undefined,
        },
      });
      toast({ title: "Episode added!" });
      setForm({ animeId: form.animeId, number: "", title: "", streamUrl: "", thumbnail: "" });
    } catch {
      toast({ title: "Error adding episode", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-1">Add Episode with Link</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Add an episode and paste the video/stream link. Users will be redirected directly to this link when they click the episode.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Anime</label>
            <select
              value={form.animeId}
              onChange={e => setForm(f => ({ ...f, animeId: e.target.value }))}
              required
              className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Select anime...</option>
              {animeList.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Episode Number</label>
              <input
                type="number"
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                placeholder="e.g. 1"
                required
                className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Episode title"
                required
                className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Stream / Video Link
              <span className="ml-2 text-primary/60 normal-case tracking-normal">(users click → redirected here)</span>
            </label>
            <input
              type="url"
              value={form.streamUrl}
              onChange={e => setForm(f => ({ ...f, streamUrl: e.target.value }))}
              placeholder="https://your-stream-link.com/episode"
              required
              className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Thumbnail URL (optional)</label>
            <input
              type="url"
              value={form.thumbnail}
              onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://image-url.com/thumb.jpg"
              className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-semibold">Tip:</span> You can paste any URL — a Telegram file link, Google Drive link, direct MP4, or a third-party player link. Premium users will be redirected to it when they click the episode.
            </p>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
          >
            {createMutation.isPending ? "Adding..." : "Add Episode"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateUserTab() {
  const createMutation = useCreateUser();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", isPremium: false, premiumDays: "30" });
  const [showPassword, setShowPassword] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      toast({ title: "Username and password are required", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (form.password.length < 4) {
      toast({ title: "Password must be at least 4 characters", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: {
          username: form.username.trim(),
          password: form.password,
          isPremium: form.isPremium,
          premiumDays: form.isPremium ? parseInt(form.premiumDays) || 30 : undefined,
        },
      });
      setLastCreated({ username: form.username.trim(), password: form.password });
      setForm({ username: "", password: "", confirmPassword: "", isPremium: false, premiumDays: "30" });
      toast({ title: `User "${form.username.trim()}" created!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-lg">
      <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">Create Premium User</h2>
          <p className="text-xs text-muted-foreground">Create a login for a user who has paid for premium. Share the credentials with them via Telegram.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="e.g. Shivam123"
              required
              className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Create a strong password"
                required
                className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-primary"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12 0c1.274-4.057 5.065-7 9-7s7.726 2.943 9 7c-1.274 4.057-5.065 7-9 7s-7.726-2.943-9-7z" />
                  }
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              required
              className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Premium toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div>
              <p className="text-sm font-semibold text-foreground">Grant Premium Access</p>
              <p className="text-xs text-muted-foreground">Enable if user has paid</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isPremium: !f.isPremium }))}
              className={`w-11 h-6 rounded-full transition-all relative ${form.isPremium ? "bg-yellow-500" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isPremium ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
            </button>
          </div>

          {form.isPremium && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Premium Duration (days)</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {["15", "30", "60", "90"].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, premiumDays: d }))}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${form.premiumDays === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={form.premiumDays}
                onChange={e => setForm(f => ({ ...f, premiumDays: e.target.value }))}
                className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create User"}
          </button>
        </form>

        {/* Last created credentials — show to copy & share */}
        {lastCreated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-green-500/5 border border-green-500/30"
          >
            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">User Created — Share these credentials</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-background/60 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">Username</span>
                <span className="text-sm font-mono font-bold text-foreground">{lastCreated.username}</span>
              </div>
              <div className="flex items-center justify-between bg-background/60 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">Password</span>
                <span className="text-sm font-mono font-bold text-foreground">{lastCreated.password}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Copy these and send to user via Telegram. This will disappear when you create another user.</p>
          </motion.div>
        )}
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
