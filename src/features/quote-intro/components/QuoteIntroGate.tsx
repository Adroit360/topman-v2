"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useQuoteIntro } from "../hooks/useQuoteIntro";
import type { Quote } from "../types/quote";
import { QuoteIntroScreen } from "./QuoteIntroScreen";

type QuoteIntroGateProps = {
  quotes: Quote[];
  children: ReactNode;
};

export const QuoteIntroGate = ({ quotes, children }: QuoteIntroGateProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { activeQuote, completeExit, isReady, showIntro } = useQuoteIntro({
    quotes,
  });

  return (
    <div className="relative flex flex-1 flex-col">
      <motion.div
        className="flex flex-1 flex-col"
        initial={false}
        animate={{
          opacity: !isReady ? 0 : showIntro ? 0.88 : 1,
          scale: showIntro && !shouldReduceMotion ? 0.985 : 1,
          filter: showIntro && !shouldReduceMotion ? "blur(2px)" : "blur(0px)",
        }}
        transition={{
          duration: shouldReduceMotion ? 0.15 : 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>

      <AnimatePresence onExitComplete={completeExit}>{showIntro && activeQuote ? <QuoteIntroScreen key={activeQuote.text} quote={activeQuote} /> : null}</AnimatePresence>
    </div>
  );
};
