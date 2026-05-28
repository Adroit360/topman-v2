"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type HeroAction = {
  href: string;
  label: string;
};

export type HomeHeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction | null;
  showIllustration?: boolean;
};

const defaultPrimaryAction: HeroAction = {
  href: "/shop",
  label: "Shop Books",
};

const defaultSecondaryAction: HeroAction = {
  href: "/shop",
  label: "Explore Categories",
};

const heroSlides = ["/images/topman-basic-school-reading-hero.png", "/images/topman-hero-library-orange.png", "/images/topman-hero-book-fair-orange.png"] as const;

export const HomeHero = ({
  title = "Discover Your Next Favorite Book",
  description = "Explore bestsellers, timeless classics, primary and JHS books, novels, and inspiring reads for every growing shelf.",
  primaryAction = defaultPrimaryAction,
  secondaryAction = defaultSecondaryAction,
  showIllustration = true,
}: HomeHeroProps) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative ">
      <div className="relative isolate min-h-[680px] overflow-hidden bg-slate-950 sm:min-h-[520px] lg:h-[56svh] lg:min-h-[580px] lg:max-h-[560px]">
        {showIllustration
          ? heroSlides.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 bg-cover bg-[center_top] transition duration-1000 ease-out lg:bg-center ${activeSlide === index ? "scale-100 opacity-100" : "scale-[1.035] opacity-0"}`}
                style={{
                  backgroundImage: `url('${image}')`,
                }}
              />
            ))
          : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,12,29,0.94)_0%,rgba(7,12,29,0.78)_31%,rgba(7,12,29,0.38)_60%,rgba(7,12,29,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,29,0.16)_0%,rgba(7,12,29,0.02)_48%,rgba(7,12,29,0.34)_100%)]" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-24 pt-40 sm:px-0 sm:pb-28 sm:pt-44 lg:px-0 lg:pb-32 lg:pt-40">
          <div className="max-w-3xl">
            <h1 className="max-w-2xl text-balance text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">{title}</h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/86 sm:text-lg">{description}</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-full border-0 bg-orange-500 px-7 text-base text-white shadow-[0_18px_38px_rgba(234,88,12,0.38)] transition duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_20px_46px_rgba(234,88,12,0.42)]"
                asChild
              >
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight data-icon="inline-end" className="transition-transform duration-300 group-hover/button:translate-x-1" />
                </Link>
              </Button>

              {secondaryAction ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/35 bg-white/12 px-7 text-base text-white shadow-[0_14px_32px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950"
                  asChild
                >
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                    <BookOpenCheck data-icon="inline-end" />
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-8 flex items-center gap-2" aria-hidden="true">
              {heroSlides.map((image, index) => (
                <span key={image} className={`h-1.5 rounded-full transition-all duration-500 ${activeSlide === index ? "w-11 bg-orange-500" : "w-8 bg-white/34"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
