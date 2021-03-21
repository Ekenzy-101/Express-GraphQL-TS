import dotenv from "dotenv";
dotenv.config();

export const APP_ACCESS_SECRET = process.env.APP_ACCESS_SECRET!;

export const ACCESS_TOKEN_COOKIE_NAME = "token";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
