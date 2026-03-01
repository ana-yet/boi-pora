export interface Illustration {
    src: string;
    alt: string;
    caption: string;
    afterParagraph: number;
}

interface ChapterContentProps {
    chapterNumber: string;
    chapterTitle: string;
    paragraphs: string[];
    illustration?: Illustration;
}

export function ChapterContent({
    chapterNumber,
    chapterTitle,
    paragraphs,
    illustration,
}: ChapterContentProps) {
    return (
        <>
            {/* Chapter Heading */}
            <header className="mb-12 text-center">
                <span className="text-primary/60 font-display text-sm font-bold tracking-widest uppercase mb-4 block">
                    {chapterNumber}
                </span>
                <h2 className="font-serif-reading text-4xl md:text-5xl font-bold leading-tight">
                    {chapterTitle}
                </h2>
            </header>

            {/* Prose Blocks */}
            {paragraphs.map((text, i) => (
                <ParagraphBlock
                    key={i}
                    text={text}
                    isFirst={i === 0}
                    illustration={
                        illustration?.afterParagraph === i
                            ? illustration
                            : undefined
                    }
                />
            ))}
        </>
    );
}

function ParagraphBlock({
    text,
    isFirst,
    illustration,
}: {
    text: string;
    isFirst: boolean;
    illustration?: Illustration;
}) {
    return (
        <>
            <p
                className={`mb-8 ${
                    isFirst
                        ? "first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left"
                        : ""
                }`}
            >
                {text}
            </p>

            {illustration && (
                <figure className="my-12">
                    <div className="w-full h-64 bg-gradient-to-br from-primary/5 to-primary/20 rounded-xl overflow-hidden relative flex items-center justify-center">
                        <img
                            alt={illustration.alt}
                            className="w-full h-full object-cover opacity-80 mix-blend-overlay hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            src={illustration.src}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-50" />
                    </div>
                    <figcaption className="text-center text-sm opacity-50 mt-4 italic font-display">
                        {illustration.caption}
                    </figcaption>
                </figure>
            )}
        </>
    );
}
