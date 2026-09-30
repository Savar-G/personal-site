import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Savar Gupta",
  description:
    "Privacy policy for savargupta.com and academic-assistant, a personal tool that writes school deadlines to Google Tasks.",
};

// Linked from the Google OAuth consent screen of academic-assistant. Keep it
// accurate to what the tool does: scope, storage, and how to revoke.
export default function PrivacyPage() {
  return (
    <article className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10 mb-8 sm:mb-10">
        <h1 className="page-title">Privacy</h1>
      </header>

      <div className="prose-site stagger-children">
        <p>Last updated September 30, 2026.</p>

        <h2>This website</h2>
        <p>
          savargupta.com has no accounts, forms, or advertising. The hosting
          provider keeps standard server logs.
        </p>

        <h2>academic-assistant</h2>
        <p>
          academic-assistant is a personal tool that I built for my own
          coursework. It is not offered to other people. It reads my course
          deadlines and adds each assignment I must hand in to my Google
          Tasks list as an all-day task on its due date.
        </p>
        <ul>
          <li>
            <strong>Google data it uses:</strong> the Google Tasks scope only.
            It reads my task lists to find the target list and my open tasks,
            and it creates, updates, and completes tasks in that list.
          </li>
          <li>
            <strong>Where data is kept:</strong> on my own computer. The
            sign-in token is stored in the macOS Keychain. Task IDs, titles,
            and due dates are stored in a local database.
          </li>
          <li>
            <strong>Sharing:</strong> none. The tool does not sell, share, or
            transfer Google user data, and does not use it for advertising or
            to train AI models.
          </li>
          <li>
            <strong>Revoking access:</strong> remove academic-assistant at{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </li>
        </ul>
        <p>
          academic-assistant&apos;s use of information received from Google
          APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:savar.gupta1922@gmail.com">savar.gupta1922@gmail.com</a>
        </p>
      </div>
    </article>
  );
}
