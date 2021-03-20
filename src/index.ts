import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import jwt from "express-jwt";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  APP_ACCESS_SECRET,
  DATABASE_URL,
  DB_CONNECTION,
  IS_PRODUCTION,
} from "./config";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { AuthResolver } from "./resolvers/auth";
import { PostResolver } from "./resolvers/post";
import { TestResolver } from "./resolvers/test";

const start = async () => {
  try {
    await createConnection({
      entities: [User, Post],
      synchronize: true,
      logging: !IS_PRODUCTION,
      type: DB_CONNECTION,
      url: DATABASE_URL,
    });

    const app = express();

    app.use(cookieParser());
    app.use(
      jwt({
        algorithms: ["HS256"],
        secret: APP_ACCESS_SECRET,
        credentialsRequired: false,
        getToken: (req) => req.cookies[ACCESS_TOKEN_COOKIE_NAME],
      })
    );

    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [TestResolver, AuthResolver, PostResolver],
        validate: false,
      }),
      context: ({ req, res }) => ({ req, res }),
    });

    server.applyMiddleware({ app, cors: false });

    app.listen(5000, () =>
      console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
      )
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
