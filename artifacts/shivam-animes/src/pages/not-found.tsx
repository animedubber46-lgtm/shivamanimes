import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <span className="text-3xl text-primary/60">404</span>
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">Page Not Found</h1>
      <p className="text-muted-foreground text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Link href="/" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all">
        Go Home
      </Link>
    </div>
  );
}
