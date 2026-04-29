import Link from "next/link";
import { ArrowRight, Library, Sparkles } from "lucide-react";
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
  label: "Shop Collection",
};

const defaultSecondaryAction: HeroAction = {
  href: "/publishers",
  label: "Browse Publishers",
};

const editorialBooks = [
  "Fresh curriculum titles",
  "Independent publisher picks",
  "Stories for every reading age",
];

export const HomeHero = ({
  eyebrow = "Curated for classrooms, readers, and growing libraries",
  title = "A calmer way to discover the books your shelf has been missing.",
  description = "Topman Bookshop brings together trusted school texts, workbooks, story titles, and publisher collections in one refined storefront built for thoughtful browsing.",
  primaryAction = defaultPrimaryAction,
  secondaryAction = defaultSecondaryAction,
  showIllustration = true,
}: HomeHeroProps) => {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20 lg:pt-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-foreground)_10%,transparent)_0,transparent_52%),linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_52%,transparent)_0%,transparent_100%)]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase shadow-sm backdrop-blur-sm">
              <Sparkles />
              <span>{eyebrow}</span>
            </div>

            <div className="flex max-w-3xl flex-col gap-4">
              <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                {title}
              </h1>
              <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button size="lg" className="rounded-full px-6" asChild>
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>

            {secondaryAction ? (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-6"
                asChild
              >
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <Library className="size-4" />
              </span>
              <span className="max-w-xs leading-6">
                From early learning essentials to senior-level study texts.
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:ml-auto sm:min-w-[20rem]">
              <div className="rounded-2xl border border-border bg-background/85 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  30+
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Publishers
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/85 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  K-12
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Reading Paths
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/85 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Daily
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  Discoveries
                </p>
              </div>
            </div>
          </div>
        </div>

        {showIllustration ? (
          <div className="relative lg:pl-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-background)_85%,var(--color-muted)_15%)_0%,color-mix(in_oklab,var(--color-muted)_66%,transparent)_100%)] p-5 shadow-[0_24px_80px_color-mix(in_oklab,var(--color-foreground)_10%,transparent)] sm:p-6">
              <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
              <div className="absolute -right-20 top-10 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-foreground)_10%,transparent)_0%,transparent_68%)]" />
              <div className="absolute -left-16 bottom-0 size-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-muted-foreground)_12%,transparent)_0%,transparent_70%)]" />

              <div className="relative flex flex-col gap-5">
                <div className="rounded-[1.5rem] border border-border bg-background/90 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                        This week at Topman
                      </p>
                      <p className="mt-3 max-w-xs text-2xl font-semibold tracking-[-0.05em] text-foreground">
                        Build a shelf that feels deliberate, not crowded.
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                      New picks
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.75rem] border border-border bg-background/78 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Curated shelves
                      </p>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                        Editorial
                      </span>
                    </div>

                    <div className="mt-5 flex items-end gap-2">
                      <div className="h-28 w-14 rounded-t-[1rem] border border-border bg-background" />
                      <div className="h-36 w-16 rounded-t-[1rem] border border-border bg-muted" />
                      <div className="h-24 w-12 rounded-t-[1rem] border border-border bg-background" />
                      <div className="h-32 w-14 rounded-t-[1rem] border border-border bg-muted" />
                      <div className="h-20 flex-1 rounded-[1rem] border border-dashed border-border bg-background/70" />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-border bg-background/78 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-sm font-medium text-foreground">
                      Why readers return
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                      {editorialBooks.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-border bg-muted/55 px-3 py-3 text-sm leading-6 text-muted-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
