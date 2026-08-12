import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Minimal Resend HTTP API client. No SDK — one endpoint, one fetch.
 * Without RESEND_API_KEY: no-op with a warning in development,
 * 503 in production (callers treat mail as a hard dependency there).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(options: MailOptions): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('MAIL_FROM', 'onboarding@resend.dev');

    if (!apiKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Email service not configured');
      }
      this.logger.warn(
        `RESEND_API_KEY not set — skipping email "${options.subject}" to ${options.to}`,
      );
      return;
    }

    let res: Response;
    try {
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          ...(options.replyTo ? { reply_to: options.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      this.logger.error(`Resend request failed: ${String(err)}`);
      throw new ServiceUnavailableException('Email could not be sent');
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.error(`Resend responded ${res.status}: ${body}`);
      throw new ServiceUnavailableException('Email could not be sent');
    }
  }
}
