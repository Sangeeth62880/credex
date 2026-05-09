"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ToolCardValue } from "@/components/tool-card";

interface FormState {
  tools: Record<string, ToolCardValue>;
  teamSize: string;
  useCase: string;
}

interface FormContextType {
  state: FormState;
  updateTool: (toolId: string, value: ToolCardValue) => void;
  updateTeamSize: (teamSize: string) => void;
  updateUseCase: (useCase: string) => void;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
}

const STORAGE_KEY = "credex-audit-form-v1";

const INITIAL_STATE: FormState = {
  tools: {},
  teamSize: "",
  useCase: "",
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved form state", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const updateTool = useCallback((toolId: string, value: ToolCardValue) => {
    setState((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: value,
      },
    }));
  }, []);

  const updateTeamSize = useCallback((teamSize: string) => {
    setState((prev) => ({ ...prev, teamSize }));
  }, []);

  const updateUseCase = useCallback((useCase: string) => {
    setState((prev) => ({ ...prev, useCase }));
  }, []);

  const isStep1Valid = Object.values(state.tools).some((t) => t.enabled);
  const isStep2Valid = state.teamSize !== "" && state.useCase !== "";

  return (
    <FormContext.Provider
      value={{
        state,
        updateTool,
        updateTeamSize,
        updateUseCase,
        isStep1Valid,
        isStep2Valid,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
