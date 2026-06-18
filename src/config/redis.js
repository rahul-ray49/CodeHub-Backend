const { createClient } = require('redis');
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: 19875
    }
});

module.exports=redisClient;


