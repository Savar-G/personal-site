/* Shared book data for the bookshelf-notes mockups.
 * Real content pulled from content/books/*.mdx — no placeholder text.
 * Notes sections support { h, p } (paragraph) and { h, list:[...] }. */

const COVER = (slug, ext = "jpg") => `../../public/books/${slug}.${ext}`;

const BOOKS = [
  {
    slug: "the-creative-act",
    title: "The Creative Act",
    author: "Rick Rubin",
    category: "Creativity",
    status: "read",
    spineColor: "#86796a",
    cover: COVER("the-creative-act"),
    date: "June 18, 2026",
    summary:
      "Rick Rubin on creativity as a way of living — tuning in to what wants to be made and getting out of the work's way.",
    takeaways: [
      "Ideas pass through you — if you don't bring an excited idea to life, it often finds its voice through another maker. The idea's time has come.",
      "Trust the universe over the people around you. Friends, family, and anyone with a business interest in your work will offer seemingly rational advice that overrides your intuitive knowing.",
      "Don't aim for average — amplify the difference. The goal isn't to fit in; it's to develop the voice unique to how you see the world.",
      "Discipline and freedom are partners, not opposites. The tighter your regimen, the more freedom inside the structure to actually express yourself.",
      "Creativity is a way of being, not just doing. The artist is always on call — it's how you move through the world, not only what you make at the desk.",
    ],
    quotes: [
      { text: "Art doesn't get made on the clock, but it can get finished on the clock." },
      { text: "Comparison is the thief of joy.", source: "Theodore Roosevelt (quoted in the book)" },
    ],
    notes: [
      { h: "Ideas pass through you", p: "If you have an idea you're excited about and you don't bring it to life, it's not uncommon for that idea to find its voice through another maker. Not because they stole it — because the idea's time has come. We all start as natural receivers; the work is to get back there." },
      { h: "Discipline and freedom are partners", p: "The more set in your personal regimen, the more freedom you have within the structure to express yourself. Discipline is not a lack of freedom — it's a harmonious relationship with time." },
      { h: "Don't trash the whole for one flaw", p: "It's easy to see one flaw and want to discard the entire work. Often 80% of the work is quite good, and if the other 20% fits in just the right way, it becomes magnificent. The inner critic is usually an outer voice absorbed earlier in life." },
      { h: "The coin toss method", p: "At a true impasse, decide which option is heads and which is tails, then flip the coin. While it's still spinning, notice the quiet preference for one outcome. The test is over before the coin ever lands." },
    ],
  },
  {
    slug: "100-baggers",
    title: "100 Baggers",
    author: "Christopher Mayer",
    category: "Investing",
    status: "read",
    spineColor: "#6f6244",
    cover: COVER("100-baggers"),
    summary:
      "How a handful of stocks return 100-to-1 — and the rare discipline it takes to actually hold them.",
    takeaways: [
      "The engine is a high return on capital, reinvested for many years — earnings growth and a rising multiple compounding together.",
      "SQGLP: small Size, high Quality of business and management, high Growth, Longevity in both, and a favorable Price.",
      "The coffee-can portfolio works because it protects you from yourself — buy great 10-year bets, then stop trading.",
      "Price still matters. Overpay on the multiple and you need absurd earnings growth just to break even.",
      "Moats — brand, switching costs, network effects, low cost, scale — are what let a company keep earning that return.",
    ],
    quotes: [
      { text: "You need a business with a high return on capital with the ability to reinvest and earn that high return on capital for years and years." },
      { text: "Bear market smoke gets in one's eyes — it blinds us to buying opportunities if we are too intent on market timing." },
      { text: "A great deal of investing is on par with the instinct that makes a fish bite on an edible spinner because it is moving." },
    ],
    notes: [
      { h: "The one principle", p: "You need a business with a high return on capital and the ability to reinvest at that same high return for years and years. Growth plus a rising multiple, working together, is what produces the truly mammoth result." },
      { h: "SQGLP", list: ["Size is small", "Quality is high — business and management", "Growth in earnings is high", "Longevity in both quality and growth", "Price is favorable"] },
      { h: "The coffee-can portfolio", p: "Find the best stocks you can and let them sit for ten years. The real benefit is subtler: it keeps your worst instincts from hurting you. You don't put anything in the can you don't believe is a good ten-year bet." },
    ],
  },
  {
    slug: "how-to-win-friends",
    title: "How to Win Friends & Influence People",
    author: "Dale Carnegie",
    category: "Communication",
    status: "read",
    spineColor: "#7e5544",
    cover: COVER("how-to-win-friends"),
    summary:
      "The timeless playbook for working with people: don't criticize, make others feel important, and see everything from their point of view.",
    takeaways: [
      "Don't criticize, condemn, or complain — it only puts people on the defensive and breeds resentment.",
      "Give honest, sincere appreciation; the deepest craving in human nature is to feel important.",
      "Arouse in the other person an eager want — talk only in terms of what they want, and show them how to get it.",
      "You can't win an argument. The only way to get the best of one is to avoid it.",
      "To change someone without resentment: begin with praise, ask questions instead of giving orders, and let them save face.",
    ],
    quotes: [
      { text: "If there is any one secret of success, it lies in the ability to get the other person's point of view and see things from that person's angle as well as from your own.", source: "Henry Ford" },
      { text: "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you." },
      { text: "The deepest principle in human nature is the craving to be appreciated.", source: "William James" },
    ],
    notes: [
      { h: "Handling people", list: ["Don't criticize, condemn, or complain — criticism just wounds pride and arouses resentment.", "Give honest and sincere appreciation, not flattery.", "Arouse in the other person an eager want. “Bait the hook to suit the fish.”"] },
      { h: "Making people like you", list: ["Become genuinely interested in other people.", "Smile.", "A person's name is the sweetest sound in any language.", "Be a good listener; encourage others to talk about themselves.", "Make the other person feel important — sincerely."] },
      { h: "Winning people to your thinking", list: ["You can't win an argument; avoid it.", "Never say “you're wrong.”", "If you're wrong, admit it quickly and emphatically.", "Get the other person saying “yes, yes” early.", "Let them feel the idea is theirs."] },
    ],
  },
  {
    slug: "the-laws-of-human-nature",
    title: "The Laws of Human Nature",
    author: "Robert Greene",
    category: "Psychology",
    status: "read",
    spineColor: "#5f5160",
    cover: COVER("the-laws-of-human-nature"),
    summary: "A field guide to the hidden forces driving people — and how to read, and master, them.",
    takeaways: [
      "Transform self-love into empathy: enter the other person's world and value system instead of staying in your own.",
      "See through people's masks — don't mistake appearances for reality; learn to decode true feeling.",
      "Read nonverbal cues in order: face and micro-expressions first, then the pitch and pace of the voice, then the body.",
      "Character is destiny — people never do something just once. Watch the patterns, not the excuses.",
      "Master presence and absence; withhold a little and stay slightly unpredictable.",
    ],
    quotes: [
      { text: "People never do something just once… they will repeat whatever foolishness they did on another occasion, compelled by their character and habits." },
      { text: "Perhaps the best and most exciting sign of all is synchrony — the other person unconsciously mirroring you." },
    ],
    notes: [
      { h: "Transform self-love into empathy", p: "Attune yourself to the shifting moods of individuals, get a read on what motivates them, and take their perspective — enter their world and value system rather than projecting your own." },
      { h: "See through people's masks", p: "Become a master decoder of true feelings. Notice cues on the face and the micro-expressions first, then the voice — its pitch and pace — then posture, hands, and the legs. When someone is genuinely engaged, the pitch rises, hesitation disappears, and the banter quickens." },
      { h: "The law of compulsive behavior", p: "People never do something just once. They'll excuse it, but character and habit make them repeat it. Judge people by the pattern, not the apology." },
    ],
  },
  {
    slug: "the-millionaire-fastlane",
    title: "The Millionaire Fastlane",
    author: "MJ DeMarco",
    category: "Business",
    status: "read",
    spineColor: "#54606a",
    cover: COVER("the-millionaire-fastlane"),
    summary:
      "Skip the slow-lane 'save for forty years' script and build a business that impacts millions and controls its own growth.",
    takeaways: [
      "True wealth is three things — freedom, family, and health.",
      "The Law of Effection: to make millions, you must impact millions.",
      "Chase needs — people's problems, pain points, and emotions — never money itself.",
      "Mind the entry: when 'everyone' can do it, the opportunity is already gone. Sell shovels.",
      "Be frugal with time, not just money — time is the real scarce asset.",
    ],
    quotes: [
      { text: "To make millions, you must impact millions." },
      { text: "Don't dig for gold, sell shovels." },
    ],
    notes: [
      { h: "What wealth actually is", p: "Being able to do anything you want, whenever you want — freedom, family, and health. Money is the tool, not the destination." },
      { h: "Time", p: "Fastlaners are frugal with time, not pennies. Three layovers to save $100 trades your scarcest asset for your most replaceable one." },
      { h: "Entry and needs", p: "Mind the entry. When everyone is doing something, the edge is gone. Stop chasing money; chase needs — problems, pain points, service gaps, emotions." },
    ],
  },
  {
    slug: "rule-breaker-investing",
    title: "Rule Breaker Investing",
    author: "David Gardner",
    category: "Investing",
    status: "read",
    spineColor: "#6d5a3a",
    cover: COVER("rule-breaker-investing"),
    summary:
      "Six 'Foolish' strategies for spotting the rule-breaking companies that go on to beat the market.",
    takeaways: [
      "Buy the top dog and first mover in an important, emerging industry.",
      "Seek the innovators — R&D as a percentage of revenue is a useful proxy.",
      "Intangibles make a great business: brand, leadership, culture, and innovation.",
      "Add to excellence and sell mediocrity; keep an initial position around 5% max.",
      "Live below your means — every $1 today is about $64 over 42 years at 10%.",
    ],
    quotes: [
      { text: "If you read today's headlines, you'll conclude things have never been worse. But if you read history, you'll conclude things have never been better." },
      { text: "Find excellence, buy excellence, add excellence and sell mediocrity." },
    ],
    notes: [
      { h: "Finding rule-breakers", list: ["Top dog and first mover in an important, emerging industry.", "Seek the innovators — R&D as a percentage of revenue is one proxy.", "Intangibles define a great business: brand, leadership, culture, innovation."] },
      { h: "Managing the portfolio", list: ["Cap an initial position around 5%.", "Add to excellence and sell mediocrity.", "Live below your means — every dollar is roughly $64 over 42 years at 10%."] },
    ],
  },
  {
    slug: "mindset",
    title: "Mindset",
    author: "Carol Dweck",
    category: "Psychology",
    status: "read",
    spineColor: "#5c5d44",
    cover: COVER("mindset", "png"),
    summary:
      "The difference between a fixed and a growth mindset — and why believing ability can grow changes everything.",
    takeaways: [
      "A growth mindset treats ability as something you build; a fixed mindset treats it as fixed and on trial.",
      "Only growth-mindset people attend to information that stretches them — learning becomes the priority.",
      "Failure is painful either way, but in a growth mindset it's a problem to learn from, not a verdict on you.",
    ],
    quotes: [
      { text: "You aren't a failure until you start to blame." },
      { text: "Even in the growth mindset, failure can be a painful experience. But it doesn't define you. It's a problem to be faced, dealt with, and learned from." },
    ],
    notes: [
      { h: "Two mindsets", p: "Picture being quizzed at the front of a language class. In a fixed mindset your ability is on the line and the tension spikes. In a growth mindset you're a novice — that's why you're here. Same moment, opposite experience. You can change your mindset." },
    ],
  },
  {
    slug: "the-psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Finance",
    status: "read",
    spineColor: "#4f635d",
    cover: COVER("the-psychology-of-money"),
    summary: "Doing well with money is less about what you know and more about how you behave.",
    takeaways: [
      "Savings come from desiring less — and you desire less when you care less what others think of you.",
      "Not all success is hard work, and not all poverty is laziness — judge accordingly, including yourself.",
    ],
    quotes: [
      { text: "Savings can be created by spending less. You can spend less if you desire less. And you will desire less if you care less about what others think of you." },
      { text: "Realize that not all success is due to hard work, and not all poverty is due to laziness. Keep this in mind when judging people, including yourself." },
    ],
    notes: [],
  },
  {
    slug: "red-rising",
    title: "Red Rising",
    author: "Pierce Brown",
    category: "Fiction",
    status: "read",
    spineColor: "#7c473c",
    cover: COVER("red-rising"),
    date: "April 29, 2026",
    summary:
      "A Red miner on Mars infiltrates the ruling Gold elite to burn their hierarchy down from the inside.",
    takeaways: [
      "The color caste is a machine — every rank exists to prop up the Golds.",
      "Leadership is direction, not dominance: people follow the one who knows where they're going.",
    ],
    quotes: [
      { text: "Death isn't empty like you say it is. Emptiness is life without freedom, Darrow. Emptiness is living chained by fear, fear of loss, of death." },
      { text: "Society has three stages: Savagery, Ascendance, Decadence. The great rise because of Savagery. They rule in Ascendance. They fall because of their own Decadence." },
      { text: "You do not follow me because I am the strongest. Pax is. You do not follow me because I am the brightest. Mustang is. You follow me because you do not know where you are going. I do." },
    ],
    notes: [
      { h: "The hierarchy", p: "The world runs on Color — every Color built to prop up the Golds at the top. Darrow, a Red, is humankind's lowest caste, mining beneath Mars so future generations might live above it. Lord of the Flies meets the scope of Star Wars." },
    ],
  },
  {
    slug: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Habits",
    status: "read",
    spineColor: "#5f6a57",
    cover: COVER("atomic-habits"),
    summary:
      "Tiny 1% improvements compound; you rise to the level of your systems and your identity, not your goals.",
    takeaways: [
      "Habits are the compound interest of self-improvement — aim to get 1% better every day.",
      "Focus on systems — how you'll actually get there — rather than on goals.",
      "To change a habit for good, focus on who you want to become, not what you want to achieve.",
    ],
    quotes: [],
    notes: [],
  },
  {
    slug: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    category: "Business",
    status: "read",
    spineColor: "#5a6470",
    cover: COVER("zero-to-one"),
    summary:
      "Peter Thiel on building companies that create genuinely new things instead of copying what already works.",
    takeaways: [],
    quotes: [],
    notes: [],
  },
  {
    slug: "dune",
    title: "Dune",
    author: "Frank Herbert",
    category: "Fiction",
    status: "read",
    spineColor: "#9a6a3f",
    cover: COVER("dune"),
    summary:
      "The desert planet Arrakis, the spice, and Paul Atreides — Herbert's epic of power, ecology, and prophecy.",
    takeaways: [],
    quotes: [],
    notes: [],
  },
  {
    slug: "build",
    title: "Build",
    author: "Tony Fadell",
    category: "Tech",
    status: "reading",
    spineColor: "#54606a",
    cover: COVER("build"),
    summary:
      "Tony Fadell's playbook from a 30-year career building things — iPod, iPhone, Nest — on what it actually takes to make products worth making.",
    takeaways: [],
    quotes: [],
    notes: [],
  },
];

/* ---- Derived helpers used by the mockups ---- */

const CATEGORIES = [...new Set(BOOKS.map((b) => b.category))].sort();

// Flatten every note into a single stream of typed entries.
function allNotes() {
  const out = [];
  for (const b of BOOKS) {
    b.takeaways.forEach((t, i) =>
      out.push({ type: "takeaway", text: t, book: b, key: `${b.slug}-t${i}` }),
    );
    b.quotes.forEach((q, i) =>
      out.push({ type: "quote", text: q.text, source: q.source, book: b, key: `${b.slug}-q${i}` }),
    );
    b.notes.forEach((n, i) =>
      out.push({
        type: "note",
        heading: n.h,
        text: n.p || (n.list ? n.list.join(" · ") : ""),
        list: n.list || null,
        book: b,
        key: `${b.slug}-n${i}`,
      }),
    );
  }
  return out;
}

function noteCount(b) {
  return (
    b.takeaways.length +
    b.quotes.length +
    b.notes.length
  );
}

// expose globally for the plain-script mockups
window.BOOKS = BOOKS;
window.CATEGORIES = CATEGORIES;
window.allNotes = allNotes;
window.noteCount = noteCount;
