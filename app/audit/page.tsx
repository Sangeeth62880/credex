import SpendForm from "@/components/spend-form";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <header className="py-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Configure Your <span className="gradient-text">AI Tool Audit</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us about your team and the tools you use. We'll find the savings.
          </p>
        </header>

        <SpendForm />
      </div>
    </div>
  );
}
