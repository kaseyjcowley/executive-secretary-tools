"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageScenario } from "@/types/messages";
import { generateMessage } from "@/utils/message-generator";

interface UseMessagePreviewOptions {
  buildScenario: () => MessageScenario | null;
  resetDependencies: unknown[];
}

interface UseMessagePreviewResult {
  templatePreview: string;
  isLoadingPreview: boolean;
  canGenerate: boolean;
  generatePreview: () => void;
}

export function useMessagePreview({
  buildScenario,
  resetDependencies,
}: UseMessagePreviewOptions): UseMessagePreviewResult {
  const [templatePreview, setTemplatePreview] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const canGenerate = useCallback(() => {
    const scenario = buildScenario();
    return scenario !== null;
  }, [buildScenario]);

  const generatePreview = useCallback(() => {
    const scenario = buildScenario();
    if (!scenario) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoadingPreview(true);

    generateMessage(scenario, controller.signal)
      .then((message) => {
        if (message) {
          setTemplatePreview(message);
        }
        setIsLoadingPreview(false);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error generating message:", error);
          setTemplatePreview("Unable to generate message. Please try again.");
        }
        setIsLoadingPreview(false);
      });
  }, [buildScenario]);

  // Create a stable key for the reset dependencies. stringify may throw on
  // non-serializable values; guard and fallback to a simple length/tokens
  // representation to avoid causing the effect to re-run excessively.
  const depsKey = (() => {
    try {
      return JSON.stringify(resetDependencies);
    } catch (err) {
      try {
        return resetDependencies
          .map((d: unknown) =>
            d && typeof d === "object"
              ? Object.keys(d as any).length
              : String(d),
          )
          .join("|");
      } catch (e) {
        return String(resetDependencies.length);
      }
    }
  })();

  useEffect(() => {
    setTemplatePreview("");
    setIsLoadingPreview(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // depsKey intentionally captures a stable-ish representation of resetDependencies
  }, [depsKey]);

  return {
    templatePreview,
    isLoadingPreview,
    canGenerate: canGenerate(),
    generatePreview,
  };
}
