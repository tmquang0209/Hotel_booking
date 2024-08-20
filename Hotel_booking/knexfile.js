import "dotenv/config";

export default {
    development: {
        client: "mysql",
        connection: {
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        },
        migrations: {
            directory: "./src/database/migrations",
            tableName: "knex_migrations",
        },
        seeds: {
            directory: "./src/database/seeds",
        },
    },
};
