const redis = require('../config/redis');


const cache = (ttl = 60) => async (req, res, next) => {
  if (!redis) return next(); 

  const key = `cache:${req.user?.id ?? 'anon'}:${req.originalUrl}`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }
  } catch {
    return next(); 
  }

  
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      redis.setex(key, ttl, JSON.stringify(body)).catch(() => {});
    }
    res.setHeader('X-Cache', 'MISS');
    return originalJson(body);
  };

  next();
};


const bustUserCache = async (userId) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(`cache:${userId}:*`);
    if (keys.length) await redis.del(...keys);
  } catch {}
};

module.exports = { cache, bustUserCache };
