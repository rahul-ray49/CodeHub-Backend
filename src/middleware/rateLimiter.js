const redisClient = require("../config/redis");

const createRateLimiter = ({
    windowSize = 60,
    maxRequests = 100
}) => {

    return async (req, res, next) => {

        try {

            const key =
                req.result?._id?.toString() ||
                req.ip;

            const redisKey = `rate_limit:${key}`;

            const currentTime = Date.now();

            const windowStart = currentTime - windowSize * 1000;

            let requests = await redisClient.get(redisKey);

            requests = requests ? JSON.parse(requests) : [];

            requests = requests.filter(
                timestamp => timestamp > windowStart
            );

            if (requests.length >= maxRequests) {

                return res.status(429).json({
                    success: false,
                    message: "Too many requests.",
                    retryAfter:
                        Math.ceil(
                            (requests[0] + windowSize * 1000 - currentTime)
                            /1000
                        )
                });

            }

            requests.push(currentTime);

            await redisClient.set(
                redisKey,
                JSON.stringify(requests),
                {
                    EX: windowSize
                }
            );

            await redisClient.set(
            redisKey,
            JSON.stringify(requests),
            {
                EX: windowSize
            }
        );

            res.setHeader(
                "X-RateLimit-Limit",
                maxRequests
            );

            next();

        } catch (error) {

            console.log(error);

            next();

        }

    };

};

module.exports = {
    globalLimiter: createRateLimiter({
        windowSize:60,
        maxRequests:100
    }),
    loginLimiter: createRateLimiter({
        windowSize:60,
        maxRequests:5
    }),
    registerLimiter: createRateLimiter({
        windowSize:60,
        maxRequests:3
    }),
    submitLimiter: createRateLimiter({
        windowSize:60,
        maxRequests:20
    }),
    runLimiter: createRateLimiter({
        windowSize:60,
        maxRequests:40
    }),
    aiLimiter: createRateLimiter({
        windowSize:60,
        maxRequests:10
    }),
    uploadLimiter: createRateLimiter({
        windowSize:3600,
        maxRequests:20
    }),
    historyLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 100
    }),
    createProblemLimiter: createRateLimiter({
        windowSize: 60,
        maxRequests: 10
    }),
    updateProblemLimiter: createRateLimiter({
        windowSize: 60,
        maxRequests: 20
    }),
    deleteProblemLimiter: createRateLimiter({
        windowSize: 60,
        maxRequests: 10
    }),
    problemFetchLimiter: createRateLimiter({
        windowSize: 60,
        maxRequests: 120
    }),
    videoFetchLimiter: createRateLimiter({
        windowSize: 60,
        maxRequests: 60
    }),
    logoutLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 20
    }),
    profileLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 100
    }),
    adminRegisterLimiter: createRateLimiter({
    windowSize: 3600,
    maxRequests: 10
    }),
    emailVerifyLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 10
    }),
    adminProblemLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 100
}),

uploadSignatureLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 30
}),

saveVideoLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 20
}),

deleteVideoLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 20
}),

aiChatLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 10
}),

aiAnalyzeLimiter: createRateLimiter({
    windowSize: 60,
    maxRequests: 5
}),

};