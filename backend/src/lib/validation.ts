import { ZodError, type ZodIssue } from 'zod';
import {
  hasZodFastifySchemaValidationErrors,
  type ZodFastifySchemaValidationError,
} from 'fastify-type-provider-zod';
import type { ValidationErrorResponse, ValidationIssue } from '../schemas/common';

function formatZodIssue(issue: ZodIssue, prefix?: string): ValidationIssue {
  const pathParts = issue.path.map(String);
  const path = [prefix, ...pathParts].filter(Boolean).join('.');
  return {
    path: path || '(root)',
    message: issue.message,
    code: issue.code,
  };
}

function formatFastifyZodIssue(
  issue: ZodFastifySchemaValidationError,
  context?: string,
): ValidationIssue {
  const instance = issue.instancePath?.replace(/^\//, '').replace(/\//g, '.') ?? '';
  const path = [context, instance].filter(Boolean).join('.') || '(root)';
  const zodIssue = issue.params?.issue as ZodIssue | undefined;
  return {
    path,
    message: issue.message ?? zodIssue?.message ?? 'Invalid value',
    code: zodIssue?.code ?? issue.keyword,
  };
}

/**
 * Normalize Zod / Fastify validation failures into a consistent API response.
 * Call this from the global error handler before any business logic runs.
 */
export function toValidationErrorResponse(error: unknown): ValidationErrorResponse | null {
  if (error instanceof ZodError) {
    return {
      message: 'Validation failed',
      issues: error.issues.map((issue) => formatZodIssue(issue)),
    };
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    const context =
      typeof error === 'object' &&
      error !== null &&
      'validationContext' in error &&
      typeof (error as { validationContext?: unknown }).validationContext === 'string'
        ? (error as { validationContext: string }).validationContext
        : undefined;

    return {
      message: 'Validation failed',
      issues: error.validation.map((issue) => formatFastifyZodIssue(issue, context)),
    };
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    ('validation' in error || (error as { code?: string }).code === 'FST_ERR_VALIDATION')
  ) {
    const err = error as {
      validation?: Array<{ instancePath?: string; message?: string; keyword?: string }>;
      validationContext?: string;
      message?: string;
    };
    const context = err.validationContext;
    const issues: ValidationIssue[] =
      Array.isArray(err.validation) && err.validation.length > 0
        ? err.validation.map((v) => {
            const instance = v.instancePath?.replace(/^\//, '').replace(/\//g, '.') ?? '';
            const path = [context, instance].filter(Boolean).join('.') || '(root)';
            return {
              path,
              message: v.message ?? 'Invalid value',
              code: v.keyword,
            };
          })
        : [{ path: context ?? '(root)', message: err.message ?? 'Validation failed' }];

    return { message: 'Validation failed', issues };
  }

  return null;
}
