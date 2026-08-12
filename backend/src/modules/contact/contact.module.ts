import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [ContactController],
})
export class ContactModule {}
