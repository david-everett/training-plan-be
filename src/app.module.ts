import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { StravaController } from './strava.controller';
import { StravaService } from './strava.service';
import { AnthropicController } from './anthropic.controller';
import { AnthropicService } from './anthropic.service';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [StravaController, AnthropicController],
  providers: [StravaService, AnthropicService],
})
export class AppModule {}
