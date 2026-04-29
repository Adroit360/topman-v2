"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { currenctFormat } from "@/utils/currency-format";

type LatestPaidOrderResponse = {
  success: boolean;
  data: null | {
    paymentId: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    total: number;
    paidAt: string;
  };
};

const POLL_INTERVAL_MS = 15000;

const playPaymentAlertSound = async () => {
  const AudioContextConstructor =
    window.AudioContext ||
    (
      window as Window & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  const context = new AudioContextConstructor();

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0.001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.12,
      context.currentTime + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.45,
    );

    const firstTone = context.createOscillator();
    firstTone.type = "sine";
    firstTone.frequency.setValueAtTime(880, context.currentTime);
    firstTone.connect(gainNode);
    firstTone.start(context.currentTime);
    firstTone.stop(context.currentTime + 0.16);

    const secondTone = context.createOscillator();
    secondTone.type = "sine";
    secondTone.frequency.setValueAtTime(1174.66, context.currentTime + 0.18);
    secondTone.connect(gainNode);
    secondTone.start(context.currentTime + 0.18);
    secondTone.stop(context.currentTime + 0.38);
  } finally {
    window.setTimeout(() => {
      void context.close();
    }, 500);
  }
};

export const DashboardPaymentAlert = () => {
  const latestPaymentIdRef = useRef<string | null>(null);
  const hasPrimedRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    const pollLatestPayment = async () => {
      try {
        const response = await fetch("/api/orders/latest-paid", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as LatestPaidOrderResponse;

        if (!isActive || !payload.success || !payload.data) {
          return;
        }

        if (!hasPrimedRef.current) {
          latestPaymentIdRef.current = payload.data.paymentId;
          hasPrimedRef.current = true;
          return;
        }

        if (latestPaymentIdRef.current === payload.data.paymentId) {
          return;
        }

        latestPaymentIdRef.current = payload.data.paymentId;

        toast.success(`Payment confirmed for ${payload.data.orderNumber}`, {
          description: `${payload.data.customerName} paid ${currenctFormat(payload.data.total)}.`,
          duration: 10000,
        });

        void playPaymentAlertSound();
      } catch {
        return;
      }
    };

    void pollLatestPayment();

    const intervalId = window.setInterval(() => {
      void pollLatestPayment();
    }, POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
};
