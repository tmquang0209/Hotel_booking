import { createClient } from "redis";

const redisClient = await createClient({
    url: "redis://localhost:6379/0",
})
    .on("error", (error) => {
        console.error(error);
    })
    .connect();
export default redisClient;
