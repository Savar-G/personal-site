import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: `${post.title} — ${post.formattedDate}`,
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10 mb-8 sm:mb-10">
        <time dateTime={post.date} className="entry-date mb-3 block">
          {post.formattedDate}
          <span aria-hidden="true"> · </span>
          {post.readingTime}
        </time>
        <h1 className="page-title">{post.title}</h1>
      </header>

      <div className="prose-site">
        <MDXRemote source={post.content} />
      </div>

      <div className="mt-16 border-t border-stone-200 pt-10">
        <Link
          href="/"
          className="press group inline-flex items-center gap-2 text-base text-stone-500 hover:text-stone-700"
        >
          <span
            aria-hidden="true"
            className="icon-shift inline-block group-hover:-translate-x-0.5"
          >
            ←
          </span>
          <span>Back to essays</span>
        </Link>
      </div>
    </article>
  );
}
