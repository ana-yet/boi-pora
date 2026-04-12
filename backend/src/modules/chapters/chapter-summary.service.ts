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
      'Summarize the following book chapter for a reader who wants a quick overview.\n\n' +
      'Requirements:\n' +
      '- Clear prose; short paragraphs or light bullet structure if it helps.\n' +
      '- Do not invent plot beyond the excerpt.\n' +
      '- Prefer the same language as the chapter when obvious; otherwise English.\n' +
      '- About 150–400 words unless the chapter is very short.\n' +
      '- Output only the summary text (no title line like "Summary:").\n\n' +
      `Chapter title: ${title}\n\nChapter body:\n${body}`
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
            content:
              'You are a careful reading assistant. Reply with only the chapter summary body.',
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 2048,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new BadGatewayException(
        `Summary provider error (${res.status}): ${raw.slice(0, 240)}`,
      );
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

  async deleteByBookAndChapterId(bookId: Types.ObjectId, chapterId: string): Promise<void> {
    await this.summaryModel.deleteOne({ bookId, chapterId }).exec();
  }
}
