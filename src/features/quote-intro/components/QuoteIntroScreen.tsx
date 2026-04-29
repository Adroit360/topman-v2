"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Quote } from "../types/quote";

type QuoteIntroScreenProps = {
  quote: Quote;
};

export const QuoteIntroScreen = ({ quote }: QuoteIntroScreenProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-background/94 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,_var(--color-foreground)_10%,_transparent)_0,_transparent_52%),linear-gradient(135deg,_color-mix(in_oklab,_var(--color-background)_82%,_var(--color-foreground)_4%)_0%,_var(--color-background)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
        <motion.div
          className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -24 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.blockquote
            className="max-w-3xl text-balance text-3xl font-medium leading-tight tracking-[-0.04em] text-foreground sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -16 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.14,
            }}
          >
            “{quote.text}”
          </motion.blockquote>

          <motion.p
            className="text-sm tracking-[0.28em] text-muted-foreground uppercase sm:text-base"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.7,
              delay: shouldReduceMotion ? 0 : 0.24,
            }}
          >
            {quote.author}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};
