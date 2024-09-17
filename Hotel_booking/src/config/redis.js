import { createClient } from "redis";
import { promisify } from "util";

const redisClient = await createClient({
    url: "redis://localhost:6379/0",
    
})
    .on("error", (error) => {
        console.error(error);
    })
    .connect();

export const redisSetAsync = promisify(redisClient.set).bind(redisClient);
export const redisGetAsync = promisify(redisClient.get).bind(redisClient);

export const hSetAsync = promisify(redisClient.hSet).bind(await createClient());
export const hGetAllAsync = promisify(redisClient.hGetAll).bind(redisClient);

export default redisClient;
