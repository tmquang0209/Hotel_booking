import redisClient from "./src/config/redis";

// redis: tai sao phai dung redis, luu token vao redis, map theo id cua user
await redisClient.lPush("tokens", "token1");
await redisClient.lPush("tokens", "token2");
await redisClient.lPush("tokens", "token3");
// get all tokens
const tokens = await redisClient.lRange("tokens", 0, -1);
console.log(tokens);

// sets
await redisClient.sAdd("tokensSet", "token1");
await redisClient.sAdd("tokensSet", "token2");
await redisClient.sAdd("tokensSet", "token3");
await redisClient.sAdd("tokensSet", "token3");
await redisClient.sAdd("tokensSet", "token3");

// get all tokens
const tokensSet = await redisClient.sMembers("tokensSet");
console.log(tokensSet);

//sorted sets
await redisClient.zAdd("tokensSortedSet", 1, "token1");
await redisClient.zAdd("tokensSortedSet", 2, "token2");
await redisClient.zAdd("tokensSortedSet", 3, "token3");
// get all tokens
const tokensSortedSet = await redisClient.zRange("tokensSortedSet", 0, -1);
console.log(tokensSortedSet);

hash;
await redisClient.hSet("tokensHash", "token1", "token1");
await redisClient.hSet("tokensHash", "token2", "token2");
await redisClient.hSet("tokensHash", "token3", "token3");
// get all tokens
const tokensHash = await redisClient.hGetAll("tokensHash");
console.log(tokensHash);

// streams
await redisClient.xAdd("tokensStream", "*", ["token", "token1"]);
await redisClient.xAdd("tokensStream", "*", ["token", "token2"]);
await redisClient.xAdd("tokensStream", "*", ["token", "token3"]);

// get all tokens
const tokensStream = await redisClient.xRange("tokensStream", "-", "+");
