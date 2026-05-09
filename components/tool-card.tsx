"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface ToolCardValue {
  enabled: boolean;
  plan: string;
  seats: number;
  monthlySpend: number;
}

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    logoSrc: string;
    plans: Array<{ label: string; pricePerSeat: number }>;
  };
  value: ToolCardValue;
  onChange: (value: ToolCardValue) => void;
}

export default function ToolCard({ tool, value, onChange }: ToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(value.enabled);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsExpanded(value.enabled);
  }, [value.enabled]);

  const toggleEnabled = () => {
    const newValue = !value.enabled;
    onChange({ ...value, enabled: newValue });
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlanLabel = e.target.value;
    const selectedPlan = tool.plans.find((p) => p.label === newPlanLabel);
    const newMonthlySpend = selectedPlan ? selectedPlan.pricePerSeat * value.seats : value.monthlySpend;
    
    onChange({
      ...value,
      plan: newPlanLabel,
      monthlySpend: newMonthlySpend,
    });
  };

  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeats = Math.max(1, parseInt(e.target.value) || 1);
    const selectedPlan = tool.plans.find((p) => p.label === value.plan);
    const newMonthlySpend = selectedPlan ? selectedPlan.pricePerSeat * newSeats : value.monthlySpend;

    onChange({
      ...value,
      seats: newSeats,
      monthlySpend: newMonthlySpend,
    });
  };

  const handleSpendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      monthlySpend: parseFloat(e.target.value) || 0,
    });
  };

  const selectedPlan = tool.plans.find((p) => p.label === value.plan);
  const expectedSpend = selectedPlan ? selectedPlan.pricePerSeat * value.seats : 0;
  const showWarning = value.enabled && expectedSpend > 0 && Math.abs(value.monthlySpend - expectedSpend) / expectedSpend > 0.1;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-150 bg-bg-surface",
        value.enabled ? "border-border-strong bg-bg-elevated/30" : "border-border-subtle"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center space-x-3">
          <div className="relative h-6 w-6 overflow-hidden">
            <Image
              src={tool.logoSrc}
              alt={tool.name}
              fill
              className="object-contain"
            />
          </div>
          <span className="font-sans text-[15px] font-medium text-text-primary">
            {tool.name}
          </span>
        </div>

        {/* Custom Toggle */}
        <button
          onClick={toggleEnabled}
          className={cn(
            "relative h-[22px] w-[40px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base",
            value.enabled ? "bg-accent" : "bg-bg-overlay"
          )}
        >
          <div
            className={cn(
              "absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
              value.enabled ? "left-[20px]" : "left-[2px]"
            )}
          />
        </button>
      </div>

      {/* Expanded fields */}
      <div
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? `${contentRef.current?.scrollHeight}px` : "0px",
        }}
        className="overflow-hidden transition-all duration-250 ease-in-out"
      >
        <div className="px-5 pb-5">
          <div className="h-[1px] w-full bg-border-subtle mb-4" />
          
          <div className="space-y-4">
            {/* Plan selector */}
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Plan
              </label>
              <select
                value={value.plan}
                onChange={handlePlanChange}
                className="w-1/2 rounded-md border border-border-default bg-bg-elevated px-3 py-2 font-mono text-[13px] text-text-primary focus:border-accent focus:outline-none"
              >
                {tool.plans.map((plan) => (
                  <option key={plan.label} value={plan.label}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Seats input */}
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Seats
              </label>
              <div className="flex w-1/2 items-center space-x-2">
                <input
                  type="number"
                  value={value.seats}
                  onChange={handleSeatsChange}
                  className="w-full rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-right font-mono text-[13px] text-text-primary focus:border-accent focus:outline-none"
                />
                <span className="font-sans text-[13px] text-text-muted whitespace-nowrap">
                  users
                </span>
              </div>
            </div>

            {/* Monthly spend input */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  Monthly Spend
                </label>
                <div className="flex w-1/2 overflow-hidden rounded-md border border-border-default bg-bg-elevated focus-within:border-accent">
                  <div className="flex items-center bg-bg-overlay px-3 border-r border-border-default">
                    <span className="font-sans text-[13px] text-text-muted">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={value.monthlySpend}
                    onChange={handleSpendChange}
                    className="w-full bg-transparent px-3 py-2 font-mono text-[13px] text-text-primary focus:outline-none"
                  />
                </div>
              </div>
              
              {showWarning && (
                <div className="flex items-center justify-end space-x-1 text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="font-mono text-[11px]">differs from plan pricing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
