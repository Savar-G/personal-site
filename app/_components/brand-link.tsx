type BrandLinkProps = {
  href: string;
  name: string;
  /** Optional path (relative to /public) for a small inline logo, e.g. "/cursor-app-icon.png" */
  logo?: string;
};

/**
 * Inline brand badge: bold name + optional logo + ↗ arrow.
 * Use inside prose paragraphs, e.g.
 *   I work at <BrandLink href="https://cursor.com" name="Cursor" logo="/cursor.png" />.
 */
export function BrandLink({ href, name, logo }: BrandLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="brand-inline-link group inline-flex items-center gap-1 align-baseline"
    >
      <strong className="font-semibold text-stone-900">{name}</strong>
      {logo ? (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 shrink-0 -translate-y-px rounded-[3px] bg-cover bg-center"
          style={{ backgroundImage: `url(${logo})` }}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="icon-shift text-[12px] leading-none text-stone-300 group-hover:translate-x-0.5 group-hover:text-stone-500"
      >
        ↗
      </span>
    </a>
  );
}
