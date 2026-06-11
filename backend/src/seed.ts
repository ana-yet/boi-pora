/**
 * Seed script.
 *
 *   npm run seed                    → admin user only
 *   npm run seed -- --with-fixtures → admin + demo catalog (20 books with
 *                                     chapters, demo user with library,
 *                                     progress, and reviews)
 *
 * Fixtures are idempotent: if the first fixture book already exists the
 * fixture pass is skipped entirely.
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config();

const MONGODB_URI = process.env.MONGODB_URI;
const WITH_FIXTURES = process.argv.includes('--with-fixtures');

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

interface FixtureBook {
  title: string;
  slug: string;
  author: string;
  category: string;
  language: 'bn' | 'en';
  genres: string[];
  description: string;
  chapterCount: number;
}

const FIXTURE_BOOKS: FixtureBook[] = [
  {
    title: 'The Salt Road',
    slug: 'the-salt-road',
    author: 'Amara Hossain',
    category: 'fiction',
    language: 'en',
    genres: ['literary', 'travel'],
    description:
      'A caravan trader’s daughter walks the old salt route one last time before the railway makes it obsolete, collecting the stories of everyone she meets.',
    chapterCount: 5,
  },
  {
    title: 'নীল পাহাড়ের চিঠি',
    slug: 'nil-paharer-chithi',
    author: 'রওনক জাহান',
    category: 'fiction',
    language: 'bn',
    genres: ['drama', 'family'],
    description:
      'পার্বত্য চট্টগ্রামের এক ডাকঘরে জমে থাকা না-পাঠানো চিঠিগুলো খুঁজে পায় এক তরুণ পোস্টমাস্টার, আর প্রতিটি চিঠি খুলে দেয় একেকটি জীবনের গল্প।',
    chapterCount: 4,
  },
  {
    title: 'Clockwork Monsoon',
    slug: 'clockwork-monsoon',
    author: 'Dev Acharya',
    category: 'sci-fi',
    language: 'en',
    genres: ['steampunk', 'adventure'],
    description:
      'In an alternate Dhaka where the monsoon is engineered by brass machines, a apprentice rain-keeper discovers the storms are starting to think for themselves.',
    chapterCount: 5,
  },
  {
    title: 'মেঘনার মাঝি',
    slug: 'meghnar-majhi',
    author: 'সেলিনা আখতার',
    category: 'fiction',
    language: 'bn',
    genres: ['river', 'classic'],
    description:
      'মেঘনা নদীর বুকে তিন প্রজন্মের মাঝি পরিবারের উত্থান-পতনের উপাখ্যান।',
    chapterCount: 4,
  },
  {
    title: 'A Field Guide to Forgotten Stations',
    slug: 'field-guide-forgotten-stations',
    author: 'Imran Chowdhury',
    category: 'non-fiction',
    language: 'en',
    genres: ['history', 'railways'],
    description:
      'Photographic essays and oral histories from the abandoned railway stations of Bengal, and the communities that grew up around them.',
    chapterCount: 4,
  },
  {
    title: 'The Archivist of Small Hours',
    slug: 'archivist-of-small-hours',
    author: 'Leena Banu',
    category: 'mystery',
    language: 'en',
    genres: ['noir', 'literary'],
    description:
      'A night-shift archivist at a city newspaper notices that obituaries keep appearing three days before the deaths they describe.',
    chapterCount: 5,
  },
  {
    title: 'ধানসিঁড়ি রিভিজিটেড',
    slug: 'dhanshiri-revisited',
    author: 'আবু তালেব',
    category: 'poetry',
    language: 'bn',
    genres: ['poetry', 'modern'],
    description:
      'জীবনানন্দ-পরবর্তী বাংলার গ্রামীণ নিসর্গ নিয়ে একগুচ্ছ আধুনিক কবিতা ও গদ্যকবিতা।',
    chapterCount: 3,
  },
  {
    title: 'Borrowed Light',
    slug: 'borrowed-light',
    author: 'Sara Quayum',
    category: 'romance',
    language: 'en',
    genres: ['contemporary'],
    description:
      'Two rival planetarium narrators in Chattogram are forced to co-write the winter sky show, one constellation at a time.',
    chapterCount: 4,
  },
  {
    title: 'অপারেশন জ্যাকপট: ফিরে দেখা',
    slug: 'operation-jackpot-fire-dekha',
    author: 'মাহফুজ রহমান',
    category: 'non-fiction',
    language: 'bn',
    genres: ['history', 'war'],
    description:
      '১৯৭১ সালের নৌ-কমান্ডো অভিযানের প্রত্যক্ষদর্শী, নথি ও সাক্ষাৎকারভিত্তিক পুনর্পাঠ।',
    chapterCount: 5,
  },
  {
    title: 'The Lighthouse Debt',
    slug: 'the-lighthouse-debt',
    author: 'Nadia Rahim',
    category: 'thriller',
    language: 'en',
    genres: ['suspense', 'coastal'],
    description:
      'A loan collector arrives on a cyclone-battered island to settle a thirty-year-old debt owed by a lighthouse keeper who has been dead for ten of them.',
    chapterCount: 5,
  },
  {
    title: 'কাঁটাতারের রান্নাঘর',
    slug: 'kantatarer-rannaghar',
    author: 'শবনম মুস্তারি',
    category: 'non-fiction',
    language: 'bn',
    genres: ['food', 'memoir'],
    description:
      'দেশভাগের দুই পারে ছড়িয়ে পড়া এক পরিবারের রেসিপি আর স্মৃতির খাতা।',
    chapterCount: 4,
  },
  {
    title: 'Recursion for Breakfast',
    slug: 'recursion-for-breakfast',
    author: 'Tanvir Alam',
    category: 'non-fiction',
    language: 'en',
    genres: ['technology', 'essays'],
    description:
      'Plain-language essays on the algorithms quietly running daily life in South Asia, from rickshaw routing to rice futures.',
    chapterCount: 4,
  },
  {
    title: 'হাওরের জ্যোৎস্না',
    slug: 'haorer-jyotsna',
    author: 'নাজমুল হুদা',
    category: 'fiction',
    language: 'bn',
    genres: ['rural', 'drama'],
    description:
      'বর্ষায় ডুবে যাওয়া হাওর-গ্রামে এক স্কুলশিক্ষকের প্রথম পোস্টিংয়ের বছর।',
    chapterCount: 4,
  },
  {
    title: 'The Cartographer’s Daughter',
    slug: 'cartographers-daughter',
    author: 'Priya Sen',
    category: 'fantasy',
    language: 'en',
    genres: ['epic', 'maps'],
    description:
      'Maps drawn by a dying cartographer keep changing overnight — and his daughter realizes the land is redrawing itself to match.',
    chapterCount: 5,
  },
  {
    title: 'ট্রাম লাইনের শেষ স্টপ',
    slug: 'tram-line-er-shesh-stop',
    author: 'অরুণিমা দত্ত',
    category: 'fiction',
    language: 'bn',
    genres: ['urban', 'nostalgia'],
    description: 'কলকাতার শেষ ট্রাম ডিপোর কর্মীদের এক বছরের দিনলিপি।',
    chapterCount: 3,
  },
  {
    title: 'Monsoon Arithmetic',
    slug: 'monsoon-arithmetic',
    author: 'Farid Kabir',
    category: 'non-fiction',
    language: 'en',
    genres: ['economics', 'climate'],
    description:
      'How rain decides prices, politics, and futures across the delta — an accessible tour of climate economics.',
    chapterCount: 4,
  },
  {
    title: 'ছায়াপথের ডাকপিয়ন',
    slug: 'chhayapather-dakpion',
    author: 'জাহিদ হাসান',
    category: 'sci-fi',
    language: 'bn',
    genres: ['space', 'ya'],
    description:
      'আন্তঃনাক্ষত্রিক ডাক-জাহাজের সবচেয়ে কমবয়সী পিয়নের প্রথম একক ডেলিভারি মিশন।',
    chapterCount: 4,
  },
  {
    title: 'Practical Banglish',
    slug: 'practical-banglish',
    author: 'Rumi Akter',
    category: 'non-fiction',
    language: 'en',
    genres: ['language', 'humor'],
    description:
      'A tongue-in-cheek phrasebook and serious sociolinguistic study of how Bangla and English braid together in everyday speech.',
    chapterCount: 3,
  },
  {
    title: 'শীতলক্ষ্যা সন্ধ্যা',
    slug: 'shitalakshya-shondha',
    author: 'কামরুল ইসলাম',
    category: 'mystery',
    language: 'bn',
    genres: ['detective', 'river'],
    description:
      'নারায়ণগঞ্জের পাটকল-পাড়ায় এক নিখোঁজ হিসাবরক্ষক, আর অবসরপ্রাপ্ত এক স্কুল-দারোয়ানের নিজস্ব তদন্ত।',
    chapterCount: 5,
  },
  {
    title: 'Ninety Days of Static',
    slug: 'ninety-days-of-static',
    author: 'Zoya Mahmood',
    category: 'thriller',
    language: 'en',
    genres: ['radio', 'mystery'],
    description:
      'A community radio engineer starts receiving broadcasts from a station that signed off in 1987 — always exactly ninety days ahead of the present.',
    chapterCount: 5,
  },
];

const PARA_BANK_EN = [
  'The morning arrived the way all important mornings do: quietly, and without any sense of its own significance. By the time the kettle had boiled, three separate decisions had already been made that could not be unmade.',
  'There is a particular kind of silence that only exists in places built for noise — empty stations, closed markets, radio studios after sign-off. It is not the absence of sound so much as the memory of it.',
  'She kept a notebook for things that did not fit anywhere else. Most of its pages were lists: names of boats, debts owed and forgiven, the precise colour of the river at six in the evening in late October.',
  'Nobody remembered who had started the custom, which is how you can tell a custom is old. The young complained about it, the old defended it, and everyone showed up anyway, year after year, rain or otherwise.',
  'The letter had been opened and resealed so many times that the envelope had gone soft as cloth. Whatever it said, it had been read more often than most holy books and obeyed considerably less.',
  'Maps lie politely. They flatten hills that have killed men, shrink rivers that have swallowed villages, and mark with the same thin line a road you can drive and a road that exists mainly as a rumour.',
  'He counted in harvests, not years. Ask him when the bridge was built and he would tell you it was two floods after the big drought, the same season the mango orchard gave double.',
  'The machine was older than everyone in the room and had outlasted four governments, two languages of instruction, and at least one serious attempt to replace it with something modern.',
  'At night the town rearranged itself. Streets that led somewhere by day led somewhere else entirely after the last bus had gone, and the people who walked them then knew both versions by heart.',
  'Grief, she discovered, kept office hours. It arrived punctually with the first tea of the morning, took a long lunch, and came back sharper in the evening, like a clerk determined to close a file.',
];

const PARA_BANK_BN = [
  'ভোরবেলা নদীর ওপর কুয়াশা এমনভাবে জমে থাকে, যেন রাতের সব না-বলা কথা ভোরের আলো ফোটার আগে আরেকবার পড়ে নিচ্ছে কেউ।',
  'বাজারের সবচেয়ে পুরোনো দোকানটার কোনো সাইনবোর্ড নেই। দরকারও নেই — যে চেনে সে এমনিই আসে, যে চেনে না তার জন্য এ দোকান নয়।',
  'দাদি বলতেন, প্রতিটি বাড়ির একটা নিজস্ব গন্ধ থাকে, আর মানুষ মরে গেলে সবার আগে সেই গন্ধটাই বদলে যায়।',
  'চিঠিটা তিনবার লেখা হয়েছিল। প্রথমবার রাগে, দ্বিতীয়বার দুঃখে, আর তৃতীয়বার — যেটা শেষে পাঠানো হলো — নিখুঁত, মাপা ভদ্রতায়।',
  'স্টেশনের ঘড়িটা বিশ বছর ধরে চারটা দশে দাঁড়িয়ে আছে। আশ্চর্যের ব্যাপার হলো, দিনে দুবার সেটাই হয় শহরের সবচেয়ে সঠিক ঘড়ি।',
  'বর্ষা এলে হাওরের গ্রামগুলো দ্বীপ হয়ে যায়, আর মানুষগুলো হয়ে যায় নাবিক — যদিও কেউ কোনোদিন সমুদ্র দেখেনি।',
  'হিসাবের খাতায় সব লেনদেন লেখা থাকে, শুধু সবচেয়ে বড় ঋণগুলো ছাড়া। সেগুলো লেখা থাকে মানুষের মুখে মুখে, প্রজন্ম থেকে প্রজন্মে।',
  'রাত বাড়লে রেডিওর সিগন্যাল পরিষ্কার হয়ে আসে। পুরোনো ইঞ্জিনিয়াররা বলেন, রাতের বাতাসে শব্দ দূরে যায়; কবিরা বলেন, রাতে পৃথিবী শুনতে শেখে।',
];

function buildChapterContent(
  book: FixtureBook,
  chapterNumber: number,
  chapterTitle: string,
): string {
  const bank = book.language === 'bn' ? PARA_BANK_BN : PARA_BANK_EN;
  // Deterministic-ish selection so re-runs produce identical content.
  const seedIdx = (book.slug.length * 7 + chapterNumber * 3) % bank.length;
  const paras: string[] = [];
  const paraCount = 5 + ((chapterNumber + book.chapterCount) % 3); // 5–7
  for (let i = 0; i < paraCount; i++) {
    paras.push(bank[(seedIdx + i) % bank.length]);
  }
  const quote = bank[(seedIdx + paraCount) % bank.length];

  return [
    `## ${chapterTitle}`,
    '',
    paras.slice(0, 2).join('\n\n'),
    '',
    `> ${quote}`,
    '',
    paras.slice(2).join('\n\n'),
  ].join('\n');
}

function chapterTitleFor(book: FixtureBook, n: number): string {
  if (book.language === 'bn') {
    const names = ['সূচনা', 'স্রোত', 'মোড়', 'ফেরা', 'শেষ অধ্যায়'];
    return names[n - 1] ?? `অধ্যায় ${n}`;
  }
  const names = [
    'Arrival',
    'Undercurrents',
    'The Turn',
    'What the Water Keeps',
    'Last Light',
  ];
  return names[n - 1] ?? `Chapter ${n}`;
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

async function seedAdmin(db: mongoose.mongo.Db): Promise<void> {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    console.error(
      'ADMIN_SEED_PASSWORD is not set. Refusing to seed an admin with a default password.\n' +
        'Set ADMIN_SEED_PASSWORD in your environment (or backend/.env) and re-run.',
    );
    process.exit(1);
  }
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@boipora.com';

  const users = db.collection('users');
  const existing = await users.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }
  const hash = await bcrypt.hash(adminPassword, 12);
  await users.insertOne({
    email: adminEmail,
    passwordHash: hash,
    name: 'Admin',
    role: 'admin',
    authProvider: 'local',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(
    `Admin user created: ${adminEmail} (password from ADMIN_SEED_PASSWORD)`,
  );
}

async function seedFixtures(db: mongoose.mongo.Db): Promise<void> {
  const books = db.collection('books');
  const chapters = db.collection('chapters');
  const users = db.collection('users');
  const libraryItems = db.collection('libraryitems');
  const reviews = db.collection('reviews');
  const progress = db.collection('readingprogresses');

  // Idempotency marker: first fixture book's slug.
  const marker = await books.findOne({ slug: FIXTURE_BOOKS[0].slug });
  if (marker) {
    console.log(
      'Fixtures already present — skipping (delete fixture books to re-seed).',
    );
    return;
  }

  const now = Date.now();
  console.log(`Seeding ${FIXTURE_BOOKS.length} fixture books…`);

  const bookIds: mongoose.mongo.ObjectId[] = [];
  for (const [i, fb] of FIXTURE_BOOKS.entries()) {
    const createdAt = new Date(now - (FIXTURE_BOOKS.length - i) * 86_400_000);
    let totalWords = 0;
    const chapterDocs = [];
    for (let n = 1; n <= fb.chapterCount; n++) {
      const title = chapterTitleFor(fb, n);
      const content = buildChapterContent(fb, n, title);
      const wordCount = countWords(content);
      totalWords += wordCount;
      chapterDocs.push({
        chapterNumber: n,
        chapterId: `chapter-${n}`,
        title,
        content,
        wordCount,
        order: n,
        createdAt,
        updatedAt: createdAt,
      });
    }

    const { insertedId } = await books.insertOne({
      title: fb.title,
      slug: fb.slug,
      author: fb.author,
      description: fb.description,
      category: fb.category,
      genres: fb.genres,
      language: fb.language,
      status: 'published',
      rating: 0,
      ratingCount: 0,
      estimatedReadTimeMinutes: Math.max(1, Math.round(totalWords / 220)),
      createdAt,
      updatedAt: createdAt,
    });
    bookIds.push(insertedId);

    await chapters.insertMany(
      chapterDocs.map((c) => ({ ...c, bookId: insertedId })),
    );
  }

  // Demo user with a populated library, reviews, and reading progress.
  const demoEmail = 'demo@boipora.com';
  const demoPassword = process.env.DEMO_SEED_PASSWORD || 'demo-boipora-2026';
  let demo = await users.findOne({ email: demoEmail });
  if (!demo) {
    const hash = await bcrypt.hash(demoPassword, 12);
    const { insertedId } = await users.insertOne({
      email: demoEmail,
      passwordHash: hash,
      name: 'Demo Reader',
      role: 'user',
      authProvider: 'local',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    demo = await users.findOne({ _id: insertedId });
    console.log(`Demo user created: ${demoEmail} / ${demoPassword}`);
  }
  if (!demo) throw new Error('Failed to create demo user');

  const demoId = demo._id;

  // Library: first 8 fixture books.
  await libraryItems.insertMany(
    bookIds.slice(0, 8).map((bookId, i) => ({
      userId: demoId,
      bookId,
      status: 'saved',
      addedAt: new Date(now - i * 43_200_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  // Reviews on 6 books (ratings 3–5), then sync book aggregates.
  const reviewTexts = [
    'Couldn’t put it down — finished it in two sittings.',
    'চমৎকার লেখা, বিশেষ করে শেষ অধ্যায়টা মনে থেকে যাবে।',
    'Slow start, but the second half completely earns it.',
    'The sense of place is extraordinary. You can smell the river.',
    'ভাষা সহজ, কিন্তু গল্পটা একদমই সহজ নয়। ভালো লাগল।',
    'Smart, warm, and surprisingly funny in places.',
  ];
  for (let i = 0; i < 6; i++) {
    const rating = 3 + ((i * 2) % 3); // 3,5,4,3,5,4
    await reviews.insertOne({
      userId: demoId,
      bookId: bookIds[i],
      rating,
      content: reviewTexts[i],
      isPublic: true,
      flagged: false,
      createdAt: new Date(now - i * 86_400_000),
      updatedAt: new Date(now - i * 86_400_000),
    });
    await books.updateOne(
      { _id: bookIds[i] },
      { $set: { rating, ratingCount: 1 } },
    );
  }

  // Reading progress on 4 books (chapter 2 of each, varied completion).
  for (let i = 0; i < 4; i++) {
    const ch = await chapters.findOne({
      bookId: bookIds[i],
      chapterId: 'chapter-2',
    });
    await progress.insertOne({
      userId: demoId,
      bookId: bookIds[i],
      chapterId: ch?._id,
      percentComplete: [40, 25, 60, 80][i],
      scrollPercent: [35, 70, 10, 50][i],
      lastReadAt: new Date(now - i * 21_600_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(
    `Fixtures seeded: ${FIXTURE_BOOKS.length} books, demo library (8), reviews (6), progress (4).`,
  );
}

async function seed() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('DB not connected');

  await seedAdmin(db);
  if (WITH_FIXTURES) {
    await seedFixtures(db);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
