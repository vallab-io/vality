import Link from "next/link";

interface Newsletter {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
}

interface NewsletterListProps {
  newsletters: Newsletter[];
  username: string;
}

export function NewsletterList({ newsletters, username }: NewsletterListProps) {
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
            {formatDate(newsletter.publishedAt)}
          </time>
          <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary line-clamp-2">
            {newsletter.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {newsletter.excerpt}
          </p>
          <span className="mt-4 text-xs font-medium text-primary">
            읽기 →
          </span>
        </Link>
      ))}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
