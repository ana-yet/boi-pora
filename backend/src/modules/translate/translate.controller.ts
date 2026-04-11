import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { TranslateTextDto } from './dto/translate-text.dto';
import { TranslateService } from './translate.service';

@Controller('api/v1/translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post()
  translate(@Body() dto: TranslateTextDto) {
    return this.translateService.translateChapter(
      dto.text,
      dto.source,
      dto.target,
    );
  }
}
