import { BaseController } from './BaseController.js';
import { CalculationService } from '../services/CalculationService.js';
import {
  EVCalculationSchema,
  KellyCalculationSchema,
  DevigCalculationSchema,
  EVCalculationInput,
  KellyCalculationInput,
  DevigCalculationInput,
} from '@velora/validators';
import { ProblemDetails } from '../types.js';

export class CalculationController extends BaseController {
  private calculationService: CalculationService;

  constructor(calculationService = new CalculationService()) {
    super();
    this.calculationService = calculationService;
  }

  /**
   * POST /api/calculations/ev
   */
  async calculateEV(
    body: any,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const validated = this.validate(EVCalculationSchema, body) as EVCalculationInput;
      const result = this.calculationService.calculateEV(validated);
      return { status: 200, data: result };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  /**
   * POST /api/calculations/kelly
   */
  async calculateKelly(
    body: any,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const validated = this.validate(KellyCalculationSchema, body) as KellyCalculationInput;
      const result = this.calculationService.calculateKelly(validated);
      return { status: 200, data: result };
    } catch (error) {
      return this.handleException(error, path);
    }
  }

  /**
   * POST /api/calculations/devig
   */
  async calculateDevig(
    body: any,
    path: string
  ): Promise<{ status: number; data: any | ProblemDetails }> {
    try {
      const validated = this.validate(DevigCalculationSchema, body) as DevigCalculationInput;
      const result = this.calculationService.calculateDevig(validated);
      return { status: 200, data: result };
    } catch (error) {
      return this.handleException(error, path);
    }
  }
}
