import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Link } from "wouter";

const PLANS = [
  { id: "15d", label: "15 Days", price: "₹10", days: 15, popular: false, desc: "Perfect for trying out premium" },
  { id: "1m", label: "1 Month", price: "₹19", days: 30, popular: true, desc: "Best value for regular watchers" },
];

const BENEFITS = [
  "Unlimited access to all anime",
  "HD streaming quality",
  "No ads",
  "Exclusive premium episodes",
  "Continue watching across sessions",
  "Priority support",
];

export default function BuyPremiumPage() {
  const handleTelegram = () => {
    window.open("https://t.me/A_Gatherers_isekai_In_Hindi", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Premium Access
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            Unlock <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Premium</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Get unlimited access to the complete anime library. Stream anywhere, anytime.</p>
        </motion.div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 transition-all ${plan.popular ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{plan.label}</h3>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
              </div>
              <button
                onClick={handleTelegram}
                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30" : "border border-border text-foreground hover:border-primary/50 hover:bg-primary/5"}`}
              >
                Get {plan.label} Access
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-4 text-center">Payment via UPI / QR Code</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-xl border-2 border-primary/40 shadow-lg shadow-primary/20 bg-white flex items-center justify-center overflow-hidden p-3">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-primary/30">
                  {/* Stylized QR placeholder */}
                  <div className="grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-sm ${Math.random() > 0.4 ? "bg-primary" : "bg-transparent"}`} />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-primary text-center">SCAN TO PAY</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-3">How to Pay:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Scan the QR code with any UPI app</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Pay the amount for your chosen plan</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Take a screenshot of the payment</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Contact us on Telegram with the screenshot</li>
                <li className="flex gap-2"><span className="text-primary font-bold">5.</span> Receive your premium credentials within minutes</li>
              </ol>
            </div>
          </div>

          {/* Telegram button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleTelegram}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/20 hover:border-[#229ED9]/60 transition-all font-bold text-sm shadow-lg shadow-[#229ED9]/10 hover:shadow-[#229ED9]/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.024 9.54c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.887.681z" />
              </svg>
              Contact on Telegram for Premium
            </button>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">Premium Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-semibold">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
