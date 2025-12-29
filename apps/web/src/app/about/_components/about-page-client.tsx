"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/use-translation";

export function AboutPageClient() {
  const t = useT();

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {t("about.heroTitle1")}
            <br />
            <span className="bg-gradient-to-r from-primary to-[#38BDF8] bg-clip-text text-transparent">
              {t("about.heroTitle2")}
            </span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            {t("about.heroDescription")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                {t("common.startFree")}
              </Button>
            </Link>
            <Link
              href="/home"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              {t("common.viewNewsletters")}
            </Link>
          </div>
        </div>
      </section>

      {/* Value Cards */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              {t("about.valueTitle")}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <ValueCard
              icon={<HeartIcon />}
              title={t("about.valueCard1Title")}
              description={t("about.valueCard1Desc")}
            />
            <ValueCard
              icon={<ZapIcon />}
              title={t("about.valueCard2Title")}
              description={t("about.valueCard2Desc")}
            />
            <ValueCard
              icon={<InfinityIcon />}
              title={t("about.valueCard3Title")}
              description={t("about.valueCard3Desc")}
            />
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              {t("about.featuresTitle")}
            </h2>
          </div>
          <div className="space-y-16">
            <FeatureDetail
              icon={<EditorIcon />}
              title={t("about.feature1Title")}
              description={t("about.feature1Desc")}
            />
            <FeatureDetail
              icon={<SearchIcon />}
              title={t("about.feature2Title")}
              description={t("about.feature2Desc")}
            />
            <FeatureDetail
              icon={<ChartIcon />}
              title={t("about.feature3Title")}
              description={t("about.feature3Desc")}
            />
            <FeatureDetail
              icon={<UsersIcon />}
              title={t("about.feature4Title")}
              description={t("about.feature4Desc")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {t("about.ctaTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("about.ctaDesc1")}
          </p>
          <p className="mt-4 text-lg text-foreground font-medium">
            {t("about.ctaDesc2")}
          </p>
          <p className="mt-2 text-lg text-foreground font-medium">
            {t("about.ctaDesc3")}
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                {t("common.startFree")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactElement;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-8 transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureDetail({
  icon,
  title,
  description,
}: {
  icon?: React.ReactElement;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6">
      {icon && (
        <div className="flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-2xl font-semibold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function InfinityIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.178 8.088c.5.5.822 1.2.822 1.912s-.322 1.412-.822 1.912c-.5.5-1.2.822-1.912.822s-1.412-.322-1.912-.822L12 12l-1.354 1.912c-.5.5-1.2.822-1.912.822s-1.412-.322-1.912-.822c-.5-.5-.822-1.2-.822-1.912s.322-1.412.822-1.912c.5-.5 1.2-.822 1.912-.822s1.412.322 1.912.822L12 12l1.354-1.912c.5-.5 1.2-.822 1.912-.822s1.412.322 1.912.822z" />
    </svg>
  );
}

function EditorIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

