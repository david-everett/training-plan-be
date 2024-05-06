import { Controller, Post, Body } from '@nestjs/common';
import { StravaService } from './strava.service';

@Controller('strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @Post('running-stats')
  async getRunningStats(@Body('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.stravaService.getRunningStats(userId);
  }
}
