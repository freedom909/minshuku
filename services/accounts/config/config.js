import dotenv from 'dotenv'
dotenv.config();

export const development = {
    username: "",
    password: "",
    database: "",
    host: "127.0.0.1",
    dialect: "mongodb",
    url: process.env.MONGODB_URL
};
export const test = {
    username: "",
    password: "",
    database: "",
    host: "127.0.0.1",
    dialect: "mongodb",
    url: process.env.MONGODB_URL
};
export const production = {
    username: "",
    password: "",
    database: "",
    host: "127.0.0.1",
    dialect: "mongodb",
    url: process.env.MONGODB_URL
};
export default {production,development,test}