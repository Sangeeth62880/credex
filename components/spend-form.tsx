"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runAudit, type AuditInput } from "@/lib/audit-engine";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toolSchema = z.object({
  name: z.string(),
  active: z.boolean(),
  plan: z.string(),
  monthlySpend: z.number().min(0),
  seats: z.number().min(1),
});

const formSchema = z.object({
  teamSize: z.number().min(1),
  primaryUseCase: z.string().min(1),
  tools: z.array(toolSchema),
});

type FormValues = z.infer<typeof formSchema>;

const TOOLS = [
  "Cursor", "GitHub Copilot", "Claude", "ChatGPT", 
  "Anthropic API", "OpenAI API", "Gemini", "Windsurf"
];

export default function SpendForm() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamSize: 10,
      primaryUseCase: "coding",
      tools: TOOLS.map(tool => ({
        name: tool,
        active: false,
        plan: "Pro",
        monthlySpend: 0,
        seats: 1,
      })),
    },
  });

  const { fields } = useFieldArray({
    name: "tools",
    control: form.control,
  });

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("credex-audit-form");
    if (saved) {
      try {
        form.reset(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, [form]);

  // Save to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem("credex-audit-form", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const auditInput: AuditInput = {
        teamSize: data.teamSize,
        primaryUseCase: data.primaryUseCase,
        tools: data.tools,
      };
      const result = runAudit(auditInput);

      // Store audit result in localStorage for the results page
      localStorage.setItem(
        "credex-audit-result",
        JSON.stringify({ input: auditInput, result })
      );

      router.push(`/audit/results?id=${result.auditId}`);
    } catch (error) {
      console.error("Audit failed", error);
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto py-10">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Size</label>
            <Input 
              type="number" 
              {...form.register("teamSize", { valueAsNumber: true })} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Use Case</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("primaryUseCase")}
            >
              <option value="coding">Coding / Engineering</option>
              <option value="writing">Content / Writing</option>
              <option value="data">Data Analysis</option>
              <option value="mixed">General / Mixed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, index) => (
          <Card key={field.id} className={cn(
            "transition-all duration-300",
            form.watch(`tools.${index}.active`) ? "border-purple-500/50 bg-purple-500/5" : "opacity-60"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">{field.name}</CardTitle>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-purple-500"
                {...form.register(`tools.${index}.active`)} 
              />
            </CardHeader>
            <CardContent className={cn(
              "space-y-4",
              !form.watch(`tools.${index}.active`) && "pointer-events-none"
            )}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase">Plan</label>
                  <Input {...form.register(`tools.${index}.plan`)} placeholder="e.g. Pro, Team" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase">Seats</label>
                  <Input 
                    type="number" 
                    {...form.register(`tools.${index}.seats`, { valueAsNumber: true })} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase">Monthly Spend ($)</label>
                <Input 
                  type="number" 
                  {...form.register(`tools.${index}.monthlySpend`, { valueAsNumber: true })} 
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-10">
        <Button 
          size="lg" 
          className="px-12 py-6 text-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Run Spend Audit"
          )}
        </Button>
      </div>
    </form>
  );
}
