var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

(async () => {
    const redis = new Redis();
    const pong = await redis.ping();
    console.log(pong); // => PONG

    redis.disconnect();
})();