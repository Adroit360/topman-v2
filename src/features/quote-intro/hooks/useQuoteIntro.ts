"use client";

import { useEffect, useState } from "react";
import type { Quote } from "../types/quote";

const STORAGE_KEY = "topman.quote-intro.seen";

type UseQuoteIntroOptions = {
  quotes: Quote[];
  autoDismissMs?: number;
};

type UseQuoteIntroResult = {
  activeQuote: Quote | null;
  isReady: boolean;
  showIntro: boolean;
  completeExit: () => void;
};

type QuoteIntroState = {
  activeQuote: Quote | null;
  isReady: boolean;
  showIntro: boolean;
};

const pickRandomQuote = (quotes: Quote[]) => {
  if (quotes.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);

  return quotes[randomIndex] ?? null;
};

export const useQuoteIntro = ({
  quotes,
  autoDismissMs = 3000,
}: UseQuoteIntroOptions): UseQuoteIntroResult => {
  const [state, setState] = useState<QuoteIntroState>({
    activeQuote: null,
    isReady: false,
    showIntro: false,
  });

  useEffect(() => {
    let cancelled = false;
    const availableQuotes = quotes.filter(
      (quote) => quote.text && quote.author,
    );

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (availableQuotes.length === 0) {
        setState({
          activeQuote: null,
          isReady: true,
          showIntro: false,
        });
        return;
      }

      const hasSeenIntro = window.localStorage.getItem(STORAGE_KEY) === "false";

      if (hasSeenIntro) {
        setState({
          activeQuote: null,
          isReady: true,
          showIntro: false,
        });
        return;
      }

      setState({
        activeQuote: pickRandomQuote(availableQuotes),
        isReady: true,
        showIntro: true,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [quotes]);

  useEffect(() => {
    if (!state.showIntro) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, "true");
      setState((currentState) => ({
        ...currentState,
        showIntro: false,
      }));
    }, autoDismissMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoDismissMs, state.showIntro]);

  const completeExit = () => {
    setState((currentState) => ({
      ...currentState,
      activeQuote: null,
    }));
  };

  return {
    activeQuote: state.activeQuote,
    isReady: state.isReady,
    showIntro: state.showIntro,
    completeExit,
  };
};
