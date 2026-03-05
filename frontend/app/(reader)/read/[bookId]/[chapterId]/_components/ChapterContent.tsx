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
                    <h2 style={{ fontSize: "2em", fontWeight: 700, lineHeight: 1.25 }}>
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
                style={{
                    marginBottom: "1.2em",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                }}
                className={
                    isFirst
                        ? "first-letter:text-[2.8em] first-letter:font-bold first-letter:text-primary first-letter:mr-1.5 first-letter:float-left first-letter:leading-[0.85]"
                        : ""
                }
            >
                {text}
            </p>

            {illustration && (
                <figure style={{ margin: "2.5em 0" }}>
                    <div className="w-full h-64 rounded-xl overflow-hidden relative flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(236,127,19,0.05), rgba(236,127,19,0.15))" }}>
                        <img
                            alt={illustration.alt}
                            className="w-full h-full object-cover opacity-80 mix-blend-overlay hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            src={illustration.src}
                        />
                    </div>
                    <figcaption className="text-center opacity-50 italic font-display" style={{ fontSize: "0.8em", marginTop: "0.75em" }}>
                        {illustration.caption}
                    </figcaption>
                </figure>
            )}
        </>
    );
}
