"use client";

import { useEffect, useSyncExternalStore } from "react";

const HOME_PUBLISHER_SHUFFLE_SEED_KEY = "topman.home.publisher-shuffle-seed";
const HOME_PUBLISHER_SHUFFLE_EVENT = "topman:home-publisher-shuffle-seed";

const canUseSessionStorage = () => typeof window !== "undefined";

const createSessionSeed = () => {
  if (!canUseSessionStorage()) {
    return null;
  }

  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const subscribeToSessionSeed = (onStoreChange: () => void) => {
  if (!canUseSessionStorage()) {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (!event.key || event.key === HOME_PUBLISHER_SHUFFLE_SEED_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(HOME_PUBLISHER_SHUFFLE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(HOME_PUBLISHER_SHUFFLE_EVENT, onStoreChange);
  };
};

const getSessionSeedSnapshot = () => {
  if (!canUseSessionStorage()) {
    return null;
  }

  return window.sessionStorage.getItem(HOME_PUBLISHER_SHUFFLE_SEED_KEY);
};

const getServerSeedSnapshot = () => null;

export const useSessionShuffleSeed = () => {
  const seed = useSyncExternalStore(
    subscribeToSessionSeed,
    getSessionSeedSnapshot,
    getServerSeedSnapshot,
  );

  useEffect(() => {
    if (seed || !canUseSessionStorage()) {
      return;
    }

    const nextSeed = createSessionSeed();

    if (!nextSeed) {
      return;
    }

    window.sessionStorage.setItem(HOME_PUBLISHER_SHUFFLE_SEED_KEY, nextSeed);
    window.dispatchEvent(new Event(HOME_PUBLISHER_SHUFFLE_EVENT));
  }, [seed]);

  return seed;
};
