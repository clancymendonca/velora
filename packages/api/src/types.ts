/**
 * Standard RFC 7807 Problem Details representation for HTTP API Errors.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: { name: string; reason: string }[];
}

/**
 * Standard Cursor-based Paginated API Response container.
 */
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
}

/**
 * Custom application errors representing HTTP failures.
 */
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(status: number, message: string, code = 'API_ERROR', details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
