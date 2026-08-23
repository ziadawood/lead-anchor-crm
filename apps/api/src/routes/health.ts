import { Hono } from 'hono';
import type { IApiResponse } from '@leadanchor/shared';

const health = new Hono();

health.get('/', (c) => {
  const response: IApiResponse<{ status: string; timestamp: string }> = {
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };
  return c.json(response);
});

export default health;
