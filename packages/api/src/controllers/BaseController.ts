import { z, ZodError } from 'zod';
import { ProblemDetails, ApiError } from '../types.js';

export class BaseController {
  /**
   * Validates input body data against a Zod schema.
   * Throws an ApiError on validation failure.
   */
  protected validate<T>(schema: z.Schema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ApiError(400, 'Validation failed.', 'VALIDATION_ERROR', error.errors);
      }
      throw error;
    }
  }

  /**
   * Formats standard caught errors into RFC 7807 Problem Details representation.
   */
  protected handleException(error: unknown, instancePath?: string): { status: number; data: ProblemDetails } {
    if (error instanceof ApiError) {
      const isValidationError = error.code === 'VALIDATION_ERROR';
      const invalidParams = isValidationError && Array.isArray(error.details)
        ? (error.details as z.ZodIssue[]).map((err) => ({
            name: err.path.join('.'),
            reason: err.message,
          }))
        : undefined;

      return {
        status: error.status,
        data: {
          type: `https://api.velora.com/errors/${error.code.toLowerCase().replace(/_/g, '-')}`,
          title: isValidationError ? 'Validation Failed' : 'Application Error',
          status: error.status,
          detail: error.message,
          instance: instancePath,
          invalidParams,
        },
      };
    }

    // Default internal server error fallback
    console.error('Unhandled Controller Error:', error);
    return {
      status: 500,
      data: {
        type: 'https://api.velora.com/errors/internal-server-error',
        title: 'Internal Server Error',
        status: 500,
        detail: error instanceof Error ? error.message : 'An unexpected error occurred.',
        instance: instancePath,
      },
    };
  }
}
