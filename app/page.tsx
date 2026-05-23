import Link from "next/link";
import { BrandLink } from "@/app/_components/brand-link";
import { getAllPostsByYear } from "@/lib/posts";

export default function Home() {
  const yearGroups = getAllPostsByYear();

  return (
    <div className="animate-fade-in">
      <section className="pt-2 pb-14 sm:pb-20">
        <div className="space-y-4">
          <p className="text-stone-500">
            Drawn to the spaces where hardware, software, and good product
            taste collide.
          </p>
          <p className="text-stone-500">
            Currently a technical product manager at{" "}
            <BrandLink
              href="https://www.telus.com"
              name="TELUS"
              logo="/telus-logo.png"
            />{" "}
            on the Internet Hardware team, and co-founder of{" "}
            <BrandLink
              href="https://unifysocial.ca"
              name="Unify"
              logo="/app-icon.png"
            />{" "}
            — a mobile app helping newcomers settle in Canada. Writing on
            consumer hardware, AI tools, and what it takes to build things
            people actually want.
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
