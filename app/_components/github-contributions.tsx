import type { CSSProperties } from "react";
import { GraphReveal } from "./graph-reveal";

const GITHUB_USERNAME = "Savar-G";
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const GITHUB_CONTRIBUTIONS_URL = `https://github.com/users/${GITHUB_USERNAME}/contributions`;

type ContributionDay = {
  date: string;
  level: number;
  label: string;
};

type ContributionData = {
  days: ContributionDay[];
  total: number;
};

function parseContributionData(html: string): ContributionData | null {
  const totalMatch = html.match(
    /([\d,]+)\s*\n?\s*contributions\s*\n?\s*in the last year/i,
  );
  const total = totalMatch
    ? Number.parseInt(totalMatch[1].replaceAll(",", ""), 10)
    : Number.NaN;

  const cells = html.match(/<td\b[^>]*data-date="[^"]+"[^>]*><\/td>/g) ?? [];
  const days = cells.flatMap((cell) => {
    const date = cell.match(/data-date="([^"]+)"/)?.[1];
    const level = Number.parseInt(
      cell.match(/data-level="([0-4])"/)?.[1] ?? "",
      10,
    );
    const id = cell.match(/id="([^"]+)"/)?.[1];

    if (!date || Number.isNaN(level)) return [];

    const tooltip = id
      ? html.match(
          new RegExp(
            `<tool-tip[^>]*for="${id}"[^>]*>([^<]+)<\\/tool-tip>`,
          ),
        )?.[1]
      : undefined;

    return [{ date, level, label: tooltip ?? date }];
  });

  if (Number.isNaN(total) || days.length < 350) return null;

  return {
    total,
    days: days.sort((a, b) => a.date.localeCompare(b.date)),
  };
}

async function getContributionData(): Promise<ContributionData | null> {
  try {
    const response = await fetch(GITHUB_CONTRIBUTIONS_URL, {
      headers: {
        Accept: "text/html",
        "User-Agent": "savargupta.com contribution chart",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return null;

    return parseContributionData(await response.text());
  } catch {
    return null;
  }
}

const emptyDays: ContributionDay[] = Array.from({ length: 371 }, (_, index) => ({
  date: `placeholder-${index}`,
  level: 0,
  label: "Contribution data unavailable",
}));

export async function GitHubContributions() {
  const data = await getContributionData();
  const days = data?.days ?? emptyDays;

  return (
    <section className="mb-10 sm:mb-12" aria-labelledby="contributions-title">
      <h3 id="contributions-title" className="section-label pb-3 sm:pb-4">
        Contributions
      </h3>

      <a
        href={GITHUB_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="contribution-card group"
        aria-label={
          data
            ? `${data.total.toLocaleString("en-US")} GitHub contributions in the last year. Open Savar Gupta's GitHub profile.`
            : "Open Savar Gupta's GitHub contribution activity."
        }
      >
        <div className="contribution-card-inner">
          <GraphReveal>
            <div className="contribution-grid-viewport" aria-hidden="true">
              <div className="contribution-grid">
                {days.map((day, i) => (
                  <span
                    key={day.date}
                    className="contribution-day"
                    data-level={day.level}
                    title={day.label}
                    // Fill-in delay: one week (column) after another, top to bottom within it.
                    style={{ "--d": `${Math.floor(i / 7) * 14 + (i % 7) * 4}ms` } as CSSProperties}
                  />
                ))}
              </div>
            </div>
          </GraphReveal>

          <div className="contribution-summary">
            <span>
              {data
                ? `${data.total.toLocaleString("en-US")} contributions in the last year`
                : "View contribution activity on GitHub"}
            </span>

            <span className="contribution-legend" aria-hidden="true">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className="contribution-day"
                  data-level={level}
                />
              ))}
              <span>More</span>
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}
