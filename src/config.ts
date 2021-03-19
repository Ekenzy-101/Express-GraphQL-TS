import dotenv from "dotenv";
dotenv.config();

export const DB_CONNECTION = (process.env.DB_CONNECTION || "postgres") as
  | "postgres"
  | "mysql";
export const DATABASE_URL = process.env.DATABASE_URL!;

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const APP_ACCESS_SECRET = process.env.APP_ACCESS_SECRET!;
