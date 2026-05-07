import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-block px-4 py-1.5 mb-4 text-sm font-medium tracking-tight text-purple-400 border border-purple-400/30 rounded-full bg-purple-400/10">
          Save up to 40% on AI tool costs
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
          Find out if your AI tools are <br />
          <span className="gradient-text">costing you too much</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Free audit in 2 minutes. No signup required. Real savings, not estimates.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/audit" 
            className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all transform hover:scale-105 active:scale-95"
          >
            Run my free audit
          </Link>
          <p className="text-sm text-zinc-500">
            Trusted by 50+ startups
          </p>
        </div>

        <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center justify-center font-bold text-2xl italic">Cursor</div>
          <div className="flex items-center justify-center font-bold text-2xl italic">Claude</div>
          <div className="flex items-center justify-center font-bold text-2xl italic">ChatGPT</div>
          <div className="flex items-center justify-center font-bold text-2xl italic">Copilot</div>
        </div>
      </div>
    </main>
  );
}
