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
    hideHeader?: boolean;
}

export function ChapterContent({
    chapterNumber,
    chapterTitle,
    paragraphs,
    illustration,
    hideHeader,
}: ChapterContentProps) {
    return (
        <>
            {!hideHeader && (
                <header className="mb-12 text-center">
                    <span className="text-primary/70 font-display text-sm font-bold tracking-widest uppercase mb-4 block">
                        {chapterNumber}
                    </span>
                    <h2 className="font-serif-reading text-3xl md:text-4xl font-bold leading-snug">
                        {chapterTitle}
                    </h2>
                </header>
            )}

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
                className={`mb-6 leading-relaxed ${
                    isFirst
                        ? "first-letter:text-[2.8em] first-letter:font-bold first-letter:text-primary first-letter:mr-1.5 first-letter:float-left first-letter:leading-[0.85]"
                        : ""
                }`}
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
                {text}
            </p>

            {illustration && (
                <figure className="my-10">
                    <div className="w-full h-64 bg-linear-to-br from-primary/5 to-primary/20 rounded-xl overflow-hidden relative flex items-center justify-center">
                        <img
                            alt={illustration.alt}
                            className="w-full h-full object-cover opacity-80 mix-blend-overlay hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            src={illustration.src}
                        />
                    </div>
                    <figcaption className="text-center text-sm opacity-50 mt-3 italic font-display">
                        {illustration.caption}
                    </figcaption>
                </figure>
            )}
        </>
    );
}
