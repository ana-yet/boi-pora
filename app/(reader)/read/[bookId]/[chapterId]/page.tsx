import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderShell } from "./_components/ReaderShell";
import { ChapterContent } from "./_components/ChapterContent";
import type { Illustration } from "./_components/ChapterContent";

/* ─── Types ─── */

interface ChapterData {
    bookTitle: string;
    chapterLabel: string;
    chapterNumber: string;
    chapterTitle: string;
    paragraphs: string[];
    illustration?: Illustration;
    progress: { currentPage: number; totalPages: number; percentage: number };
    prevHref?: string;
    nextHref?: string;
}

/* ─── Mock data — replace with DB/CMS call in production ─── */

const CHAPTERS: Record<string, Record<string, ChapterData>> = {
    "great-gatsby": {
        "chapter-3": {
            bookTitle: "The Great Gatsby",
            chapterLabel: "Chapter 3",
            chapterNumber: "Chapter Three",
            chapterTitle: "The Blue Gardens",
            paragraphs: [
                "There was music from my neighbor's house through the summer nights. In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars. At high tide in the afternoon I watched his guests diving from the tower of his raft, or taking the sun on the hot sand of his beach while his two motor-boats slit the waters of the Sound, drawing aquaplanes over cataracts of foam.",
                "On week-ends his Rolls-Royce became an omnibus, bearing parties to and from the city between nine in the morning and long past midnight, while his station wagon scampered like a brisk yellow bug to meet all trains. And on Mondays eight servants, including an extra gardener, toiled all day with mops and scrubbing-brushes and hammers and garden-shears, repairing the ravages of the night before.",
                "Every Friday five crates of oranges and lemons arrived from a fruiterer in New York—every Monday these same oranges and lemons left his back door in a pyramid of pulpless halves. There was a machine in the kitchen which could extract the juice of two hundred oranges in half an hour if a little button was pressed two hundred times by a butler's thumb.",
                "At least once a fortnight a corps of caterers came down with several hundred feet of canvas and enough colored lights to make a Christmas tree of Gatsby's enormous garden. On buffet tables, garnished with glistening hors-d'oeuvre, spiced baked hams crowded against salads of harlequin designs and pastry pigs and turkeys bewitched to a dark gold.",
                "In the main hall a bar with a real brass rail was set up, and stocked with gins and liquors and with cordials so long forgotten that most of his female guests were too young to know one from another.",
                "By seven o'clock the orchestra has arrived, no thin five-piece affair, but a whole pitful of oboes and trombones and saxophones and viols and cornets and piccolos, and low and high drums. The last swimmers have come in from the beach now and are dressing up-stairs; the cars from New York are parked five deep in the drive, and already the halls and salons and verandas are gaudy with primary colors.",
            ],
            illustration: {
                src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoZj5VVeibPfocTQKzcGOyTnyeM7qxNSLkGx2QQWIrrlWbIrRcivSOh2sbxYsI08T8AEYfSt4e9sFMdRBeM7OEnB76xsxI4N1uYNd-S7iHMsgu6mAD3QbWSlNsktm0BOz1bkTQnALo9Oy4UD9Nk_bQLx2TPhvKkVQloFnoo9nFX84spirnrdtRFouPvEWbTDd69Whkje4DrJgbt8oXEp7osdgydHGTl80e14-8ZwHu537IySw1DjOalplPuxJn5kju4ImyVnHffTHW",
                alt: "Abstract representation of a garden party at night with blurred lights",
                caption: "The atmosphere of the summer nights",
                afterParagraph: 4,
            },
            progress: {
                currentPage: 45,
                totalPages: 180,
                percentage: 25,
            },
            prevHref: "/read/great-gatsby/chapter-2",
            nextHref: "/read/great-gatsby/chapter-4",
        },
    },
};

async function getChapter(
    bookId: string,
    chapterId: string
): Promise<ChapterData | null> {
    return CHAPTERS[bookId]?.[chapterId] ?? null;
}

/* ─── SSG ─── */

export function generateStaticParams() {
    const params: { bookId: string; chapterId: string }[] = [];
    for (const [bookId, chapters] of Object.entries(CHAPTERS)) {
        for (const chapterId of Object.keys(chapters)) {
            params.push({ bookId, chapterId });
        }
    }
    return params;
}

/* ─── Metadata ─── */

interface PageProps {
    params: Promise<{ bookId: string; chapterId: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { bookId, chapterId } = await params;
    const data = await getChapter(bookId, chapterId);
    if (!data) return { title: "Reader" };
    return {
        title: `${data.chapterLabel} — ${data.bookTitle}`,
        description: `Read ${data.chapterTitle} from ${data.bookTitle}`,
    };
}

/* ─── Page ─── */

export default async function ReaderPage({ params }: PageProps) {
    const { bookId, chapterId } = await params;
    const data = await getChapter(bookId, chapterId);

    if (!data) notFound();

    return (
        <ReaderShell
            bookTitle={data.bookTitle}
            chapterLabel={data.chapterLabel}
            progress={data.progress}
            prevHref={data.prevHref}
            nextHref={data.nextHref}
        >
            <ChapterContent
                chapterNumber={data.chapterNumber}
                chapterTitle={data.chapterTitle}
                paragraphs={data.paragraphs}
                illustration={data.illustration}
            />
        </ReaderShell>
    );
}
