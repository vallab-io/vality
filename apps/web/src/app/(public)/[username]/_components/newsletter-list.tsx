import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales/types";
import { formatRelativeTime } from "@/lib/utils/date";

interface Newsletter {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
}

interface NewsletterListProps {
  newsletters: Newsletter[];
  username: string;
  locale: Locale;
}

export function NewsletterList({ newsletters, username, locale }: NewsletterListProps) {
  if (newsletters.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        아직 발행된 뉴스레터가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {newsletters.map((newsletter) => (
        <Link
          key={newsletter.id}
          href={`/@${username}/${newsletter.slug}`}
          className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <time className="text-xs font-medium text-muted-foreground">
            {formatRelativeTime(newsletter.publishedAt, locale)}
          </time>
          <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary line-clamp-2">
            {newsletter.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {newsletter.description}
          </p>
          <span className="mt-4 text-xs font-medium text-primary">
            읽기 →
          </span>
        </Link>
      ))}
    </div>
  );
}

