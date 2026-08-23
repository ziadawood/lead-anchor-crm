import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { IApiError } from '@leadanchor/shared';

export const errorHandler = (err: Error, c: Context) => {
  console.error('[API Error]', err);

  if (err instanceof HTTPException) {
    const response: { error: IApiError } = {
      error: {
        code: 'HTTP_EXCEPTION',
        message: err.message,
      },
    };
    return c.json(response, err.status);
  }

  // Fallback for unhandled exceptions
  const response: { error: IApiError } = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  };
  
  return c.json(response, 500);
};
