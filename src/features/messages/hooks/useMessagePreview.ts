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

  useEffect(() => {
    setTemplatePreview("");
    setIsLoadingPreview(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(resetDependencies)]);

  return {
    templatePreview,
    isLoadingPreview,
    canGenerate: canGenerate(),
    generatePreview,
  };
}
