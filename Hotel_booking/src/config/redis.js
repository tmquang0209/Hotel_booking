import "dotenv/config";
import { createClient } from "redis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";

const redisClient = await createClient({
    url: `redis://${REDIS_HOST}:6379`,
})
    .on("error", (error) => {
        console.error(error);
    })
    .connect();
export default redisClient;
