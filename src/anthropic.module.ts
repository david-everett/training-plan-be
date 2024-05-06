import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AnthropicController } from './anthropic.controller';
import { AnthropicService } from './anthropic.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AnthropicController],
  providers: [AnthropicService],
})
export class AnthropicModule {}
