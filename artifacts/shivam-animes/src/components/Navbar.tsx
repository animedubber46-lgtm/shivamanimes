import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Navbar() {
  const { user, setToken } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync({});
    setToken(null);
    queryClient.clear();
    navigate("/login");
    toast({ title: "Logged out successfully" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/50 group-hover:ring-primary transition-all">
            <img src="https://4kwallpapers.com/images/walls/thumbs_2t/22996.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
            SHIVAM ANIMES
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/browse">Browse</NavLink>
              <NavLink href="/watchlist">Watchlist</NavLink>
              <NavLink href="/continue-watching">Continue</NavLink>
              {user.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
            </>
          ) : (
            <>
              <NavLink href="/">Home</NavLink>
              <NavLink href="/buy-premium">Premium</NavLink>
              <NavLink href="/solve-link">Solve Link</NavLink>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-foreground">{user.username}</p>
                {user.isPremium && (
                  <p className="text-xs font-bold text-yellow-400">PREMIUM</p>
                )}
                {user.role === "admin" && (
                  <p className="text-xs font-bold text-primary">ADMIN</p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-md border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/buy-premium"
                className="text-xs px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all font-semibold"
              >
                Buy Premium
              </Link>
              <Link
                href="/login"
                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold"
              >
                Login
              </Link>
            </div>
          )}
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/browse" onClick={() => setMobileOpen(false)}>Browse</MobileNavLink>
              <MobileNavLink href="/watchlist" onClick={() => setMobileOpen(false)}>Watchlist</MobileNavLink>
              <MobileNavLink href="/continue-watching" onClick={() => setMobileOpen(false)}>Continue Watching</MobileNavLink>
              {user.role === "admin" && <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileNavLink>}
            </>
          ) : (
            <>
              <MobileNavLink href="/buy-premium" onClick={() => setMobileOpen(false)}>Buy Premium</MobileNavLink>
              <MobileNavLink href="/solve-link" onClick={() => setMobileOpen(false)}>Solve Link</MobileNavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="text-sm font-medium text-muted-foreground hover:text-primary py-2 border-b border-border/20 last:border-0 transition-colors">
      {children}
    </Link>
  );
}
