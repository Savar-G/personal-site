import Link from "next/link";
import { getAllPostsByYear } from "@/lib/posts";

export default function Home() {
  const yearGroups = getAllPostsByYear();

  return (
    <div className="animate-fade-in">
      <section className="pt-2 pb-14 sm:pb-20">
        <div className="space-y-4">
          <p className="text-stone-500">
            {/* TODO: One sentence about what you like — replace this line. */}
            One sentence about things I like will go here.
          </p>
          <p className="text-stone-500">
            {/* TODO: A sentence or two about where you work and what you'd like to do. */}
            A sentence or two about where I work and what I&apos;m building
            toward will go here.
          </p>
        </div>
      </section>

      {yearGroups.length > 0 && (
        <section>
          <div className="stagger-children">
            {yearGroups.map(({ year, posts }) => (
              <section key={year} className="mb-2">
                <h3 className="section-label pt-8 pb-3 sm:pt-10 sm:pb-4">
                  {year}
                </h3>
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
        </section>
      )}
    </div>
  );
}
