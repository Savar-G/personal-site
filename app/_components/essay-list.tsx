import Link from "next/link";
import { getAllPostsByYear } from "@/lib/posts";

export function EssayList() {
  const yearGroups = getAllPostsByYear();
  if (yearGroups.length === 0) return null;

  return (
    <div className="stagger-children">
      {yearGroups.map(({ year, posts }) => (
        <section key={year} className="mb-2">
          <h3 className="section-label pb-3 sm:pb-4">{year}</h3>
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/${post.slug}`}
                  className="essay-link group block py-3 sm:py-2.5"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="entry-title group-hover:text-stone-600">
                      {post.title}
                    </h2>
                    <span className="entry-meta">
                      {post.readingTime}
                      <span aria-hidden="true"> · </span>
                      <time
                        dateTime={post.date}
                        className="tabular-nums tracking-wide"
                      >
                        {post.formattedDate}
                      </time>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
