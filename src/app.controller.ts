import { Controller, Get, Post, Body } from '@nestjs/common';
import { StravaService } from './strava.service';

@Controller()
export class AppController {
  constructor(private readonly stravaService: StravaService) {}
}
