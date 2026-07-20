import { BaseController } from './BaseController.js';
import { AnalyticsService } from '../services/AnalyticsService.js';

export class AnalyticsController extends BaseController {
  private analyticsService: AnalyticsService;

  constructor(analyticsService = new AnalyticsService()) {
    super();
    this.analyticsService = analyticsService;
  }

  /**
   * GET /api/analytics
   */
  async getAnalytics(
    userId: string,
    path: string
  ): Promise<{ status: number; data: unknown }> {
    try {
      const analytics = await this.analyticsService.getAnalytics(userId);
      return { status: 200, data: analytics };
    } catch (error) {
      return this.handleException(error, path);
    }
  }
}
