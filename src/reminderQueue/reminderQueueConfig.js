import dotenv from "dotenv";
dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
};

export { redisConfig };
