import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { Public } from '../../common/decorators/public.decorator';
import { ContactDto } from './dto/contact.dto';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Controller('api/v1/contact')
export class ContactController {
  constructor(
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post()
  @HttpCode(200)
  async submit(@Body() dto: ContactDto) {
    const to =
      this.config.get<string>('CONTACT_TO') ||
      this.config.get<string>('MAIL_FROM', 'onboarding@resend.dev');
    await this.mail.send({
      to,
      subject: `[Boi Pora contact] ${dto.subject} — ${dto.name}`,
      replyTo: dto.email,
      html: `
        <p><strong>From:</strong> ${escapeHtml(dto.name)} &lt;${escapeHtml(dto.email)}&gt;</p>
        <p><strong>Subject:</strong> ${escapeHtml(dto.subject)}</p>
        <p style="white-space: pre-wrap;">${escapeHtml(dto.message)}</p>
      `,
    });
    return { message: 'Message sent' };
  }
}
