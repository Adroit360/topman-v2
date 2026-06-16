"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const appLogoPath = "/images/original-logo-cropped.png";

type BookCoverImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  containerClassName?: string;
  imageClassName?: string;
};

export const BookCoverImage = ({ src, alt, sizes, priority = false, containerClassName, imageClassName }: BookCoverImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const showFallback = !src || hasError;
  const showLoadingState = Boolean(src) && !hasError && !isLoaded;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#fff7ed_0%,#ffedd5_100%)]", containerClassName)}>
      {!showFallback ? (
        <Image
          loader={({ src: imageSource }) => imageSource}
          unoptimized
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover transition duration-500", imageClassName)}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : null}

      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center transition-opacity duration-300",
          showFallback || showLoadingState ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className={cn("relative w-full max-w-[8.5rem]", showLoadingState ? "animate-pulse" : "")}>
          <Image src={appLogoPath} alt="Topman Books logo" width={320} height={140} className="h-auto w-full object-contain" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
          {showLoadingState ? "Loading cover" : "Topman Books"}
        </p>
      </div>
    </div>
  );
};
