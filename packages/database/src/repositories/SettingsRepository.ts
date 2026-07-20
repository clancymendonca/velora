import { BaseRepository } from './BaseRepository.js';
import { UserSettings } from '@prisma/client';
import { Settings } from '@velora/shared-types';
import { Decimal } from 'decimal.js';

export class SettingsRepository extends BaseRepository {
  async findByUserId(userId: string): Promise<Settings | null> {
    const settings = await this.db.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) return null;

    return {
      userId: settings.userId,
      oddsFormat: settings.oddsFormat as any,
      defaultStake: settings.defaultStake.toNumber(),
      riskTolerancePercent: settings.riskTolerancePercent.toNumber(),
      kellyFraction: settings.kellyFraction.toNumber(),
      trackedBookmakers: settings.trackedBookmakers,
      trackedSports: settings.trackedSports as any[],
    };
  }

  async updateSettings(userId: string, data: Partial<Settings>): Promise<Settings> {
    const updateData: any = {};
    if (data.oddsFormat !== undefined) updateData.oddsFormat = data.oddsFormat;
    if (data.defaultStake !== undefined) updateData.defaultStake = new Decimal(data.defaultStake);
    if (data.riskTolerancePercent !== undefined) updateData.riskTolerancePercent = new Decimal(data.riskTolerancePercent);
    if (data.kellyFraction !== undefined) updateData.kellyFraction = new Decimal(data.kellyFraction);
    if (data.trackedBookmakers !== undefined) updateData.trackedBookmakers = data.trackedBookmakers;
    if (data.trackedSports !== undefined) updateData.trackedSports = data.trackedSports;

    const updated = await this.db.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    return {
      userId: updated.userId,
      oddsFormat: updated.oddsFormat as any,
      defaultStake: updated.defaultStake.toNumber(),
      riskTolerancePercent: updated.riskTolerancePercent.toNumber(),
      kellyFraction: updated.kellyFraction.toNumber(),
      trackedBookmakers: updated.trackedBookmakers,
      trackedSports: updated.trackedSports as any[],
    };
  }
}
