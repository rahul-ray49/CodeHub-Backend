const { createClient } = require('redis');
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: 19875
    }
});
console.log("REDIS_HOST:", process.env.REDIS_HOST);
console.log("REDIS_PASS exists:", !!process.env.REDIS_PASS);
module.exports=redisClient;


