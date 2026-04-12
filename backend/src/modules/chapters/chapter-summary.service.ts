import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash } from 'crypto';
import { Chapter, ChapterDocument } from '../../schemas/chapter.schema';
import {
  ChapterAiSummary,
  ChapterAiSummaryDocument,
} from '../../schemas/chapter-ai-summary.schema';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_CONTENT_CHARS = 120_000;

@Injectable()
export class ChapterSummaryService {
  constructor(
    @InjectModel(Chapter.name) private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(ChapterAiSummary.name)
    private readonly summaryModel: Model<ChapterAiSummaryDocument>,
    private readonly config: ConfigService,
  ) {}

  private contentHash(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  private groqModel(): string {
    return this.config.get<string>('GROQ_MODEL')?.trim() || 'llama-3.3-70b-versatile';
  }

  async getOrCreateSummary(
    bookId: string,
    chapterSlug: string,
  ): Promise<{ summary: string; cached: boolean }> {
    let bookObjectId: Types.ObjectId;
    try {
      bookObjectId = new Types.ObjectId(bookId);
    } catch {
      throw new NotFoundException('Chapter not found');
    }

    const chapter = await this.chapterModel
      .findOne({ bookId: bookObjectId, chapterId: chapterSlug })
      .exec();
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const hash = this.contentHash(chapter.content);
    const existing = await this.summaryModel
      .findOne({ bookId: bookObjectId, chapterId: chapterSlug })
      .lean()
      .exec();

    if (existing?.summary?.trim() && existing.contentHash === hash) {
      return { summary: existing.summary.trim(), cached: true };
    }

    const apiKey = this.config.get<string>('GROQ_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Chapter summaries are not configured (set GROQ_API_KEY).',
      );
    }

    const userPrompt = this.buildUserPrompt(chapter.title, chapter.content);
    const summary = await this.callGroq(apiKey, userPrompt);
    const model = this.groqModel();

    await this.summaryModel.findOneAndUpdate(
      { bookId: bookObjectId, chapterId: chapterSlug },
      { $set: { summary, contentHash: hash, model } },
      { upsert: true, new: true },
    );

    return { summary, cached: false };
  }

  private buildUserPrompt(title: string, content: string): string {
    let body = content;
    if (body.length > MAX_CONTENT_CHARS) {
      body =
        body.slice(0, MAX_CONTENT_CHARS) +
        '\n\n[Text truncated for summarization.]';
    }
    return (
     'Summarize the following book chapter into a clear, structured overview.\n\n' +

'GOAL:\n' +
'- Help a reader quickly understand the most important ideas, events, or lessons.\n\n' +

'REQUIREMENTS:\n' +
'- Use clear Markdown with "##" section headings (e.g., Overview, Key Ideas, Takeaways).\n' +
'- Select 2–4 relevant sections only (do not force all sections).\n' +
'- Prioritize the most impactful ideas over minor details.\n' +
'- Focus on cause → effect and why things matter.\n' +
'- Adapt focus based on chapter type (story, informational, reflective).\n' +
'- Convert dialogue into clear narrative points when needed.\n' +
'- Avoid repeating the same idea in different words.\n' +
'- Do NOT invent or assume information beyond the given text.\n' +
'- Keep language consistent with the chapter; if unclear, use simple English.\n' +
'- Keep the summary concise (~150–250 words unless necessary).\n' +
'- If the chapter is short, produce a concise but complete summary.\n' +
'- Do NOT wrap the response in code blocks.\n\n' +

'CONTEXT:\n' +
`Chapter title: ${title}\n\n` +

'CHAPTER:\n' +
`${body}`
    );
  }

  private async callGroq(apiKey: string, userPrompt: string): Promise<string> {
    const res = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.groqModel(),
        messages: [
          {
            role: 'system',
            content: `
            You are a careful and intelligent reading assistant.
            
            TASK:
            Summarize a book chapter clearly, accurately, and consistently.
            
            INPUT:
            - You will receive a single book chapter or excerpt
            - It may include narration, dialogue, or descriptive text
            
            RULES:
            - Output ONLY the summary in GitHub-flavored Markdown
            - Use 2–4 sections with "##" headings
            - Choose sections based on relevance (do NOT force all sections)
            - Prefer this order when applicable:
              Overview → Key Ideas / Events → Characters → Takeaways
            - Do NOT include a top-level "#" title
            - Do NOT include any explanation or preamble
            - Do NOT use HTML
            
            STYLE:
            - Write in simple, easy English (for learners)
            - Keep sentences short and clear
            - Avoid complex or academic wording
            
            CONTENT:
            - Prioritize the most impactful ideas over minor details
            - Focus on cause → effect relationships
            - Explain why events or ideas matter
            - Convert dialogue into clear narrative points when needed
            - Remove unnecessary details
            
            ADAPTABILITY:
            - Adjust summary style based on chapter type:
              - Story → focus on events, characters, and progression
              - Informational → focus on key concepts and explanations
              - Reflective/self-help → focus on lessons and insights
            
            ACCURACY:
            - Do NOT add information that is not in the input
            - Do NOT guess or invent details
            
            CONSISTENCY:
            - Keep structure consistent across summaries for similar content
            
            TAKEAWAYS:
            - Make takeaways meaningful and practical when possible
            - Focus on lessons, insights, or real-world meaning
            
            FORMAT:
            - Use bullet points (- item) where helpful
            - Use short paragraphs (2–4 lines max)
            - Avoid repeating the same idea in different words
            
            LENGTH:
            - Target ~150–250 words unless the chapter is very long
            `
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 3072,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new BadGatewayException(this.friendlyGroqFailureMessage(res.status, raw));
    }

    let data: { choices?: Array<{ message?: { content?: string } }> };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      throw new BadGatewayException('Invalid response from summary provider');
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new BadGatewayException('Empty summary from provider');
    }
    return text.length > 32_000 ? text.slice(0, 32_000) : text;
  }

  /**
   * Avoid exposing Groq JSON, org ids, or model internals to readers.
   */
  private friendlyGroqFailureMessage(status: number, rawBody: string): string {
    const lower = rawBody.toLowerCase();
    let apiMessage = '';
    try {
      const parsed = JSON.parse(rawBody) as { error?: { message?: string } };
      apiMessage = (parsed.error?.message ?? '').toLowerCase();
    } catch {
      /* ignore */
    }
    const haystack = `${lower} ${apiMessage}`;

    const oversized =
      status === 413 ||
      haystack.includes('request too large') ||
      haystack.includes('tokens per minute') ||
      haystack.includes('tpm') ||
      haystack.includes('please reduce your message size') ||
      haystack.includes('reduce your message') ||
      haystack.includes('context length');

    if (oversized) {
      return (
        'This chapter is too long for the current AI summary limit. ' +
        'Try summarizing a shorter chapter or splitting the content. ' +
        'A paid or higher-tier Groq plan may be required—this feature is not available on the free quota for chapters this size.'
      );
    }

    if (status === 429 || haystack.includes('rate limit')) {
      return 'Too many summary requests right now. Please wait a moment and try again.';
    }

    if (status === 401 || status === 403) {
      return 'Chapter summaries are not available (API access issue). Check server configuration.';
    }

    if (status >= 500) {
      return 'The summary service is temporarily unavailable. Please try again later.';
    }

    return 'We could not generate a summary right now. Please try again later.';
  }

  async deleteByBookAndChapterId(bookId: Types.ObjectId, chapterId: string): Promise<void> {
    await this.summaryModel.deleteOne({ bookId, chapterId }).exec();
  }
}
