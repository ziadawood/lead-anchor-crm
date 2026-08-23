import { createMiddleware } from 'hono/factory';

type Role = 'super_admin' | 'admin' | 'agent' | 'viewer';

const roleHierarchy: Record<Role, number> = {
  viewer: 1,
  agent: 2,
  admin: 3,
  super_admin: 4,
};

export const requireRole = (minimumRole: Role) => {
  return createMiddleware(async (c, next) => {
    const userRole = c.get('role') as Role | undefined;

    if (!userRole) {
      return c.json({ error: { code: 'FORBIDDEN', message: 'Role claim missing from token' } }, 403);
    }

    const userLevel = roleHierarchy[userRole];
    const requiredLevel = roleHierarchy[minimumRole];

    if (userLevel < requiredLevel) {
      return c.json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: `Insufficient permissions. Requires ${minimumRole} but you are ${userRole}.` 
        } 
      }, 403);
    }

    await next();
  });
};
