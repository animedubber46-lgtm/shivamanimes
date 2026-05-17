import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function LoginPage() {
  const { user, setToken, deviceId } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  if (user) return <Redirect to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({
        data: { username, password, deviceId },
      });
      setToken(result.token);
      toast({ title: `Welcome back, ${result.user.username}!` });
      navigate(result.user.role === "admin" ? "/admin" : "/");
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error ?? "Login failed. Check your credentials.";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/60 shadow-lg shadow-primary/30 mb-4">
              <img src="https://4kwallpapers.com/images/walls/thumbs_2t/22996.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SHIVAM ANIMES
            </h1>
            <p className="text-xs text-muted-foreground mt-1 tracking-wider">PREMIUM ACCESS</p>
          </div>

          {/* Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl shadow-primary/10">
            <h2 className="text-lg font-bold text-foreground mb-1">Sign In</h2>
            <p className="text-xs text-muted-foreground mb-6">Enter your credentials to access premium content</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-background/60 border border-border text-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary/30 hover:shadow-primary/50"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-border/30 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have access?{" "}
                <Link href="/buy-premium" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                  Buy Premium
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center mt-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Back to Home</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
