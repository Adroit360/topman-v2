import { QuoteIntroGate } from "@/features/quote-intro/components/QuoteIntroGate";
import { getCatalog } from "@/features/catalog/services/getCatalog";
import { HomeHero } from "@/features/home/components/HomeHero";
import { HomePublishersSection } from "../../features/home/components/HomePublishersSection";
import { PublisherSectionSkeleton } from "../../features/home/components/PublisherSectionSkeleton";
import { quotes } from "../../../data/quotes";
import { Suspense } from "react";

export default function Home() {
  const catalogPromise = getCatalog();

  return (
    <QuoteIntroGate quotes={quotes}>
      <HomeHero />
      <Suspense fallback={<PublisherSectionSkeleton />}>
        <HomePublishersSection catalogPromise={catalogPromise} />
      </Suspense>
    </QuoteIntroGate>
  );
}
